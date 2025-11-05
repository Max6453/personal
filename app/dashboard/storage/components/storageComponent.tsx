'use client';

import { useState, useEffect } from 'react';
import { Upload, File, Folder, Download, Trash2, Search, RefreshCw, Plus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useTokens } from '@/lib/token-context';

interface StorageFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  bucket: string;
  created_at: string;
}

export default function S3Storage() {
  const { supabaseToken } = useTokens();
  const [projectUrl, setProjectUrl] = useState('');
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [buckets, setBuckets] = useState<string[]>(['general', 'images', 'documents', 'videos']);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBucket, setSelectedBucket] = useState('general');
  const [error, setError] = useState('');
  const [showBucketModal, setShowBucketModal] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('supabase_project_url');
      const savedBuckets = localStorage.getItem('storage_buckets');
      if (savedUrl) {
        setProjectUrl(savedUrl);
      }
      if (savedBuckets) {
        setBuckets(JSON.parse(savedBuckets));
      }
    }
  }, []);

  useEffect(() => {
    if (supabaseToken && projectUrl) {
      fetchFiles();
    }
  }, [supabaseToken, projectUrl, selectedBucket]);

  // Save buckets to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('storage_buckets', JSON.stringify(buckets));
    }
  }, [buckets]);

  const getSupabaseClient = () => {
    if (!projectUrl || !supabaseToken) return null;
    return createClient(projectUrl, supabaseToken);
  };

  const fetchFiles = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      setLoading(true);
      setError('');

      const { data, error: fetchError } = await supabase
        .from('storage_files')
        .select('*')
        .eq('bucket', selectedBucket)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setFiles(data || []);
    } catch (err: any) {
      console.error('Error fetching files:', err);
      setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBucket = async () => {
    if (!newBucketName.trim()) return;

    const bucketName = newBucketName.toLowerCase().trim().replace(/\s+/g, '-');
    
    if (buckets.includes(bucketName)) {
      setError('Bucket already exists');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Create bucket in Supabase Storage
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });

      if (createError) {
        // If bucket already exists in storage but not in our list, just add it
        if (createError.message.includes('already exists')) {
          setBuckets([...buckets, bucketName]);
          setSelectedBucket(bucketName);
          setShowBucketModal(false);
          setNewBucketName('');
          return;
        }
        throw createError;
      }

      setBuckets([...buckets, bucketName]);
      setSelectedBucket(bucketName);
      setShowBucketModal(false);
      setNewBucketName('');
    } catch (err: any) {
      console.error('Error creating bucket:', err);
      setError(`Failed to create bucket: ${err.message}`);
    }
  };

  const handleDeleteBucket = async (bucketName: string) => {
    if (!confirm(`Are you sure you want to delete the "${bucketName}" bucket? This will delete all files in it.`)) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Delete all files in this bucket from database
      const { error: deleteFilesError } = await supabase
        .from('storage_files')
        .delete()
        .eq('bucket', bucketName);

      if (deleteFilesError) throw deleteFilesError;

      // Try to delete the bucket from storage (may fail if not empty, that's okay)
      await supabase.storage.deleteBucket(bucketName);

      // Remove from local state
      setBuckets(buckets.filter(b => b !== bucketName));
      if (selectedBucket === bucketName) {
        setSelectedBucket(buckets[0] || 'general');
      }
    } catch (err: any) {
      console.error('Error deleting bucket:', err);
      setError(`Failed to delete bucket: ${err.message}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase client not initialized');
      return;
    }

    setUploading(true);
    setError('');

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileName = `${Date.now()}-${file.name}`;
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(selectedBucket)
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          setError(`Failed to upload ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(selectedBucket)
          .getPublicUrl(fileName);

        // Save file metadata to database
        const { error: dbError } = await supabase
          .from('storage_files')
          .insert({
            name: file.name,
            size: file.size,
            type: file.type,
            url: urlData.publicUrl,
            bucket: selectedBucket,
          });

        if (dbError) {
          console.error('Database error:', dbError);
          setError(`Failed to save metadata for ${file.name}`);
        }
      }

      await fetchFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload files');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (fileId: string, fileName: string, fileUrl: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/');
      const filePath = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(selectedBucket)
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('storage_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;
      await fetchFiles();
    } catch (err: any) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!supabaseToken || !projectUrl) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Supabase Connection</p>
        <p className="text-gray-400 text-sm mt-2">Connect Supabase in Settings to use storage</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold font-work-sans mb-2">WH1</h2>
        <p className="text-blue-100">Store and download your files</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-background rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchFiles}
              disabled={loading}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="flex gap-2">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-5 h-5" />
              <span>{uploading ? 'Uploading...' : 'Upload Files'}</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Bucket Selector */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {buckets.map((bucket) => (
            <div key={bucket} className="relative group">
              <button
                onClick={() => setSelectedBucket(bucket)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedBucket === bucket
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bucket.charAt(0).toUpperCase() + bucket.slice(1)}
              </button>
              {bucket !== 'general' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteBucket(bucket);
                  }}
                  className="absolute -top-2 -right-2 hidden group-hover:block bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowBucketModal(true)}
            className="flex items-center gap-1 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            New Bucket
          </button>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-900">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.type || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(file.id, file.name, file.url)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-background rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No files in this bucket</p>
          <p className="text-gray-400 text-sm mt-2">Upload some files to get started</p>
        </div>
      )}

      {/* Create Bucket Modal */}
      {showBucketModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">Create New Bucket</h3>
                <button
                  onClick={() => {
                    setShowBucketModal(false);
                    setNewBucketName('');
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Bucket Name
                </label>
                <input
                  type="text"
                  value={newBucketName}
                  onChange={(e) => setNewBucketName(e.target.value)}
                  placeholder="e.g., my-bucket"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBucketModal(false);
                    setNewBucketName('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-foreground rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBucket}
                  disabled={!newBucketName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Create Bucket
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}