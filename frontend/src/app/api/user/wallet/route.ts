import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getPostgresURI } from '@/models/Users';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * PUT /api/user/wallet
 * Updates user wallet address (authenticated users only)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { wallet_address } = await request.json();

    if (!wallet_address || typeof wallet_address !== 'string') {
      return NextResponse.json(
        { error: 'Valid wallet address is required' },
        { status: 400 }
      );
    }

    // Basic wallet address validation (can be enhanced)
    if (wallet_address.length < 10) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    const client = new Client({
      connectionString: getPostgresURI()
    });

    await client.connect();
    
    const result = await client.query(
      'UPDATE users SET wallet_address = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [wallet_address, (session.user as any).id]
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
      message: 'Wallet address updated successfully',
      wallet_address: result.rows[0].wallet_address
    });

  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/wallet
 * Gets current user's wallet address
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const client = new Client({
      connectionString: getPostgresURI()
    });

    await client.connect();
    
    const result = await client.query(
      'SELECT wallet_address FROM users WHERE id = $1',
      [(session.user as any).id]
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
      wallet_address: result.rows[0].wallet_address
    });

  } catch (error) {
    console.error('Error fetching wallet address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}