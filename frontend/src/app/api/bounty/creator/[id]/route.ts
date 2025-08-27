'use server';

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

interface UserSubmission {
  id: string;
  submitted_url: string;
  status: 'pending' | 'claimed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  wallet_address?: string;
}

interface CreatorBountyResponse {
  bounty: CreatorBounty;
  userSubmission?: UserSubmission;
  canSubmit: boolean;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  let client;
  try {
    // Get session to identify the current user
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.username) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

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

    // Await params before using
    const { id } = await params;

    // Query to fetch bounty details (creator-relevant fields only)
    const bountyQuery = `
      SELECT 
        b.id, b.title, b.description, b.bounty_pool, b.token_symbol, 
        b.end_date, b.requirements, b.total_submissions, b.status,
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
      WHERE b.id = $1 AND b.status = 'active'
    `;

    const bountyResult = await client.query(bountyQuery, [id]);

    if (bountyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Bounty not found or not active' }, { status: 404 });
    }

    // Transform bounty data
    const row = bountyResult.rows[0];
    const bounty: CreatorBounty = {
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
    };

    // Query to check if the current user has already submitted to this bounty
    const userSubmissionQuery = `
      SELECT 
        id, submitted_url, status, created_at, updated_at, wallet_address
      FROM submissions
      WHERE bounty_id = $1 AND creator = $2
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const userSubmissionResult = await client.query(userSubmissionQuery, [id, session.user.username]);

    let userSubmission: UserSubmission | undefined;
    if (userSubmissionResult.rows.length > 0) {
      const submissionRow = userSubmissionResult.rows[0];
      userSubmission = {
        id: submissionRow.id,
        submitted_url: submissionRow.submitted_url,
        status: submissionRow.status,
        createdAt: new Date(submissionRow.created_at).toISOString(),
        updatedAt: new Date(submissionRow.updated_at).toISOString(),
        wallet_address: submissionRow.wallet_address || undefined,
      };
    }

    // Determine if user can submit (no existing submission or previous submission was rejected)
    const canSubmit = !userSubmission || userSubmission.status === 'rejected';

    const response: CreatorBountyResponse = {
      bounty,
      userSubmission,
      canSubmit
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    return NextResponse.json({ error: 'Failed to fetch bounty details' }, { status: 500 });
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