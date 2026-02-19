# 🚀 Pure Frontend dApp - Bounty Creation

## 🎯 What Just Happened

You now have a **100% client-side Algorand dApp** that:

✅ Creates smart contracts on-chain  
✅ Uses connected wallet (Pera) to sign ALL transactions  
✅ No backend, no private keys in code  
✅ Everything happens in the browser  

---

## 🏗️ Architecture

```
User's Browser (React + Vite)
    ↓
Wallet (Pera Wallet)
    ↓
Connected User Wallet Signs
    ↓
Frontend builds unsigned txns using algosdk
    ↓
Wallet popup → User approves
    ↓
Signed txns sent directly to Algorand network
    ↓
App deployed on-chain
```

---

## 🔄 Flow When User Clicks "Publish Bounty"

### Step 1️⃣: Frontend Builds Transactions

```typescript
// CreateBountyModal.tsx
const appResult = await createBountyWithWallet(
  activeAddress,           // Your wallet address
  Number(reward),          // e.g., 5 ALGO
  transactionSigner        // Pera Wallet connector
);
```

### Step 2️⃣: Compile Contract

```typescript
// bountyService.ts - getBountyBytecode()
algod.compile(approvalTealSource).do()
algod.compile(clearTealSource).do()
// Returns: Uint8Array bytecode
```

### Step 3️⃣: Create App Transaction

```typescript
const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
  sender: creatorAddress,
  approvalProgram,
  clearProgram,
  globalStateSchema,
  localStateSchema,
  suggestedParams,
});
```

### Step 4️⃣: Ask Wallet to Sign

```typescript
// This triggers Pera Wallet popup!
const signedTxns = await transactionSigner(
  [appCreateTxn],  // Unsigned transaction
  [0]              // Which tx's to sign (index 0)
);
// User sees Pera popup → approves → signs
```

### Step 5️⃣: Send to Network

```typescript
const txId = await algod.sendRawTransaction(
  signedTxns[0]  // Signed blob
).do();

// Wait for confirmation
const result = await algosdk.waitForConfirmation(
  algod, 
  txId, 
  4  // 4 blocks
);

// Extract app ID
const appId = result.applicationIndex;
```

### Step 6️⃣: Fund App

```typescript
// Send min balance to new app account
const minBalance = 100_000; // 0.1 ALGO
const fundTxn = makePaymentTxn({
  sender: creatorAddress,
  receiver: appAddress,
  amount: minBalance,
});

// Sign again with wallet
const fundSigned = await transactionSigner([fundTxn], [0]);
await algod.sendRawTransaction(fundSigned[0]).do();
```

---

## 📁 Files Modified

### Frontend

| File | Purpose |
|------|---------|
| `src/utils/bountyService.ts` | **NEW** - All transaction building & signing logic |
| `src/components/bounty/CreateBountyModal.tsx` | Updated - Calls bountyService functions |

### How It Works

**bountyService.ts** exports:
- `getBountyBytecode()` - Compiles TEAL contracts
- `createBountyWithWallet()` - Creates app + funds it
- `callCreateBountyMethod()` - Calls methods on deployed app

**CreateBountyModal.tsx** orchestrates:
1. Get wallet address & signer from `useWallet()`
2. Call `createBountyWithWallet()` 
3. Show user progress (compiling, signing, confirming)
4. Display success with app ID

---

## 🔑 Key Concepts

### Wallet Signer Function Signature

```typescript
transactionSigner: (
  txnGroup: algosdk.Transaction[],  // Unsigned txns
  indexesToSign: number[]            // Which to sign
) => Promise<Uint8Array[]>          // Signed blobs
```

This comes from `@txnlab/use-wallet-react`:

```typescript
const { transactionSigner } = useWallet();
```

### No Backend Required

❌ Before: Backend held private key, signed everything  
✅ Now: Wallet signs in browser, frontend sends to network

### Complete Control

The user's Pera Wallet:
- Signs with their private key (never leaves wallet)
- Returns signed transaction blob to frontend
- Frontend submits directly to Algonode

---

## 🧪 Testing the Flow

### 1. Open Frontend
```bash
http://localhost:5177
```

### 2. Connect Wallet
Click "Connect Wallet" → Select Pera → Approve

### 3. Create a Bounty
- Click "Create Bounty" button
- Fill in details (title, description, 1+ ALGO)
- Click "Publish Bounty"
- Pera Wallet pops up → **Sign**
  - First popup: Create app (ApplicationCreateTxn)
  - Second popup: Send min balance (PaymentTxn)
  - Third popup: Initialize bounty (AppCallTxn)

### 4. Success
App ID returned → Bounty live on Algorand!

---

## 📊 What Happens Behind Scenes

### Browser Console Shows:

```
🚀 Starting bouty creation flow...
Creator: 4GN6SLNK...
Reward: 5 ALGO

📍 STEP 1: Creating Bounty App Contract
📍 Step 1: Getting network parameters...
📍 Step 2: Loading contract bytecode...
📍 Step 3: Compiling approval program...
📍 Step 4: Compiling clear program...
📍 Step 5: Building ApplicationCreateTxn...
📍 Step 6: Requesting wallet signature...
✅ Wallet signed transactions!
📍 Step 7: Waiting for confirmation...
✅ App Created! ID: 755796043, Address: KPK2S3DH...

📍 STEP 2: Initializing Bounty Details
...
🎉 BOUNTY CREATED SUCCESSFULLY!
```

---

## 🚀 What's Next?

Now you can add more methods to the dApp:

```typescript
// Claim a bounty
await claimBounty(appId, creatorAddress, transactionSigner);

// Submit work
await submitWork(appId, creatorAddress, transactionSigner);

// Approve submission
await approveSubmission(appId, creatorAddress, transactionSigner);
```

All signed by the connected wallet! No backend needed.

---

## ⚙️ Configuration

### Environment Variables

`.env` (frontend):
```
VITE_API_SERVER=(not needed anymore!)
```

No backend URL needed - everything is client-side!

---

## 🔒 Security

✅ Private key never leaves wallet  
✅ Frontend never sees private key  
✅ All transactions signed locally  
✅ Direct connection to Algorand network  
✅ No server to compromise  

---

## 💡 Tips

1. **Testnet Only** - This uses testnet. For mainnet, update:
   ```typescript
   const ALGOD_SERVER = "https://mainnet-api.algonode.cloud";
   ```

2. **Fee Management** - Each transaction costs ~1000 microAlgos. Wallet has funds, so it's automatic.

3. **Add More Methods** - Use the same pattern:
   ```typescript
   const txn = algosdk.makeApplicationCallTxnFromObject({...});
   const signed = await transactionSigner([txn], [0]);
   const txId = await algod.sendRawTransaction(signed[0]).do();
   ```

---

**🎉 You have a fully functional Algorand dApp!**
