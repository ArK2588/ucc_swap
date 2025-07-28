const HTLCEscrow = artifacts.require("HTLCEscrow");

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        console.log("🚀 DEPLOYING HTLC ESCROW (NATIVE TRX)");
        console.log("====================================");
        console.log("Network:", network);
        console.log("Account:", accounts[0] || "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD");
        
        // Simple test parameters
        const maker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD";
        const taker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD"; // Same for testing
        const secret = "test_secret_123";
        const hashlock = "0x827054d73db8ea5de5b4a91c0a97adef7a5549c431a50064bc4957d0c0ffa7ea"; // keccak256(secret)
        const timelock = 300; // 5 minutes
        const escrowAmount = "3000000"; // 3 TRX
        
        console.log("Parameters:");
        console.log("- Escrow amount: 3 TRX");
        console.log("- Timelock: 5 minutes");
        console.log("- Secret:", secret);
        console.log("- Hashlock:", hashlock);
        
        try {
            const escrow = await deployer.deploy(
                HTLCEscrow,
                taker,
                hashlock,
                timelock,
                { 
                    value: escrowAmount,
                    from: maker
                }
            );
            
            console.log("✅ HTLCEscrow deployed at:", escrow.address);
            console.log("✅ Contract balance: 3 TRX");
            
            // Get status
            const status = await escrow.getStatus();
            console.log("");
            console.log("📊 Escrow Status:");
            console.log("- Maker:", status._maker);
            console.log("- Taker:", status._taker);
            console.log("- Amount:", status._amount.toString(), "sun");
            console.log("- Timelock:", new Date(status._timelock * 1000).toISOString());
            console.log("- Withdrawn:", status._withdrawn);
            console.log("- Cancelled:", status._cancelled);
            
            console.log("");
            console.log("🧪 TO TEST:");
            console.log("1. Wait 0-5 minutes");
            console.log("2. Call withdraw() with secret:", secret);
            console.log("3. Or wait 5+ minutes and call cancel()");
            
        } catch (error) {
            console.error("❌ Deployment failed:", error.message);
        }
    });
};
