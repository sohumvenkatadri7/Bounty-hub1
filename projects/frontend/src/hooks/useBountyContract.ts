import { useMemo, useCallback, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { AlgorandClient, microAlgos } from '@algorandfoundation/algokit-utils'
import { makePaymentTxnWithSuggestedParamsFromObject, getApplicationAddress } from 'algosdk'
import { BountyClient, BountyFactory } from '../contracts/Bounty'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

// ── On-chain status codes ──
export const BOUNTY_STATUS = {
  OPEN: 0,
  CLAIMED: 1,
  SUBMITTED: 2,
  APPROVED: 3,
  CANCELLED: 4,
} as const

export type BountyStatusCode = (typeof BOUNTY_STATUS)[keyof typeof BOUNTY_STATUS]

export const statusLabel = (code: number): string => {
  switch (code) {
    case BOUNTY_STATUS.OPEN: return 'Open'
    case BOUNTY_STATUS.CLAIMED: return 'In Progress'
    case BOUNTY_STATUS.SUBMITTED: return 'Submitted'
    case BOUNTY_STATUS.APPROVED: return 'Completed'
    case BOUNTY_STATUS.CANCELLED: return 'Cancelled'
    default: return 'Unknown'
  }
}

// ── Metadata stored in localStorage alongside appId ──
export interface BountyMeta {
  appId: number
  title: string
  description: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  rewardAlgos: number
  createdAt: string
  creatorAddress: string
}

// ── On-chain state returned by get_bounty_info() ──
export interface OnChainBountyInfo {
  creator: string
  worker: string
  amount: bigint
  status: number
}

// ── Combined bounty (meta + on-chain) ──
export interface OnChainBounty extends BountyMeta {
  onChain: OnChainBountyInfo
}

const STORAGE_KEY = 'algoearn_bounties'

/** Read known bounty metas from localStorage */
export function loadBountyMetas(): BountyMeta[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/** Save bounty metas to localStorage */
export function saveBountyMetas(metas: BountyMeta[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metas))
}

/** Add a new bounty meta */
export function addBountyMeta(meta: BountyMeta) {
  const list = loadBountyMetas()
  list.unshift(meta)
  saveBountyMetas(list)
}

// ──────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────

export function useBountyContract() {
  const { activeAddress, transactionSigner } = useWallet()
  const algorand = useMemo(
    () => AlgorandClient.fromConfig({ algodConfig: getAlgodConfigFromViteEnvironment() }),
    [],
  )

  // Keep the signer in sync
  useEffect(() => {
    if (transactionSigner) {
      algorand.setDefaultSigner(transactionSigner)
    }
  }, [algorand, transactionSigner])

  // ── Deploy a new Bounty contract & fund it ──
  const deployAndFund = useCallback(
    async (meta: Omit<BountyMeta, 'appId' | 'createdAt' | 'creatorAddress'>) => {
      if (!activeAddress) throw new Error('Connect your wallet first')
      if (!transactionSigner) throw new Error('Wallet signer unavailable')

      const amountMicroAlgos = Math.round(meta.rewardAlgos * 1_000_000)

      // 1. Deploy (bare create)
      const factory = new BountyFactory({ defaultSender: activeAddress, algorand })
      const { appClient } = await factory.send.create.bare()
      const appId = Number(appClient.appId)
      const appAddr = getApplicationAddress(appId)

      // 2. Fund the app account with min balance (0.1 ALGO)
      await algorand.send.payment({
        sender: activeAddress,
        receiver: String(appAddr),
        amount: microAlgos(100_000),
        signer: transactionSigner,
      })

      // 3. Call create_bounty with a payment txn
      const sp = await algorand.client.algod.getTransactionParams().do()
      const payTxn = makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: appAddr,
        amount: amountMicroAlgos,
        suggestedParams: sp,
      })

      const client = new BountyClient({ appId: BigInt(appId), algorand, defaultSigner: transactionSigner })
      await client.send.createBounty({
        args: {
          payment: { txn: payTxn, signer: transactionSigner },
          amount: BigInt(amountMicroAlgos),
        },
        sender: activeAddress,
      })

      // 4. Save metadata locally
      const bountyMeta: BountyMeta = {
        ...meta,
        appId,
        createdAt: new Date().toISOString(),
        creatorAddress: activeAddress,
      }
      addBountyMeta(bountyMeta)

      return bountyMeta
    },
    [activeAddress, transactionSigner, algorand],
  )

  // ── Read on-chain state for a given appId ──
  const getBountyInfo = useCallback(
    async (appId: number): Promise<OnChainBountyInfo> => {
      const hasSigner = !!transactionSigner && !!activeAddress
      const client = new BountyClient({
        appId: BigInt(appId),
        algorand,
        ...(hasSigner
          ? { defaultSigner: transactionSigner!, defaultSender: activeAddress! }
          : {}),
      })
      const result = await client.send.getBountyInfo({ args: [] })
      // return is [address, address, uint64, uint64]
      const ret = result.return as unknown as [string, string, bigint, bigint]
      return {
        creator: ret[0],
        worker: ret[1],
        amount: ret[2],
        status: Number(ret[3]),
      }
    },
    [algorand, transactionSigner, activeAddress],
  )

  // ── Fetch all known bounties with on-chain state ──
  const fetchAllBounties = useCallback(async (): Promise<OnChainBounty[]> => {
    const metas = loadBountyMetas()
    const results: OnChainBounty[] = []
    for (const meta of metas) {
      try {
        const onChain = await getBountyInfo(meta.appId)
        results.push({ ...meta, onChain })
      } catch (err) {
        console.warn(`Failed to fetch bounty info for appId ${meta.appId}:`, err)
        // Still include with fallback state
        results.push({
          ...meta,
          onChain: {
            creator: meta.creatorAddress,
            worker: '',
            amount: BigInt(Math.round(meta.rewardAlgos * 1_000_000)),
            status: BOUNTY_STATUS.OPEN,
          },
        })
      }
    }
    return results
  }, [getBountyInfo])

  // ── Claim a bounty (worker) ──
  const claimBounty = useCallback(
    async (appId: number) => {
      if (!activeAddress) throw new Error('Connect your wallet first')
      const client = new BountyClient({ appId: BigInt(appId), algorand, defaultSigner: transactionSigner! })
      await client.send.claim({ args: [], sender: activeAddress })
    },
    [activeAddress, transactionSigner, algorand],
  )

  // ── Submit work (worker) ──
  const submitWork = useCallback(
    async (appId: number) => {
      if (!activeAddress) throw new Error('Connect your wallet first')
      const client = new BountyClient({ appId: BigInt(appId), algorand, defaultSigner: transactionSigner! })
      await client.send.submitWork({ args: [], sender: activeAddress })
    },
    [activeAddress, transactionSigner, algorand],
  )

  // ── Approve (creator) ──
  const approveBounty = useCallback(
    async (appId: number) => {
      if (!activeAddress) throw new Error('Connect your wallet first')
      const client = new BountyClient({ appId: BigInt(appId), algorand, defaultSigner: transactionSigner! })
      await client.send.approve({
        args: [],
        sender: activeAddress,
        extraFee: microAlgos(1000), // cover inner txn fee
      })
    },
    [activeAddress, transactionSigner, algorand],
  )

  // ── Cancel (creator) ──
  const cancelBounty = useCallback(
    async (appId: number) => {
      if (!activeAddress) throw new Error('Connect your wallet first')
      const client = new BountyClient({ appId: BigInt(appId), algorand, defaultSigner: transactionSigner! })
      await client.send.cancel({
        args: [],
        sender: activeAddress,
        extraFee: microAlgos(1000), // cover inner txn fee
      })
    },
    [activeAddress, transactionSigner, algorand],
  )

  return {
    activeAddress,
    deployAndFund,
    getBountyInfo,
    fetchAllBounties,
    claimBounty,
    submitWork,
    approveBounty,
    cancelBounty,
  }
}
