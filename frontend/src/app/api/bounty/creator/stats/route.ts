import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Extended session type to match our auth configuration
interface ExtendedUser {
  id: string;
  username: string;
  userPfp: string;
  name?: string;
  email?: string;
  wallet_address?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  tweet_count?: number;
  role?: 'admin' | 'creator';
}

interface ExtendedSession {
  user: ExtendedUser;
  expires: string;
}

interface CreatorStatsResponse {
  platform: {
    activeCampaigns: number;
    totalCreators: string;
    xplRewardsPaid: string;
    totalRewardPool: number;
  };
  user?: {
    totalSubmissions: number;
    claimedSubmissions: number;
    pendingSubmissions: number;
    rejectedSubmissions: number;
    totalEarnings: number;
    completedBounties: number;
  };
}

export async function GET() {
  let client;
  try {
    // Get session to identify the current user (optional for platform stats)
    const session = await getServerSession(authOptions) as ExtendedSession | null;

    // Import pg client dynamically to avoid server-side issues
    const { Client } = await import('pg');
    
    // Create database client
    client = new Client({
      host: process.env.PSQL_HOST,
      port: parseInt(process.env.PSQL_PORT || '5432'),
      user: process.env.PSQL_USERNAME,
      password: process.env.PSQL_PASSWORD,
      database: process.env.PSQL_DATABASE,
    });

    await client.connect();

    // Query for platform-wide statistics
    const platformStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM bounties WHERE status = 'active') as active_campaigns,
        (SELECT COUNT(DISTINCT creator) FROM submissions) as total_creators,
        (SELECT COALESCE(SUM(bounty_pool), 0) FROM bounties WHERE status = 'active') as total_reward_pool
    `;

    const platformResult = await client.query(platformStatsQuery);
    const platformRow = platformResult.rows[0];

    // Calculate total XPL rewards paid (sum of bounty pools for completed bounties)
    const rewardsPaidQuery = `
      SELECT COALESCE(SUM(bounty_pool), 0) as total_rewards_paid
      FROM bounties 
      WHERE status IN ('completed', 'ended')
    `;

    const rewardsPaidResult = await client.query(rewardsPaidQuery);
    const totalRewardsPaid = parseFloat(rewardsPaidResult.rows[0].total_rewards_paid) || 0;

    // Format numbers for display
    const formatNumber = (num: number): string => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
      } else {
        return num.toString();
      }
    };

    const platformStats = {
      activeCampaigns: parseInt(platformRow.active_campaigns) || 0,
      totalCreators: formatNumber(parseInt(platformRow.total_creators) || 0),
      xplRewardsPaid: formatNumber(totalRewardsPaid),
      totalRewardPool: parseFloat(platformRow.total_reward_pool) || 0,
    };

    let userStats;
    
    // If user is authenticated, get their personal statistics
    if (session?.user?.username) {
      const userStatsQuery = `
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(CASE WHEN status = 'claimed' THEN 1 END) as claimed_submissions,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_submissions,
          COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_submissions,
          COUNT(DISTINCT bounty_id) as participated_bounties,
          COUNT(DISTINCT CASE WHEN status = 'claimed' THEN bounty_id END) as completed_bounties
        FROM submissions 
        WHERE creator = $1
      `;

      const userResult = await client.query(userStatsQuery, [session.user.username]);
      const userRow = userResult.rows[0];

      // Calculate user's total earnings (simplified - would need actual payment data)
      const earningsQuery = `
        SELECT COALESCE(SUM(b.bounty_pool), 0) as total_earnings
        FROM submissions s
        JOIN bounties b ON s.bounty_id = b.id
        WHERE s.creator = $1 AND s.status = 'claimed'
      `;

      const earningsResult = await client.query(earningsQuery, [session.user.username]);
      const totalEarnings = parseFloat(earningsResult.rows[0].total_earnings) || 0;

      userStats = {
        totalSubmissions: parseInt(userRow.total_submissions) || 0,
        claimedSubmissions: parseInt(userRow.claimed_submissions) || 0,
        pendingSubmissions: parseInt(userRow.pending_submissions) || 0,
        rejectedSubmissions: parseInt(userRow.rejected_submissions) || 0,
        totalEarnings: totalEarnings,
        completedBounties: parseInt(userRow.completed_bounties) || 0,
      };
    }

    const response: CreatorStatsResponse = {
      platform: platformStats,
      user: userStats
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return default stats instead of error
    const defaultResponse: CreatorStatsResponse = {
      platform: {
        activeCampaigns: 0,
        totalCreators: '0',
        xplRewardsPaid: '0',
        totalRewardPool: 0,
      },
      user: undefined
    };
    
    return NextResponse.json(defaultResponse, { status: 200 });
  } finally {
    // Ensure client is closed
    if (client) {
      try {
        await client.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}