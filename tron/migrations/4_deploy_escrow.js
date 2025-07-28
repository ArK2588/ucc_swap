const TronEscrowSimplified = artifacts.require("TronEscrowSimplified");
const TestToken = artifacts.require("TestToken");

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        console.log("Available accounts:", accounts);
        console.log("Network:", network);
        
        // Use the deployer address from the private key
        const maker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD"; // Your known address
        const taker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD"; // Same address for testing
        const tokenAddress = "TL9esDt9KSsCpouSE4CcexC3Tp39JoeQmy"; // NEW Nile TestToken address
        const amount = "100000000000000000000"; // 100 tokens
        const hashlock = "0x827054d73db8ea5de5b4a91c0a97adef7a5549c431a50064bc4957d0c0ffa7ea";
        const withdrawDelay = 300; // 5 minutes
        const cancelDelay = 600;   // 10 minutes
        const safetyDeposit = "10000000"; // 10 TRX in sun units (safe amount)
        
        console.log("Deploying escrow with:");
        console.log("Maker:", maker);
        console.log("Taker:", taker);
        console.log("Token:", tokenAddress);
        console.log("Amount: 100 TEST tokens");
        console.log("Hashlock:", hashlock);
        console.log("Withdraw delay:", withdrawDelay, "seconds");
        console.log("Cancel delay:", cancelDelay, "seconds");
        console.log("Safety deposit: 2 TRX");
        
        try {
            // Get the token contract instance
            const token = await TestToken.at(tokenAddress);
            console.log("Token contract loaded");
            
            // Check maker's balance
            const balance = await token.balanceOf(maker);
            console.log("Maker balance:", balance.toString(), "sun units");
            
            // Approve token spending for the escrow contract
            // Note: We need to deploy escrow first to get its address, then approve
            console.log("Deploying TronEscrowSimplified...");
            
            // Deploy escrow contract
            const escrow = await deployer.deploy(
                TronEscrowSimplified,
                taker,
                tokenAddress,
                amount,
                hashlock,
                withdrawDelay,
                cancelDelay,
                { 
                    value: safetyDeposit,
                    from: maker
                }
            );
            
            console.log("✅ Escrow deployed at:", escrow.address);
            
            // Now approve the escrow contract to spend tokens
            console.log("Approving token spending...");
            await token.approve(escrow.address, amount, { from: maker });
            console.log("✅ Token spending approved");
            
            console.log("");
            console.log("🎉 Deployment successful!");
            console.log("Contract addresses:");
            console.log("- TestToken:", tokenAddress);
            console.log("- TronEscrowSimplified:", escrow.address);
            console.log("");
            console.log("Test parameters for withdrawal:");
            console.log("- Secret: 'test_secret_123'");
            console.log("- Secret (bytes32): 0x746573745f7365637265745f3132330000000000000000000000000000000000");
            console.log("- Hashlock:", hashlock);
            
        } catch (error) {
            console.error("❌ Deployment failed:", error);
            throw error;
        }
    });
};
