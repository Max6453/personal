'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, Trash2 } from 'lucide-react';
import Header from '@/components/sideHeader';

interface Ticket {
  id: string;
  email: string;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  ticketNumber: string;
}

export default function SupportTicketSystem() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    description: '',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  // Load tickets on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/tickets');
      if (response.ok) {
        const tickets = await response.json();
        setTickets(tickets);
      } else {
        throw new Error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setStatus({ type: 'error', message: 'Failed to load tickets. Please try again later.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    if (!formData.email || !formData.subject || !formData.description) {
      setStatus({ type: 'error', message: 'Please fill in all fields' });
      setLoading(false);
      return;
    }

    const newTicket: Ticket = {
      ...formData,
      id: Date.now().toString(),
      status: 'open',
      createdAt: new Date().toISOString(),
      ticketNumber: `TKT-${Date.now().toString().slice(-6)}`
    };

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket)
      });

      const data = await response.json();
      
      if (response.ok) {
        setTickets([newTicket, ...tickets]);
        setStatus({ type: 'success', message: 'Ticket submitted successfully!' });
        setFormData({ email: '', subject: '', description: '' });
      } else {
        console.error('Server error:', data);
        setStatus({ 
          type: 'error', 
          message: data.error || 'Failed to submit ticket. Please try again later.' 
        });
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setStatus({ 
        type: 'error', 
        message: error instanceof Error ? error.message : 'Failed to submit ticket. Please try again later.' 
      });
    }

    setLoading(false);
  };

  const deleteTicket = async (id: string) => {
    try {
      const response = await fetch('/api/tickets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        const updatedTickets = tickets.filter(t => t.id !== id);
        setTickets(updatedTickets);
        setStatus({ type: 'success', message: 'Ticket deleted successfully!' });
      } else {
        throw new Error('Failed to delete ticket');
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setStatus({ type: 'error', message: 'Failed to delete ticket. Please try again later.' });
    }
  };

  return (
    <div >
     <Header/>
     <div className="bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-neutral-800 rounded-lg shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
          <p className="text-blue-600 mb-6">Submit your issues and we'll get back to you soon</p>

          {/* Status Message */}
          {status.message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {status.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span>{status.message}</span>
            </div>
          )}

          {/* Ticket Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide detailed information about your issue..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Send size={20} />
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
     </div>
    </div>
  );
}