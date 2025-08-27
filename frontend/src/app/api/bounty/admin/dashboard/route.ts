import { NextResponse } from 'next/server';
import { Bounty } from '@/models/Bounty';

interface AdminDashboardBounty extends Bounty {
  pendingCount: number;
  claimedCount: number;
  rejectedCount: number;
}

interface AdminDashboardResponse {
  bounties: AdminDashboardBounty[];
  summary: {
    totalBounties: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
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

    // Optimized query with LEFT JOIN to get all bounties with submission stats
    const query = `
      SELECT 
        b.id, b.title, b.description, b.bounty_pool, b.token_symbol, b.status,
        b.created_at, b.updated_at, b.end_date, b.created_by, b.requirements,
        b.total_submissions,
        COALESCE(COUNT(s.id), 0) as submissions_count,
        COALESCE(COUNT(CASE WHEN s.status = 'pending' THEN 1 END), 0) as pending_count,
        COALESCE(COUNT(CASE WHEN s.status = 'claimed' THEN 1 END), 0) as claimed_count,
        COALESCE(COUNT(CASE WHEN s.status = 'rejected' THEN 1 END), 0) as rejected_count,
        CASE 
          WHEN b.total_submissions > 0 THEN 
            ROUND(CAST((COALESCE(COUNT(s.id), 0) * 100.0 / b.total_submissions) AS NUMERIC), 2)
          ELSE 0 
        END as completion_percentage
      FROM bounties b
      LEFT JOIN submissions s ON b.id = s.bounty_id
      GROUP BY b.id, b.title, b.description, b.bounty_pool, b.token_symbol, b.status,
               b.created_at, b.updated_at, b.end_date, b.created_by, b.requirements,
               b.total_submissions
      ORDER BY b.created_at DESC;
    `;

    const result = await client.query(query);

    // Transform database rows to match AdminDashboardBounty model
    const bounties: AdminDashboardBounty[] = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      bountyPool: parseFloat(row.bounty_pool) || 0,
      tokenSymbol: row.token_symbol,
      status: row.status,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
      createdBy: row.created_by || 'unknown',
      requirements: row.requirements ? JSON.parse(row.requirements) : [],
      submissionsCount: parseInt(row.submissions_count) || 0,
      totalSubmissions: parseInt(row.total_submissions) || 0,
      completionPercentage: parseFloat(row.completion_percentage) || 0,
      pendingCount: parseInt(row.pending_count) || 0,
      claimedCount: parseInt(row.claimed_count) || 0,
      rejectedCount: parseInt(row.rejected_count) || 0,
    }));

    // Calculate summary statistics
    const summary = {
      totalBounties: bounties.length,
      totalSubmissions: bounties.reduce((sum, bounty) => sum + bounty.submissionsCount, 0),
      pendingSubmissions: bounties.reduce((sum, bounty) => sum + bounty.pendingCount, 0),
      claimedSubmissions: bounties.reduce((sum, bounty) => sum + bounty.claimedCount, 0),
      rejectedSubmissions: bounties.reduce((sum, bounty) => sum + bounty.rejectedCount, 0),
    };

    const response: AdminDashboardResponse = {
      bounties,
      summary
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return empty response instead of error to prevent frontend issues
    const emptyResponse: AdminDashboardResponse = {
      bounties: [],
      summary: {
        totalBounties: 0,
        totalSubmissions: 0,
        pendingSubmissions: 0,
        claimedSubmissions: 0,
        rejectedSubmissions: 0,
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