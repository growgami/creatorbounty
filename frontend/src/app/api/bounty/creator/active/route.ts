import { NextResponse } from 'next/server';

interface CreatorBounty {
  id: string;
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  endDate?: string;
  requirements: string[];
  submissionsCount: number;
  totalSubmissions: number;
  completionPercentage: number;
}

interface CreatorActiveBountiesResponse {
  bounties: CreatorBounty[];
  stats: {
    totalActiveBounties: number;
    totalRewardPool: number;
  };
}

export async function GET() {
  let client;
  try {
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

    // Query to fetch only active bounties with creator-relevant data
    // Excludes admin-only fields like createdBy, createdAt, updatedAt
    const query = `
      SELECT 
        b.id, b.title, b.description, b.bounty_pool, b.token_symbol, 
        b.end_date, b.requirements, b.total_submissions,
        COALESCE(s.submission_count, 0) as submissions_count,
        CASE 
          WHEN b.total_submissions > 0 THEN 
            ROUND(CAST((COALESCE(s.submission_count, 0) * 100.0 / b.total_submissions) AS NUMERIC), 2)
          ELSE 0 
        END as completion_percentage
      FROM bounties b
      LEFT JOIN (
        SELECT bounty_id, COUNT(*) as submission_count 
        FROM submissions 
        GROUP BY bounty_id
      ) s ON b.id = s.bounty_id
      WHERE b.status = 'active'
      ORDER BY b.created_at DESC;
    `;

    const result = await client.query(query);

    // Transform database rows to match CreatorBounty model
    const bounties: CreatorBounty[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      bountyPool: parseFloat(row.bounty_pool) || 0,
      tokenSymbol: row.token_symbol,
      endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
      requirements: row.requirements ? JSON.parse(row.requirements) : [],
      submissionsCount: parseInt(row.submissions_count) || 0,
      totalSubmissions: parseInt(row.total_submissions) || 0,
      completionPercentage: parseFloat(row.completion_percentage) || 0,
    }));

    // Calculate creator-relevant statistics
    const stats = {
      totalActiveBounties: bounties.length,
      totalRewardPool: bounties.reduce((sum, bounty) => sum + bounty.bountyPool, 0),
    };

    const response: CreatorActiveBountiesResponse = {
      bounties,
      stats
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return empty response instead of error to prevent frontend issues
    const emptyResponse: CreatorActiveBountiesResponse = {
      bounties: [],
      stats: {
        totalActiveBounties: 0,
        totalRewardPool: 0,
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