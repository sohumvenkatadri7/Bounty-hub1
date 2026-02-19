/**
 * Store and retrieve bounties from localStorage
 */

export interface StoredBounty {
  appId: number;
  appAddress: string;
  creator: string;
  title: string;
  description: string;
  reward: number; // ALGO
  category: string;
  difficulty: string;
  createdAt: number; // timestamp
  status: 'active' | 'claimed' | 'completed';
}

const STORAGE_KEY = 'bounty_apps';

export function saveBounty(bounty: StoredBounty): void {
  try {
    const existing = getBounties();
    console.log('💾 Saving bounty to localStorage...');
    console.log('   Existing bounties:', existing.length);
    console.log('   New bounty:', bounty);
    
    // Convert any BigInt values to strings/numbers before saving
    const bountyToSave = {
      ...bounty,
      reward: Number(bounty.reward), // Ensure it's a number
      appId: Number(bounty.appId), // Ensure it's a number
    };
    existing.push(bountyToSave);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    console.log('✅ Bounty saved! Total bounties now:', existing.length);
    console.log('   Storage key:', STORAGE_KEY);
    console.log('   Full data:', JSON.stringify(existing, null, 2));
  } catch (error) {
    console.error('❌ Failed to save bounty:', error);
    throw error;
  }
}

export function getBounties(): StoredBounty[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    console.log('📖 Getting bounties from localStorage...');
    console.log('   Raw data:', data);
    const bounties = data ? JSON.parse(data) : [];
    console.log('   Parsed bounties:', bounties.length, 'items');
    return bounties;
  } catch (error) {
    console.error('Failed to get bounties:', error);
    return [];
  }
}

export function getBountiesByCreator(creator: string): StoredBounty[] {
  try {
    const all = getBounties();
    console.log('🔍 Searching bounties for creator:', creator);
    console.log('   Total bounties in storage:', all.length);
    const filtered = all.filter((b) => b.creator.toLowerCase() === creator.toLowerCase());
    console.log('   Found matching bounties:', filtered.length);
    return filtered;
  } catch (error) {
    console.error('Failed to get bounties by creator:', error);
    return [];
  }
}

export function updateBountyStatus(appId: number, status: 'active' | 'claimed' | 'completed'): void {
  const bounties = getBounties();
  const index = bounties.findIndex((b) => b.appId === appId);
  if (index !== -1) {
    bounties[index].status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bounties));
  }
}
