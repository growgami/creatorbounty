import { NextRequest, NextResponse } from 'next/server';
import { BountyCreationRequest, Bounty } from '@/models/Bounty';

export async function POST(request: NextRequest) {
  try {
    const body: BountyCreationRequest = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.bountyPool || !body.tokenSymbol || !body.totalSubmissions) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, bountyPool, tokenSymbol, totalSubmissions' },
        { status: 400 }
      );
    }

    // Generate unique ID (in production, use proper UUID library)
    const id = `bounty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    // Create bounty object
    const newBounty: Bounty = {
      id,
      title: body.title,
      description: body.description,
      bountyPool: body.bountyPool,
      tokenSymbol: body.tokenSymbol,
      status: body.status || 'draft',
      createdAt: now,
      updatedAt: now,
      endDate: body.endDate,
      createdBy: 'admin_user', // TODO: Get from authentication
      requirements: body.requirements || [],
      submissionsCount: 0,
      totalSubmissions: body.totalSubmissions,
      completionPercentage: 0,
    };

    // Save to database
    console.log('Creating bounty:', newBounty);
    
    try {
      // Import pg client dynamically to avoid server-side issues
      const { Client } = await import('pg');
      
      // Create database client
      const client = new Client({
        host: process.env.PSQL_HOST,
        port: parseInt(process.env.PSQL_PORT || '5432'),
        user: process.env.PSQL_USERNAME,
        password: process.env.PSQL_PASSWORD,
        database: process.env.PSQL_DATABASE,
      });

      await client.connect();

      // Insert bounty into database
      const insertQuery = `
        INSERT INTO bounties (
          id, title, description, bounty_pool, token_symbol, status,
          created_at, updated_at, end_date, created_by, requirements,
          submissions_count, total_submissions, completion_percentage
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *;
      `;

      const values = [
        newBounty.id,
        newBounty.title,
        newBounty.description,
        newBounty.bountyPool,
        newBounty.tokenSymbol,
        newBounty.status,
        newBounty.createdAt,
        newBounty.updatedAt,
        newBounty.endDate || null,
        newBounty.createdBy,
        JSON.stringify(newBounty.requirements),
        newBounty.submissionsCount,
        newBounty.totalSubmissions,
        newBounty.completionPercentage
      ];

      const result = await client.query(insertQuery, values);
      await client.end();

      console.log('Bounty saved to database:', result.rows[0]);

      return NextResponse.json(
        { 
          message: 'Bounty created and saved successfully',
          bounty: newBounty
        },
        { status: 201 }
      );

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Failed to save bounty to database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error creating bounty:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}