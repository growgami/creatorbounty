import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bountyId = searchParams.get('id');

    // Validate bounty ID
    if (!bountyId) {
      return NextResponse.json(
        { message: 'Bounty ID is required' },
        { status: 400 }
      );
    }

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

      // Start transaction for cascading deletion
      await client.query('BEGIN');

      try {
        // Check if bounty exists
        const bountyCheckQuery = 'SELECT id, title FROM bounties WHERE id = $1';
        const bountyResult = await client.query(bountyCheckQuery, [bountyId]);

        if (bountyResult.rows.length === 0) {
          await client.query('ROLLBACK');
          await client.end();
          return NextResponse.json(
            { message: 'Bounty not found' },
            { status: 404 }
          );
        }

        const bountyTitle = bountyResult.rows[0].title;

        // Cascading deletion - Delete related data first
        // Note: Add more cascading deletions here as the schema grows
        // Examples: submissions, comments, notifications, etc.
        
        // For now, we'll delete any potential related records
        // This is where you'd add DELETE statements for related tables like:
        // await client.query('DELETE FROM bounty_submissions WHERE bounty_id = $1', [bountyId]);
        // await client.query('DELETE FROM bounty_comments WHERE bounty_id = $1', [bountyId]);
        // await client.query('DELETE FROM bounty_notifications WHERE bounty_id = $1', [bountyId]);

        // Delete the bounty itself
        const deleteBountyQuery = 'DELETE FROM bounties WHERE id = $1';
        const deleteResult = await client.query(deleteBountyQuery, [bountyId]);

        if (deleteResult.rowCount === 0) {
          await client.query('ROLLBACK');
          await client.end();
          return NextResponse.json(
            { message: 'Failed to delete bounty' },
            { status: 500 }
          );
        }

        // Commit transaction
        await client.query('COMMIT');
        await client.end();

        console.log(`Bounty deleted successfully: ${bountyId} - ${bountyTitle}`);

        return NextResponse.json(
          { 
            message: 'Bounty deleted successfully',
            deletedBounty: {
              id: bountyId,
              title: bountyTitle
            }
          },
          { status: 200 }
        );

      } catch (transactionError) {
        // Rollback transaction on error
        await client.query('ROLLBACK');
        await client.end();
        throw transactionError;
      }

    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Failed to delete bounty from database' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting bounty:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}