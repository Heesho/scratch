// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ScratchTicket.sol";

// TODO: 
// transfer ownership of ticket from factory to msg.sender
// set up fees and treasury on scratch ticket buy
// start testing locally
// integrate chainlink vrf 2.5 for random number generation

contract ScratchTicketFactory is Ownable {
    using SafeERC20 for IERC20;

    /*----------  CONSTANTS  --------------------------------------------*/

    uint256 public constant NAME_MAX_LENGTH = 80; // Max length of meme token name
    uint256 public constant SYMBOL_MAX_LENGTH = 8; // Max length of meme token symbol
    uint256 public constant MAX_FEE = 1000; // Max fee for treasury

    /*----------  STATE VARIABLES  --------------------------------------*/

    address public treasury;
    uint256 public fee = 200; // 2% fee

    uint256 public index;
    mapping(uint256 => address) public index_Ticket;

    /*----------  ERRORS ------------------------------------------------*/

    error ScratchTicketFactory__InvalidName();
    error ScratchTicketFactory__InvalidSymbol();
    error ScratchTicketFactory__FeeTooHigh();

    /*----------  EVENTS ------------------------------------------------*/

    event ScratchTicketFactory__ScratchTicketDeployed(address indexed creator, address indexed ticket);
    event ScratchTicketFactory__TreasurySet(address indexed treasury);
    event ScratchTicketFactory__FeeSet(uint256 indexed fee);

    /*----------  FUNCTIONS ---------------------------------------------*/

    constructor() {
        treasury = msg.sender;
    }

    function createScratchTicket(
        string memory name,
        string memory symbol,
        address paymentToken,
        address payoutToken,
        uint256 ticketPrice,
        uint256[] memory amounts,
        uint256[] memory payouts,
        uint256 expiration
    ) external returns (address) {
        if (bytes(name).length == 0) revert ScratchTicketFactory__InvalidName();
        if (bytes(symbol).length == 0) revert ScratchTicketFactory__InvalidSymbol();
        if (bytes(name).length > NAME_MAX_LENGTH) revert ScratchTicketFactory__InvalidName();
        if (bytes(symbol).length > SYMBOL_MAX_LENGTH) revert ScratchTicketFactory__InvalidSymbol();

        address ticket = address(new ScratchTicket(
            name, 
            symbol, 
            address(this),
            paymentToken, 
            payoutToken, 
            ticketPrice, 
            amounts, 
            payouts, 
            expiration
        ));
        index++;
        index_Ticket[index] = ticket;

        uint256 cost = ScratchTicket(ticket).totalDeposit();

        IERC20(payoutToken).transferFrom(msg.sender, address(this), cost);
        IERC20(payoutToken).safeApprove(ticket, 0);
        IERC20(payoutToken).safeApprove(ticket, cost);
        ScratchTicket(ticket).initialize();
        ScratchTicket(ticket).transferOwnership(msg.sender);
        
        emit ScratchTicketFactory__ScratchTicketDeployed(msg.sender, ticket);
        return ticket;
    }

    /*----------  RESTRICTED FUNCTIONS  ---------------------------------*/

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
        emit ScratchTicketFactory__TreasurySet(_treasury);
    }

    function setFee(uint256 _fee) external onlyOwner {
        if (_fee > MAX_FEE) revert ScratchTicketFactory__FeeTooHigh();
        fee = _fee;
        emit ScratchTicketFactory__FeeSet(_fee);
    }

}
