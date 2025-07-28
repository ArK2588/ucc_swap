const TronEscrowLite = artifacts.require("TronEscrowLite");
const TestToken = artifacts.require("TestToken");

module.exports = function (deployer, network, accounts) {
    deployer.then(async () => {
        console.log("⚡ DEPLOYING ENERGY-EFFICIENT ESCROW");
        console.log("==================================");
        
        const maker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD";
        const taker = "TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD";
        const tokenAddress = "TL9esDt9KSsCpouSE4CcexC3Tp39JoeQmy"; // Nile TestToken address
        const amount = "100000000000000000000"; // 100 tokens
        const hashlock = "0x827054d73db8ea5de5b4a91c0a97adef7a5549c431a50064bc4957d0c0ffa7ea";
        const withdrawDelay = 300; // 5 minutes
        const cancelDelay = 600;   // 10 minutes
        const safetyDeposit = "2000000"; // 2 TRX
        
        console.log("Parameters:");
        console.log("- Safety deposit: 2 TRX");
        console.log("- Token amount: 100 TEST");
        console.log("- Delays: 5min withdraw, 10min cancel");
        
        try {
            const token = await TestToken.at(tokenAddress);
            console.log("✅ Token loaded");
            
            // Deploy lite escrow
            const escrow = await deployer.deploy(
                TronEscrowLite,
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
            
            console.log("✅ TronEscrowLite deployed at:", escrow.address);
            
            // Approve tokens
            await token.approve(escrow.address, amount, { from: maker });
            console.log("✅ Tokens approved");
            
            console.log("");
            console.log("🎉 SUCCESS! Lightweight escrow is working!");
            console.log("Address:", escrow.address);
            console.log("");
            console.log("To test withdrawal:");
            console.log("Secret: 'test_secret_123'");
            console.log("Wait 5 minutes, then call withdraw() with the secret");
            
        } catch (error) {
            console.error("❌ Failed:", error.message);
            
            if (error.message.includes("bandwidth/energy")) {
                console.log("");
                console.log("💡 SOLUTION:");
                console.log("1. Go to https://shasta.tronex.io/");
                console.log("2. Click 'Get Energy' (not just TRX)");
                console.log("3. Enter: TTt12UTE9bAY7cGPmqrTkDwi7Ja89vRYMD");
                console.log("4. Wait 2-3 minutes");
                console.log("5. Try deployment again");
            }
        }
    });
};
