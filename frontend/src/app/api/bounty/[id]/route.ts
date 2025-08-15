'use server';

import { NextRequest, NextResponse } from 'next/server';
import { Bounty } from '@/models/Bounty';

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

    // Query to fetch a single bounty by ID
    const query = `
      SELECT 
        id, title, description, bounty_pool, token_symbol, status,
        created_at, updated_at, end_date, created_by, requirements,
        submissions_count, total_submissions, completion_percentage
      FROM bounties
      WHERE id = $1
    `;

    const result = await client.query(query, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
    }

    // Transform database row to match Bounty model
    const row = result.rows[0];
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

    return NextResponse.json(bounty, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    return NextResponse.json({ error: 'Failed to fetch bounty' }, { status: 500 });
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
