// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IScratchTicketFactory {
    function treasury() external returns (address);
    function fee() external returns (uint256);
}

contract ScratchTicket is ERC721URIStorage, Ownable {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    uint256 public constant DIVISOR = 10000; // Divisor for fee calculation

    /*----------  STATE VARIABLES  --------------------------------------*/

    struct Ticket {
        bool scratched;
        uint256 outcome;  // 0: No win, >0: amount won
        bool claimed;
    }

    bool public initialized;

    address public factory;

    // Ticket and prize-related settings
    address public paymentToken;
    address public payoutToken;

    uint256 public ticketPrice;
    uint256 public ticketsMinted;
    uint256 public totalTickets;
    uint256 public totalDeposit;
    uint256 public expiration;

    uint256[] public amounts; // amount of tickets for each outcome
    uint256[] public payouts; // payout for each outcome

    mapping(uint256 => Ticket) public tokenId_Ticket;

    /*----------  ERRORS ------------------------------------------------*/

    error ScratchTicket__NotInitialized();
    error ScratchTicket__InvalidAmounts();
    error ScratchTicket__InvalidPayouts();
    error ScratchTicket__InvalidExpiration();
    error ScratchTicket__StillActive();
    error ScratchTicket__NotOwner();
    error ScratchTicket__AlreadyScratched();
    error ScratchTicket__AlreadyClaimed();
    error ScratchTicket__NotScratched();
    error ScratchTicket__Expired();
    error ScratchTicket__NoReward();

    /*----------  EVENTS ------------------------------------------------*/

    event ScratchTicket__Initialized();
    event ScratchTicket__Minted(uint256 tokenId, address owner);
    event ScratchTicket__Scratched(uint256 tokenId, uint256 outcome);
    event ScratchTicket__Claimed(uint256 tokenId, uint256 reward);
    event ScratchTicket__Bought(address recipient, uint256 amount);
    event ScratchTicket__OwnerMinted(address recipient, uint256 amount);

    /*---------  MODIFIERS  --------------------------------------------*/

    modifier isInitialized() {
        if (!initialized) revert ScratchTicket__NotInitialized();
        _;
    }

    /*----------  FUNCTIONS  --------------------------------------------*/

    constructor(
        string memory name,
        string memory symbol,
        address _factory,
        address _paymentToken,
        address _payoutToken,
        uint256 _ticketPrice,
        uint256[] memory _amounts,
        uint256[] memory _payouts,
        uint256 _expiration
    ) ERC721(name, symbol) {
        if (_amounts.length == 0) revert ScratchTicket__InvalidAmounts();
        if (_payouts.length != _amounts.length) revert ScratchTicket__InvalidPayouts();
        if (_expiration <= block.timestamp) revert ScratchTicket__InvalidExpiration();

        factory = _factory;

        paymentToken = _paymentToken;
        payoutToken = _payoutToken;

        ticketPrice = _ticketPrice;
        amounts = _amounts;
        payouts = _payouts;
        expiration = _expiration;

        for (uint256 i = 0; i < _payouts.length; i++) {
            totalDeposit += _payouts[i] * _amounts[i];
            totalTickets += _amounts[i];
        }
    }

    function buy(address recipient, uint256 amount) external isInitialized {
        for (uint256 i = 0; i < amount; i++) {
            _mint(recipient);
        }

        uint256 cost = amount * ticketPrice;
        uint256 fee = (cost * IScratchTicketFactory(factory).fee()) / DIVISOR;

        IERC20(paymentToken).transferFrom(msg.sender, IScratchTicketFactory(factory).treasury(), fee);
        IERC20(paymentToken).transferFrom(msg.sender, address(this), cost - fee);

        emit ScratchTicket__Bought(recipient, amount);
    }

    function scratch(uint256 tokenId) external isInitialized {
        if (ownerOf(tokenId) != msg.sender) revert ScratchTicket__NotOwner();
        if (tokenId_Ticket[tokenId].scratched) revert ScratchTicket__AlreadyScratched();

        tokenId_Ticket[tokenId].scratched = true;

        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender
        )));

        _fulfillRandomWords(tokenId, random);
    }

    function claim(uint256 tokenId) external isInitialized {
        if (ownerOf(tokenId) != msg.sender) revert ScratchTicket__NotOwner();
        if (!tokenId_Ticket[tokenId].scratched) revert ScratchTicket__NotScratched();
        if (block.timestamp > expiration) revert ScratchTicket__Expired();
        if (tokenId_Ticket[tokenId].claimed) revert ScratchTicket__AlreadyClaimed();
        if (tokenId_Ticket[tokenId].outcome == 0) revert ScratchTicket__NoReward();

        uint256 reward = tokenId_Ticket[tokenId].outcome;
        tokenId_Ticket[tokenId].claimed = true;

        IERC20(payoutToken).transfer(msg.sender, reward);
        emit ScratchTicket__Claimed(tokenId, reward);
    }

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function initialize() external onlyOwner {
        initialized = true;
        IERC20(payoutToken).transferFrom(msg.sender, address(this), totalDeposit);
        emit ScratchTicket__Initialized();
    }

    function mint(address recipient, uint256 amount) external onlyOwner {
        for (uint256 i = 0; i < amount; i++) {
            _mint(recipient);
        }
        emit ScratchTicket__OwnerMinted(recipient, amount);
    }

    function withdraw(address recipient, address token) external onlyOwner {
        if (token == payoutToken) {
            if (block.timestamp < expiration) revert ScratchTicket__StillActive();
            uint256 balance = IERC20(payoutToken).balanceOf(address(this));
            IERC20(payoutToken).transfer(recipient, balance);
        } else {
            uint256 balance = IERC20(token).balanceOf(address(this));
            IERC20(token).transfer(recipient, balance);
        }
    }

    /*----------  INTERNAL FUNCTIONS  ---------------------------------*/

    function _fulfillRandomWords(uint256 tokenId,uint256 randomWords) internal {
        uint256 randomValue = randomWords % totalTickets;
        uint256 cumulativeTickets = 0;

        for (uint256 i = 0; i < payouts.length; i++) {
            if (amounts[i] == 0) continue;

            cumulativeTickets += amounts[i];
            if (randomValue < cumulativeTickets) {
                tokenId_Ticket[tokenId].outcome = payouts[i];
                amounts[i] -= 1;
                totalTickets -= 1;
                break;
            }
        }

        emit ScratchTicket__Scratched(tokenId, tokenId_Ticket[tokenId].outcome);
    }

    function _mint(address recipient) internal {
        if (totalTickets == 0) revert ScratchTicket__InvalidAmounts();

        uint256 newTicketId = ticketsMinted + 1;
        _safeMint(recipient, newTicketId);
        ticketsMinted += 1;

        emit ScratchTicket__Minted(newTicketId, recipient);
    }

}
