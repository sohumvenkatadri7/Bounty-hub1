/**
 * Store and retrieve bounty submissions from localStorage.
 * Each submission is linked to a bounty by its id (e.g. 'chain-755794917').
 */

export interface BountySubmission {
  id: string // unique submission id
  bountyId: string // bounty id this submission belongs to
  submitter: string // wallet address of the submitter
  content: string // submission text / link
  createdAt: number // timestamp
  status: 'pending' | 'approved' | 'rejected'
}

const STORAGE_KEY = 'bounty_submissions';

function getAll(): BountySubmission[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveAll(submissions: BountySubmission[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions));
}

/** Save a new submission */
export function addSubmission(bountyId: string, submitter: string, content: string): BountySubmission {
  const all = getAll();
  const submission: BountySubmission = {
    id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    bountyId,
    submitter,
    content,
    createdAt: Date.now(),
    status: 'pending',
  };
  all.push(submission);
  saveAll(all);
  return submission;
}

/** Get all submissions for a specific bounty */
export function getSubmissionsForBounty(bountyId: string): BountySubmission[] {
  return getAll().filter((s) => s.bountyId === bountyId);
}

/** Approve a submission */
export function approveSubmission(submissionId: string): void {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx !== -1) {
    const bountyId = all[idx].bountyId;
    // Set all other submissions for this bounty to 'pending'
    for (const s of all) {
      if (s.bountyId === bountyId) {
        s.status = 'pending';
      }
    }
    // Approve the selected one
    all[idx].status = 'approved';
    saveAll(all);
  }
}

/** Reject a submission */
export function rejectSubmission(submissionId: string): void {
  const all = getAll();
  const idx = all.findIndex((s) => s.id === submissionId);
  if (idx !== -1) {
    all[idx].status = 'rejected';
    saveAll(all);
  }
}