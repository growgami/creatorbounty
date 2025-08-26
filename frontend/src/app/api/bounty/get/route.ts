import { NextResponse } from 'next/server';
import { Bounty } from '@/models/Bounty';

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

    // Query to fetch all bounties with real-time submission counts
    const query = `
      SELECT 
        b.id, b.title, b.description, b.bounty_pool, b.token_symbol, b.status,
        b.created_at, b.updated_at, b.end_date, b.created_by, b.requirements,
        b.total_submissions,
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
      ORDER BY b.created_at DESC;
    `;

    const result = await client.query(query);

    // Transform database rows to match Bounty model
    const bounties: Bounty[] = result.rows.map(row => ({
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
    }));

    return NextResponse.json({ bounties }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json({ bounties: [] }, { status: 200 });
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
