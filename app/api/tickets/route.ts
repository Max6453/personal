import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, ObjectId } from 'mongodb';

// Check for MongoDB URI
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI = process.env.MONGODB_URI;
const mongoClient = new MongoClient(MONGODB_URI);
let dbInstance: Db | null = null;

// Get database instance with connection pooling
async function getDatabase(): Promise<Db> {
  if (!dbInstance) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoClient.connect();
      dbInstance = mongoClient.db('tickets');
      
      // Verify connection
      await dbInstance.command({ ping: 1 });
      console.log('Connected successfully to MongoDB');
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      if (error instanceof Error) {
        if (error.message.includes('bad auth')) {
          throw new Error('Authentication failed. Please verify your database username and password.');
        } else if (error.message.includes('ENOTFOUND')) {
          throw new Error('Could not reach MongoDB server. Please check your connection string.');
        }
      }
      throw error;
    }
  }
  return dbInstance;
}

// GET handler to fetch all tickets
export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    const tickets = await db.collection('2025').find({}).toArray();
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

// POST handler to create a new ticket
export async function POST(request: NextRequest) {
  try {
    const ticket = await request.json();
    console.log('Received ticket data:', ticket);

    const db = await getDatabase();
    const result = await db.collection('2025').insertOne(ticket);
    console.log('Ticket inserted successfully:', result.insertedId);
    
    return NextResponse.json({
      success: true,
      ticketId: result.insertedId,
      ticket: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

// DELETE handler to remove a ticket
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await getDatabase();
    
    // Handle both string IDs and ObjectIds
    const query = ObjectId.isValid(id) 
      ? { _id: new ObjectId(id) } 
      : { id: id };
    
    const result = await db.collection('2025').deleteOne(query);
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}