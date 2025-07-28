// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title HTLCEscrow
 * @dev Hash Time Lock Contract for cross-chain atomic swaps using native TRX
 * @notice Simple, gas-efficient escrow for 1inch-style cross-chain swaps
 */
contract HTLCEscrow {
    
    address public maker;      // Who created the escrow
    address public taker;      // Who can claim with secret
    bytes32 public hashlock;   // Hash of the secret
    uint256 public amount;     // TRX amount locked
    uint256 public timelock;   // When cancellation becomes possible
    bool public withdrawn;     // Has been withdrawn
    bool public cancelled;     // Has been cancelled
    
    event EscrowCreated(
        address indexed maker,
        address indexed taker,
        uint256 amount,
        bytes32 hashlock,
        uint256 timelock
    );
    
    event EscrowWithdrawn(address indexed taker, bytes32 secret);
    event EscrowCancelled(address indexed maker);
    
    /**
     * @dev Create escrow with TRX
     * @param _taker Who can claim the funds
     * @param _hashlock Hash of secret (use keccak256)
     * @param _timelock Seconds from now when maker can cancel
     */
    constructor(
        address _taker,
        bytes32 _hashlock,
        uint256 _timelock
    ) payable {
        require(msg.value > 0, "Must send TRX");
        require(_taker != address(0), "Invalid taker");
        require(_hashlock != bytes32(0), "Invalid hashlock");
        require(_timelock > 0, "Invalid timelock");
        
        maker = msg.sender;
        taker = _taker;
        hashlock = _hashlock;
        amount = msg.value;
        timelock = block.timestamp + _timelock;
        
        emit EscrowCreated(maker, taker, amount, hashlock, timelock);
    }
    
    /**
     * @dev Taker withdraws by revealing secret
     * @param _secret The secret that matches hashlock
     */
    function withdraw(bytes32 _secret) external {
        require(!withdrawn && !cancelled, "Already completed");
        require(msg.sender == taker, "Only taker can withdraw");
        require(keccak256(abi.encodePacked(_secret)) == hashlock, "Wrong secret");
        require(block.timestamp < timelock, "Too late to withdraw");
        
        withdrawn = true;
        payable(taker).transfer(amount);
        
        emit EscrowWithdrawn(taker, _secret);
    }
    
    /**
     * @dev Maker cancels after timelock expires
     */
    function cancel() external {
        require(!withdrawn && !cancelled, "Already completed");
        require(msg.sender == maker, "Only maker can cancel");
        require(block.timestamp >= timelock, "Too early to cancel");
        
        cancelled = true;
        payable(maker).transfer(amount);
        
        emit EscrowCancelled(maker);
    }
    
    /**
     * @dev Check current status
     */
    function getStatus() external view returns (
        address _maker,
        address _taker,
        uint256 _amount,
        bytes32 _hashlock,
        uint256 _timelock,
        bool _withdrawn,
        bool _cancelled,
        uint256 _currentTime
    ) {
        return (maker, taker, amount, hashlock, timelock, withdrawn, cancelled, block.timestamp);
    }
}
