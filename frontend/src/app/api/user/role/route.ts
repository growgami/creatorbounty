import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getPostgresURI } from '@/models/Users';

/**
 * GET /api/user/role?username=<username>
 * Fetches user role from database by username
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json(
      { error: 'Username parameter is required' },
      { status: 400 }
    );
  }

  const client = new Client({
    connectionString: getPostgresURI()
  });

  try {
    await client.connect();
    
    const result = await client.query(
      'SELECT role FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      role: result.rows[0].role
    });

  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}

/**
 * PUT /api/user/role
 * Updates user role in database (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'creator'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or creator' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check here to ensure only admins can update roles
    // For now, allowing updates for initial implementation

    const client = new Client({
      connectionString: getPostgresURI()
    });

    await client.connect();
    
    const result = await client.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [role, userId]
    );

    if (result.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await client.end();
    
    return NextResponse.json({
      message: 'Role updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}