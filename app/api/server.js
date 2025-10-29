// server.js - Backend API Server
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
let db;
const mongoClient = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await mongoClient.connect();
    db = mongoClient.db('tickets');
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes

// Get all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.collection('2025')
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
});

// Get single ticket by ID
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const ticket = await db.collection('2025').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }
    
    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
  }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { email, subject, description } = req.body;

    // Validation
    if (!email || !subject || !description) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, subject, and description are required' 
      });
    }

    const newTicket = {
      email,
      subject,
      description,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      ticketNumber: `TKT-${Date.now().toString().slice(-6)}`
    };

    const result = await db.collection('2025').insertOne(newTicket);
    
    res.status(201).json({ 
      success: true, 
      ticket: { ...newTicket, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket' });
  }
});

// Update ticket
app.put('/api/tickets/:id', async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes;

    const result = await db.collection('2025').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, ticket: result.value });
  } catch (error) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to update ticket' });
  }
});

// Delete ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const result = await db.collection('2025').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to delete ticket' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoClient.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});