'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Bounty } from '@/models/Bounty';
import { Submission } from '@/models/Submissions';

interface SubmissionWithUser extends Submission {
  creatorName?: string;
  creatorPfp?: string;
}

interface AdminBountyFullResponse {
  bounty: Bounty;
  submissions: SubmissionWithUser[];
  summary: {
    totalSubmissions: number;
    pendingSubmissions: number;
    claimedSubmissions: number;
    rejectedSubmissions: number;
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Await params before using
    const { id } = await params;

    // First query: Get bounty details
    const bountyQuery = `
      SELECT 
        id, title, description, bounty_pool, token_symbol, status,
        created_at, updated_at, end_date, created_by, requirements,
        submissions_count, total_submissions, completion_percentage
      FROM bounties
      WHERE id = $1
    `;

    const bountyResult = await client.query(bountyQuery, [id]);

    if (bountyResult.rows.length === 0) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    // Transform bounty data
    const row = bountyResult.rows[0];
    const bounty: Bounty = {
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
    };

    // Second query: Get submissions with user information using JOIN
    const submissionsQuery = `
      SELECT 
        s.id, s.bounty_id, s.creator, s.creatorpfp, s.submitted_url, 
        s.status, s.wallet_address, s.created_at, s.updated_at,
        u.name as creator_name,
        u."userPfp" as creator_profile_image
      FROM submissions s
      LEFT JOIN users u ON s.creator = u.username
      WHERE s.bounty_id = $1
      ORDER BY s.created_at DESC;
    `;

    const submissionsResult = await client.query(submissionsQuery, [id]);

    // Transform submission data
    const submissions: SubmissionWithUser[] = submissionsResult.rows.map(row => ({
      id: row.id,
      bountyId: row.bounty_id,
      creator: row.creator,
      creatorPfp: row.creatorpfp,
      submitted_url: row.submitted_url,
      status: row.status,
      wallet_address: row.wallet_address || undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      creatorName: row.creator_name || undefined,
      creatorPfp: row.creator_profile_image || row.creatorpfp || undefined,
    }));

    // Calculate submission summary
    const summary = {
      totalSubmissions: submissions.length,
      pendingSubmissions: submissions.filter(s => s.status === 'pending').length,
      claimedSubmissions: submissions.filter(s => s.status === 'claimed').length,
      rejectedSubmissions: submissions.filter(s => s.status === 'rejected').length,
    };

    const response: AdminBountyFullResponse = {
      bounty,
      submissions,
      summary
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