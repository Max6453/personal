'use client'

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Search, FileText, Loader2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/sideHeader';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);  

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string; // Added user_id
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user and load notes
  useEffect(() => {
    getCurrentUser();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCurrentUserId(session?.user?.id || null);
        loadNotes(session?.user?.id || null);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUserId(null);
        setNotes([]);
        setSelectedNote(null);
        setIsEditing(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || null;
      setCurrentUserId(userId);
      
      if (userId) {
        await loadNotes(userId);
      } else {
        setLoading(false);
        setError('Not authenticated');
      }
    } catch (err: any) {
      console.error('Error getting current user:', err);
      setError('Failed to authenticate');
      setLoading(false);
    }
  };

  const loadNotes = async (userId: string | null) => {
    if (!userId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Loading notes for user:', userId);
      
      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId) // CRITICAL FIX: Filter by user_id
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Loaded notes:', data?.length || 0);
      setNotes(data || []);
      setError(null);
    } catch (err: any) {  
      console.error('Error loading notes:', err);
      setError(`Failed to load notes: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const createNewNote = async () => {
    if (!currentUserId) {
      setError('Not authenticated');
      return;
    }

    try {
      setSaving(true);
      console.log('Creating new note for user:', currentUserId);
      
      const newNote = {
        title: 'Untitled Note',
        content: '',
        user_id: currentUserId, // CRITICAL FIX: Add user_id
      };

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Note created:', data);
      setNotes([data, ...notes]);
      setSelectedNote(data);
      setEditTitle(data.title);
      setEditContent(data.content);
      setIsEditing(true);
      setError(null);
    } catch (err: any) {
      console.error('Error creating note:', err);
      setError(`Failed to create note: ${err.message || 'Unknown error'}, please contact support for additional assistance`);
    } finally {
      setSaving(false);
    }
  };

  const saveNote = async () => {
    if (!selectedNote || !currentUserId) return;

    try {
      setSaving(true);
      console.log('Saving note:', selectedNote.id);
      
      const { data, error: updateError } = await supabase
        .from('notes')
        .update({
          title: editTitle || 'Untitled Note',
          content: editContent,
        })
        .eq('id', selectedNote.id)
        .eq('user_id', currentUserId) // SECURITY: Ensure user owns the note
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      console.log('Note saved:', data);
      const updatedNotes = notes.map(note =>
        note.id === selectedNote.id ? data : note
      );
      setNotes(updatedNotes);
      setSelectedNote(data);
      setIsEditing(false);
      setError(null);
    } catch (err: any) {
      console.error('Error saving note:', err);
      setError(`Failed to save note: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!currentUserId) return;

    try {
      console.log('Deleting note:', id);
      
      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', currentUserId); // SECURITY: Ensure user owns the note

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('Note deleted');
      const filteredNotes = notes.filter(note => note.id !== id);
      setNotes(filteredNotes);
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError(`Failed to delete note: ${err.message || 'Unknown error'}`);
    }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    if (selectedNote) {
      setEditTitle(selectedNote.title);
      setEditContent(selectedNote.content);
    }
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">My Notes</h1>
            <div className="flex gap-2">
              <button
                onClick={createNewNote}
                disabled={saving || !currentUserId}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                title="Create new note"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">
                {searchQuery ? 'No notes found' : 'No notes yet. Create your first note!'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotes.map(note => (
                <div
                  key={note.id}
                  onClick={() => openNote(note)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition ${
                    selectedNote?.id === note.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-800 text-sm truncate flex-1">
                      {note.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this note?')) {
                          deleteNote(note.id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-1">
                    {note.content || 'No content'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(note.updated_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} total
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-50 border-b border-red-200 p-4 flex items-center justify-between">
            <span className="text-red-800 text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {selectedNote ? (
          <>
            {/* Note Header */}
            <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-2xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none w-full"
                    placeholder="Note title..."
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedNote.title}
                  </h2>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Last updated: {formatDate(selectedNote.updated_at)}
                </p>
              </div>
              
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEditing}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={saveNote}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEditing}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Note Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none font-mono text-gray-700"
                  placeholder="Start typing your note..."
                />
              ) : (
                <div className="prose max-w-none">
                  {selectedNote.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                      {selectedNote.content}
                    </pre>
                  ) : (
                    <p className="text-gray-400 italic">
                      This note is empty. Click Edit to add content.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No note selected
              </h3>
              <p className="text-gray-500 mb-4">
                Select a note from the sidebar or create a new one
              </p>
              <button
                onClick={createNewNote}
                disabled={saving || !currentUserId}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                Create New Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}