import algosdk from "algosdk";

const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_TOKEN = "";

/**
 * Get or compile bounty contract bytecode
 */
export async function getBountyBytecode() {
  const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, "");

  // Minimal approval program
  const approvalTealSource = `#pragma version 10
txn ApplicationID
bz create
int 1
return
create:
int 1
return`;

  const clearTealSource = `#pragma version 10
int 1`;

  console.log("📍 Compiling approval program...");
  const approvalCompiled = await algod.compile(approvalTealSource).do();
  const approvalProgram = new Uint8Array(
    atob(approvalCompiled.result)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  console.log("📍 Compiling clear program...");
  const clearCompiled = await algod.compile(clearTealSource).do();
  const clearProgram = new Uint8Array(
    atob(clearCompiled.result)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  return { approvalProgram, clearProgram };
}

/**
 * Create a bounty app on Algorand using connected wallet to sign
 * All transactions are built and signed client-side
 */
export async function createBountyWithWallet(
  creatorAddress: string,
  amount: number, // ALGO
  transactionSigner: (
    txnGroup: algosdk.Transaction[],
    indexesToSign: number[]
  ) => Promise<Uint8Array[]>
): Promise<{ appId: number; appAddress: string; txnId: string }> {
  try {
    const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, "");

    console.log("📍 Step 1: Getting network parameters...");
    const suggestedParams = await algod.getTransactionParams().do();

    // Get the TEAL bytecode
    console.log("📍 Step 2: Loading contract bytecode...");
    const { approvalProgram, clearProgram } = await getBountyBytecode();

    console.log("📍 Step 3: Building ApplicationCreateTxn...");
    // Create the application creation transaction
    const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
      sender: creatorAddress,
      approvalProgram,
      clearProgram,
      numGlobalInts: 10,
      numGlobalByteSlices: 10,
      numLocalInts: 0,
      numLocalByteSlices: 0,
      onComplete: 0, // OnComplete.NoOp
      suggestedParams,
    });

    console.log("📍 Step 4: GroupID assignment...");
    const transactions = [appCreateTxn];
    algosdk.assignGroupID(transactions);

    console.log("📍 Step 5: Requesting wallet signature...");
    // Request wallet to sign - pass Transaction[] and indices
    const signedTxns = await transactionSigner(transactions, [0]);
    console.log("✅ Wallet signed transactions!");

    console.log("📍 Step 6: Sending to network...");
    // Send signed transactions
    const sendResponse = await algod.sendRawTransaction(signedTxns[0]).do();
    const txId = sendResponse.txid; // lowercase txid

    console.log(`📍 Step 7: Waiting for confirmation (txn: ${txId})`);
    // Wait for confirmation
    const result = await algosdk.waitForConfirmation(algod, txId, 4);

    // Extract app ID from transaction result
    const createdAppId = result.applicationIndex;
    if (!createdAppId) {
      throw new Error("Failed to extract app ID from transaction");
    }

    const appAddress = algosdk.getApplicationAddress(createdAppId);
    console.log(`✅ App Created! ID: ${createdAppId}, Address: ${appAddress}`);

    // Now fund the app with min balance
    console.log(`📍 Step 8: Funding app with min balance...`);
    const minBalanceAmount = 100_000; // 0.1 ALGO
    const freshParams = await algod.getTransactionParams().do();
    const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: creatorAddress,
      receiver: appAddress,
      amount: minBalanceAmount,
      suggestedParams: freshParams,
    });

    algosdk.assignGroupID([fundTxn]);
    const fundSigned = await transactionSigner([fundTxn], [0]);

    const fundResponse = await algod.sendRawTransaction(fundSigned[0]).do();
    const fundTxId = fundResponse.txid; // lowercase txid

    await algosdk.waitForConfirmation(algod, fundTxId, 4);
    console.log(`✅ App funded with min balance!`);

    return {
      appId: Number(createdAppId),
      appAddress: String(appAddress),
      txnId: txId,
    };
  } catch (error) {
    console.error("❌ Error creating bounty:", error);
    throw error;
  }
}

/**
 * Call the create_bounty method on deployed app
 */
export async function callCreateBountyMethod(
  appId: number,
  creatorAddress: string,
  bountyAmount: number, // ALGO
  transactionSigner: (
    txnGroup: algosdk.Transaction[],
    indexesToSign: number[]
  ) => Promise<Uint8Array[]>
): Promise<string> {
  try {
    const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, "");

    console.log("📍 Calling create_bounty method...");
    const suggestedParams = await algod.getTransactionParams().do();

    // Build app call transaction
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: creatorAddress,
      appIndex: appId,
      appArgs: [
        new TextEncoder().encode("create_bounty"),
        algosdk.encodeUint64(Math.floor(bountyAmount * 1_000_000)),
      ],
      suggestedParams,
    });

    algosdk.assignGroupID([appCallTxn]);
    const signedTxns = await transactionSigner([appCallTxn], [0]);

    const response = await algod.sendRawTransaction(signedTxns[0]).do();
    const txId = response.txid; // Extract txid from response

    await algosdk.waitForConfirmation(algod, txId, 4);
    console.log("✅ create_bounty method called!");

    return txId;
  } catch (error) {
    console.error("❌ Error calling create_bounty:", error);
    throw error;
  }
}
