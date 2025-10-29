import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('Initial connection successful');
    
    // Test the connection by running a simple command
    await client.db("admin").command({ ping: 1 });
    console.log("Database connection verified successfully");
    
    const db = client.db('tickets');
    // Verify we can access the tickets collection
    await db.collection('2025').find({}).limit(1).toArray();
    console.log("Successfully accessed tickets collection");
    
    return db;
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
    if (error instanceof Error) {
      if (error.message.includes('bad auth')) {
        throw new Error('Authentication failed. Please verify your database username and password.');
      } else if (error.message.includes('ENOTFOUND')) {
        throw new Error('Could not reach MongoDB server. Please check your connection string.');
      }
    }
    throw error;
  } finally {
    console.log('Connection attempt completed');
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = await connectToMongoDB();
    const tickets = await db.collection('2025').find({}).toArray();
    return new NextResponse(JSON.stringify(tickets), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to fetch tickets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ticket = await request.json();
    console.log('Received ticket data:', ticket);

    const db = await connectToMongoDB();
    console.log('Connected to MongoDB successfully');
    
    const result = await db.collection('2025').insertOne(ticket);
    console.log('Ticket inserted successfully:', result.insertedId);
    
    return new NextResponse(JSON.stringify({
      success: true,
      ticketId: result.insertedId,
      ticket: ticket
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return new NextResponse(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to create ticket'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// DELETE handler to remove a ticket
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const db = await connectToMongoDB();
    
    await db.collection('2025').deleteOne({ id: id });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    );
  }
}