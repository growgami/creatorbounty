/**
 * Relationship Interfaces
 * These interfaces define the relationships between different models in the system
 */

import { Bounty } from './Bounty';
import { Submission } from './Submissions';
import { User } from './Users';

/**
 * Extended User interface that includes related bounties and submissions
 */
export interface UserWithRelationships extends User {
  /** Bounties created by this user */
  createdBounties?: Bounty[];
  
  /** Submissions made by this user */
  submissions?: Submission[];
}

/**
 * Extended Bounty interface that includes related submissions and creator
 */
export interface BountyWithRelationships extends Bounty {
  /** User who created this bounty */
  creator?: User;
  
  /** Submissions for this bounty */
  submissions?: Submission[];
}

/**
 * Extended Submission interface that includes related bounty and creator
 */
export interface SubmissionWithRelationships extends Submission {
  /** Bounty this submission is for */
  bounty?: Bounty;
  
  /** User who created this submission */
  creatorUser?: User;
}
