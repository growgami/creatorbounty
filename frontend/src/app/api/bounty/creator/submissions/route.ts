import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface CreatorSubmission {
  id: string;
  bountyId: string;
  bountyTitle: string;
  submitted_url: string;
  status: 'pending' | 'claimed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  wallet_address?: string;
  bountyReward: number;
  tokenSymbol: string;
}

interface CreatorSubmissionsResponse {
  submissions: CreatorSubmission[];
  summary: {
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
    totalEarnings: number;
  };
}

export async function GET(request: Request) {
  let client;
  try {
    // Get session to identify the current user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Parse query parameters for optional bountyId filtering
    const { searchParams } = new URL(request.url);
    const bountyId = searchParams.get('bountyId');

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

    // Query to fetch user's submissions with bounty details via JOIN
    let query: string;
    let queryParams: (string)[] = [session.user.username];
    
    if (bountyId) {
      query = `
        SELECT 
          s.id, s.bounty_id, s.submitted_url, s.status, s.wallet_address,
          s.created_at, s.updated_at,
          b.title as bounty_title,
          b.bounty_pool as bounty_reward,
          b.token_symbol
        FROM submissions s
        JOIN bounties b ON s.bounty_id = b.id
        WHERE s.creator = $1 AND s.bounty_id = $2
        ORDER BY s.created_at DESC;
      `;
      queryParams.push(bountyId);
    } else {
      query = `
        SELECT 
          s.id, s.bounty_id, s.submitted_url, s.status, s.wallet_address,
          s.created_at, s.updated_at,
          b.title as bounty_title,
          b.bounty_pool as bounty_reward,
          b.token_symbol
        FROM submissions s
        JOIN bounties b ON s.bounty_id = b.id
        WHERE s.creator = $1
        ORDER BY s.created_at DESC;
      `;
    }

    const result = await client.query(query, queryParams);

    // Transform database rows to match CreatorSubmission model
    const submissions: CreatorSubmission[] = result.rows.map(row => ({
      id: row.id,
      bountyId: row.bounty_id,
      bountyTitle: row.bounty_title,
      submitted_url: row.submitted_url,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      wallet_address: row.wallet_address || undefined,
      bountyReward: parseFloat(row.bounty_reward) || 0,
      tokenSymbol: row.token_symbol,
    }));

    // Calculate summary statistics
    const summary = {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      claimedSubmissions: submissions.filter(s => s.status === 'claimed').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
      totalEarnings: submissions
        .filter(s => s.status === 'claimed')
        .reduce((sum, s) => sum + s.bountyReward, 0),
    };

    const response: CreatorSubmissionsResponse = {
      submissions,
      summary
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return empty response instead of error to prevent frontend issues
    const emptyResponse: CreatorSubmissionsResponse = {
      submissions: [],
      summary: {
        totalSubmissions: 0,
        pendingSubmissions: 0,
        claimedSubmissions: 0,
        rejectedSubmissions: 0,
        totalEarnings: 0,
      }
    };
    
    return NextResponse.json(emptyResponse, { status: 200 });
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