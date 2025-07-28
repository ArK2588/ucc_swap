// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title SimpleEscrow
 * @dev Minimal escrow contract for testing deployment
 */
contract SimpleEscrow {
    address public maker;
    address public taker;
    uint256 public amount;
    bytes32 public hashlock;
    bool public completed;
    
    event EscrowCreated(address maker, address taker, uint256 amount);
    event EscrowCompleted(address taker);
    
    constructor(address _taker, uint256 _amount, bytes32 _hashlock) payable {
        maker = msg.sender;
        taker = _taker;
        amount = _amount;
        hashlock = _hashlock;
        completed = false;
        
        emit EscrowCreated(maker, taker, amount);
    }
    
    function withdraw(bytes32 secret) external {
        require(!completed, "Already completed");
        require(msg.sender == taker, "Only taker can withdraw");
        require(keccak256(abi.encodePacked(secret)) == hashlock, "Invalid secret");
        
        completed = true;
        payable(taker).transfer(address(this).balance);
        
        emit EscrowCompleted(taker);
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
