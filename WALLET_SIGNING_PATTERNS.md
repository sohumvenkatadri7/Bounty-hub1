# 🎯 Frontend Wallet Signing - Code Patterns

## Pattern 1: Connect Wallet

```typescript
import { useWallet } from "@txnlab/use-wallet-react";

function MyComponent() {
  const { activeAddress, transactionSigner } = useWallet();
  
  if (!activeAddress) {
    return <p>Please connect wallet</p>;
  }
  
  return <p>Connected: {activeAddress}</p>;
}
```

## Pattern 2: Build Transaction

```typescript
import algosdk from "algosdk";

const algod = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

// Get network params
const suggestedParams = await algod.getTransactionParams().do();

// Build payment transaction
const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
  sender: activeAddress,      // Creator's wallet
  receiver: "RECEIVER_ADDR",
  amount: 1_000_000,          // 1 ALGO
  suggestedParams,
});
```

## Pattern 3: Request Wallet Signature

```typescript
// This is the MAGIC LINE that triggers Pera popup!
const signedTxns = await transactionSigner(
  [txn],           // Array of unsigned transactions
  [0]              // Which indices to sign (0 = first tx)
);

// User sees Pera popup
// User clicks "Sign"
// Wallet signs with their private key
// Returns: Array of signed transaction blobs

const signedBlob = signedTxns[0];  // Uint8Array
```

## Pattern 4: Send to Network

```typescript
// Submit signed transaction
const txId = await algod.sendRawTransaction(signedBlob).do();

// Wait for confirmation
const result = await algosdk.waitForConfirmation(algod, txId, 4);

console.log("Transaction ID:", txId);
console.log("Confirmed:", result);
```

## Pattern 5: Create Application

```typescript
const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
  sender: activeAddress,
  approvalProgram: new Uint8Array([...]),   // Compiled TEAL
  clearProgram: new Uint8Array([...]),      // Compiled TEAL
  globalStateSchema: new algosdk.StateSchema(10, 10),
  localStateSchema: new algosdk.StateSchema(0, 0),
  suggestedParams,
});

// Sign it
const signed = await transactionSigner([appCreateTxn], [0]);
const txId = await algod.sendRawTransaction(signed[0]).do();

// Extract app ID
const result = await algosdk.waitForConfirmation(algod, txId, 4);
const appId = result.applicationIndex;
```

## Pattern 6: Call App Method

```typescript
const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
  sender: activeAddress,
  appIndex: appId,
  appArgs: [
    new TextEncoder().encode("method_name"),
    algosdk.encodeUint64(12345),
  ],
  suggestedParams,
});

const signed = await transactionSigner([appCallTxn], [0]);
await algod.sendRawTransaction(signed[0]).do();
```

## Pattern 7: Group Transaction

```typescript
// Multiple transactions
const txn1 = algosdk.makeApplicationCreateTxnFromObject({...});
const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({...});

// Assign group ID
algosdk.assignGroupID([txn1, txn2]);

// Sign both
const signedTxns = await transactionSigner([txn1, txn2], [0, 1]);

// Send both
for (const signed of signedTxns) {
  await algod.sendRawTransaction(signed).do();
}
```

## Pattern 8: Compile TEAL

```typescript
const algod = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");

const tealSource = `#pragma version 10
txn ApplicationID
bz create
int 1
return
create:
int 1
return`;

const compiled = await algod.compile(tealSource).do();

// Convert base64 to Uint8Array
const program = new Uint8Array(
  atob(compiled.result)
    .split("")
    .map(c => c.charCodeAt(0))
);
```

## Pattern 9: Full Create Template

```typescript
async function createBounty(
  title: string,
  description: string,
  reward: number,
  activeAddress: string,
  transactionSigner: (txns: algosdk.Transaction[], indices: number[]) => Promise<Uint8Array[]>
) {
  const algod = new algosdk.Algodv2("", "https://testnet-api.algonode.cloud", "");
  
  // 1. Get params
  const suggestedParams = await algod.getTransactionParams().do();
  
  // 2. Build app creation
  const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    sender: activeAddress,
    approvalProgram: new Uint8Array([...]),
    clearProgram: new Uint8Array([...]),
    globalStateSchema: new algosdk.StateSchema(10, 10),
    localStateSchema: new algosdk.StateSchema(0, 0),
    suggestedParams,
  });
  
  // 3. Sign it
  console.log("Requesting wallet signature...");
  const signedTxns = await transactionSigner([appCreateTxn], [0]);
  console.log("✅ Wallet signed!");
  
  // 4. Send to network
  const txId = await algod.sendRawTransaction(signedTxns[0]).do();
  console.log("Transaction ID:", txId);
  
  // 5. Wait for confirmation
  const result = await algosdk.waitForConfirmation(algod, txId, 4);
  const appId = result.applicationIndex;
  
  return {
    appId,
    appAddress: algosdk.getApplicationAddress(appId),
    txId,
  };
}
```

## Pattern 10: Error Handling

```typescript
try {
  const signed = await transactionSigner([txn], [0]);
  const txId = await algod.sendRawTransaction(signed[0]).do();
  const result = await algosdk.waitForConfirmation(algod, txId, 4);
  
  console.log("✅ Success!");
  return result;
} catch (err) {
  if (err instanceof Error) {
    console.error("❌ Error:", err.message);
    
    if (err.message.includes("User rejected")) {
      // User clicked "Cancel" in Pera
      setError("You rejected the transaction");
    } else if (err.message.includes("insufficient")) {
      // Not enough ALGO
      setError("Insufficient funds");
    } else {
      setError(err.message);
    }
  }
}
```

---

## ✨ Key Points

1. **`transactionSigner(txns, indices)`** - Always async
2. **User must approve** - Wallet popup appears
3. **Never blocks** - Use loading states
4. **Multiple txns** - Use `assignGroupID()`
5. **Direct to network** - No backend needed
6. **Testnet vs Mainnet** - Just change ALGOD_SERVER

---

**Copy these patterns into your code! They all use the same principles.**
