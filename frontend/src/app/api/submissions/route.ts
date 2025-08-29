import { NextResponse } from 'next/server';
import { Submission } from '@/models/Submissions';
import { SubmissionFormData } from '@/features/bounty/creators/types/types';

export async function GET(request: Request) {
  let client;
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const bountyId = searchParams.get('bountyId');
    const creator = searchParams.get('creator');
    const creatorId = searchParams.get('creatorId');
    const submissionId = searchParams.get('submissionId');

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

    // Query to fetch submissions (with optional filters)
    const queryParams: (string | number)[] = [];
    const whereConditions: string[] = [];
    
    if (bountyId) {
      whereConditions.push('s.bounty_id = $' + (queryParams.length + 1));
      queryParams.push(bountyId);
    }
    
    if (creator) {
      whereConditions.push('s.creator = $' + (queryParams.length + 1));
      queryParams.push(creator);
    }
    
    if (creatorId) {
      whereConditions.push('s.creator_id = $' + (queryParams.length + 1));
      queryParams.push(creatorId);
    }
    
    if (submissionId) {
      whereConditions.push('s.id = $' + (queryParams.length + 1));
      queryParams.push(submissionId);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const query = `
      SELECT 
        s.id, s.bounty_id, s.creator_id, s.creator, s.creatorpfp, s.submitted_url, 
        s.status, s.tx_hash, s.payment_amount, s.created_at, s.updated_at,
        u.wallet_address as creator_wallet_address
      FROM submissions s
      LEFT JOIN users u ON s.creator_id = u.id
      ${whereClause}
      ORDER BY s.created_at DESC;
    `;

    const result = await client.query(query, queryParams);

    // Transform database rows to match Submission model with additional creator wallet data
    const submissions = result.rows.map(row => ({
      id: row.id,
      bountyId: row.bounty_id,
      creator_id: row.creator_id,
      creator: row.creator,
      creatorPfp: row.creatorpfp,
      submitted_url: row.submitted_url,
      status: row.status,
      tx_hash: row.tx_hash || undefined,
      payment_amount: row.payment_amount ? parseFloat(row.payment_amount) : undefined,
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      // Additional field from JOIN (not part of Submission model)
      creator_wallet_address: row.creator_wallet_address || undefined,
    }));

    return NextResponse.json({ submissions }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    
    // Return empty array instead of error to prevent frontend issues
    return NextResponse.json({ submissions: [] }, { status: 200 });
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

export async function POST(request: Request) {
  let client;
  try {
    const body: SubmissionFormData = await request.json();
    
    // Validate required fields
    if (!body.tiktokUrl || !body.bountyId || !body.creatorId || !body.creator || !body.creatorPfp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!body.agreedToTerms) {
      return NextResponse.json(
        { error: 'Terms must be agreed to' },
        { status: 400 }
      );
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

    // Generate unique ID for submission
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert submission into database
    const insertQuery = `
      INSERT INTO submissions (
        id, bounty_id, creator_id, creator, creatorpfp, submitted_url, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING 
        id, bounty_id, creator_id, creator, creatorpfp, submitted_url, 
        status, tx_hash, created_at, updated_at;
    `;

    const values = [
      submissionId,
      body.bountyId,
      body.creatorId,
      body.creator,
      body.creatorPfp,
      body.tiktokUrl,
      'pending'
    ];

    const result = await client.query(insertQuery, values);
    const row = result.rows[0];

    // Update bounty submission count and completion percentage
    const updateBountyQuery = `
      UPDATE bounties 
      SET 
        submissions_count = (
          SELECT COUNT(*) FROM submissions WHERE bounty_id = $1
        ),
        completion_percentage = (
          CASE 
            WHEN total_submissions > 0 THEN 
              ROUND(CAST(((SELECT COUNT(*) FROM submissions WHERE bounty_id = $1) * 100.0 / total_submissions) AS NUMERIC), 2)
            ELSE 0 
          END
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    
    await client.query(updateBountyQuery, [body.bountyId]);

    // Transform database row to match Submission model
    const newSubmission: Submission = {
      id: row.id,
      bountyId: row.bounty_id,
      creator_id: row.creator_id,
      creator: row.creator,
      creatorPfp: row.creatorpfp,
      submitted_url: row.submitted_url,
      status: row.status,
      tx_hash: row.tx_hash || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };

    return NextResponse.json({ submission: newSubmission }, { status: 201 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
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

export async function PATCH(request: Request) {
  let client;
  try {
    const body = await request.json();
    const { id, status, tx_hash, payment_amount } = body;
    
    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Submission ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['pending', 'claimed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (pending, claimed, rejected)' },
        { status: 400 }
      );
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

    // Update submission in database
    const updateQuery = `
      UPDATE submissions 
      SET status = $2, tx_hash = $3, payment_amount = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING 
        id, bounty_id, creator_id, creator, creatorpfp, submitted_url, 
        status, tx_hash, payment_amount, created_at, updated_at;
    `;

    const values = [id, status, tx_hash || null, payment_amount || null];
    const result = await client.query(updateQuery, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const row = result.rows[0];

    // Update bounty submission count and completion percentage
    const updateBountyQuery = `
      UPDATE bounties 
      SET 
        submissions_count = (
          SELECT COUNT(*) FROM submissions WHERE bounty_id = $1
        ),
        completion_percentage = (
          CASE 
            WHEN total_submissions > 0 THEN 
              ROUND(CAST(((SELECT COUNT(*) FROM submissions WHERE bounty_id = $1) * 100.0 / total_submissions) AS NUMERIC), 2)
            ELSE 0 
          END
        ),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;
    
    await client.query(updateBountyQuery, [row.bounty_id]);

    // Transform database row to match Submission model
    const updatedSubmission: Submission = {
      id: row.id,
      bountyId: row.bounty_id,
      creator_id: row.creator_id,
      creator: row.creator,
      creatorPfp: row.creatorpfp,
      submitted_url: row.submitted_url,
      status: row.status,
      tx_hash: row.tx_hash || undefined,
      payment_amount: row.payment_amount ? parseFloat(row.payment_amount) : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };

    return NextResponse.json({ submission: updatedSubmission }, { status: 200 });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
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
