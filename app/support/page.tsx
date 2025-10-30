'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Send, Trash2 } from 'lucide-react';
import Header from '@/components/sideHeader';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

type Ticket = Database['public']['Tables']['tickets']['Row'];

export default function SupportTicketSystem() {
  const supabase = createClientComponentClient<Database>();
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
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (tickets) setTickets(tickets);
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

    const newTicket = {
      email: formData.email,
      subject: formData.subject,
      description: formData.description,
      status: 'open' as const,
      ticket_number: `TKT-${Date.now().toString().slice(-6)}`,
    };

    try {
      // Insert the ticket into Supabase
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(newTicket)
        .select()
        .single();

      if (error) throw error;

      if (ticket) {
        // Send email notification
        await fetch('/api/notify-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticket }),
        });

        setTickets([ticket, ...tickets]);
        setStatus({ type: 'success', message: 'Ticket submitted successfully!' });
        setFormData({ email: '', subject: '', description: '' });
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
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedTickets = tickets.filter(t => t.id !== id);
      setTickets(updatedTickets);
      setStatus({ type: 'success', message: 'Ticket deleted successfully!' });
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setStatus({ type: 'error', message: 'Failed to delete ticket. Please try again later.' });
    }
  };

  return (
    <div>
      <Header/>
      <div className="bg-background p-6">
        <div className="max-w-6xl mx-auto">
          {/* Ticket Submission Form */}
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

          {/* Tickets List */}
          <div className="bg-neutral-800 rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Tickets</h2>
            
            {tickets.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tickets yet. Submit your first ticket above!</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-neutral-700 rounded-lg p-6 border border-neutral-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-blue-400">{ticket.ticket_number}</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.status === 'open' ? 'bg-green-600 text-white' : 
                            ticket.status === 'in_progress' ? 'bg-yellow-600 text-white' : 
                            'bg-gray-600 text-white'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">{ticket.subject}</h3>
                      </div>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete ticket"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <p className="text-gray-300 mb-3">{ticket.description}</p>
                    
                    <div className="text-sm text-gray-400">
                      <span>Email: {ticket.email}</span>
                      <span className="mx-2">•</span>
                      <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}