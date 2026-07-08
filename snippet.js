// Example logic workflow for JavaScript / TypeScript SDK
import { Server } from "@stellar/stellar-sdk";
const server = new Server("https://horizon.stellar.org");

async function safelySubmit(transaction) {
  try {
    const response = await server.submitTransaction(transaction);
    return response; // Happy path
  } catch (error) {
    // Check if it's a 504 Timeout
    if (error.response && error.response.status === 504) {
      const txHash = transaction.hash().toString("hex");
      
      // 1. Poll to check if it actually made it on-chain anyway
      for (let i = 0; i < 5; i++) {
        await new Promise(res => setTimeout(res, 5000)); // wait 5s
        try {
          const txCheck = await server.transactions().transaction(txHash).call();
          if (txCheck) return txCheck; // Transaction was successful!
        } catch (e) {
          // 404 means still pending or dropped, continue loop
        }
      }
      
      // 2. If completely dropped and TimeBounds expired, rebuild with higher fee
      // Do NOT just reuse the exact same fee if the network is congested
      console.log("Transaction timed out and was dropped. Re-submit with higher fee.");
    }
    throw error;
  }
}

