// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./ScratchTicket.sol";

contract ScratchTicketFactory {
    address[] public deployedContracts;

    event ScratchTicketCreated(address indexed creator, address scratchTicketAddress);

    function createScratchTicket(
        string memory name,
        string memory symbol,
        uint256 ticketPrice,
        address payoutToken,   // ERC20 token contract
        uint256[] memory payouts, // Payout values [1000, 100, 10, 1]
        uint256[] memory ticketAmounts, // Number of tickets for each payout [1, 10, 100, 1000]
        uint256 expirationDate
    ) public {
        require(payouts.length == ticketAmounts.length, "Payout and ticket amounts arrays must have the same length");

        // Deploy a new ScratchTicket contract for the customer
        ScratchTicket newScratchTicket = new ScratchTicket(
            name,
            symbol,
            ticketPrice,
            payoutToken,
            payouts,
            ticketAmounts,
            expirationDate,
            msg.sender  // The customer is the creator
        );

        // Store the address of the deployed ScratchTicket contract
        deployedContracts.push(address(newScratchTicket));

        emit ScratchTicketCreated(msg.sender, address(newScratchTicket));
    }

    // Get all deployed contracts
    function getDeployedContracts() public view returns (address[] memory) {
        return deployedContracts;
    }
}
