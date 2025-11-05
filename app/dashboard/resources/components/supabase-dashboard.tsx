'use client';

import { Database, Users, Key, Server, CheckCircle, Table, Shield, RefreshCw, ChevronRight, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTokens } from '@/lib/token-context';

interface TableInfo {
  table_name: string;
  table_schema: string;
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at?: string;
}

export default function SupabaseDashboard() {
  const { supabaseToken } = useTokens();
  const [projectUrl, setProjectUrl] = useState('');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'tables' | 'users'>('tables');
  const [showUrlInput, setShowUrlInput] = useState(false);
  
  // Table data viewer state
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableColumns, setTableColumns] = useState<string[]>([]);
  const [tableDataLoading, setTableDataLoading] = useState(false);

  useEffect(() => {
    // Load project URL from localStorage
    if (typeof window !== 'undefined') {
      const savedUrl = localStorage.getItem('supabase_project_url');
      if (savedUrl) {
        setProjectUrl(savedUrl);
      } else {
        setShowUrlInput(true);
      }
    }
  }, []);

  useEffect(() => {
    if (supabaseToken && projectUrl && !showUrlInput) {
      fetchData();
    }
  }, [supabaseToken, projectUrl, activeTab, showUrlInput]);

  const saveProjectUrl = () => {
    if (projectUrl) {
      const cleanUrl = projectUrl.replace(/\/$/, '');
      localStorage.setItem('supabase_project_url', cleanUrl);
      setProjectUrl(cleanUrl);
      setShowUrlInput(false);
      fetchData();
    }
  };

  const fetchData = async () => {
    if (activeTab === 'tables') {
      await fetchTables();
    } else {
      await fetchAuthUsers();
    }
  };

  const fetchTables = async () => {
    if (!supabaseToken) return;
    
    try {
      setLoading(true);
      setError('');

      const query = `
        select table_name, table_schema 
        from information_schema.tables 
        where table_schema = 'public' 
        and table_type = 'BASE TABLE'
      `.trim().replace(/\s+/g, ' ');

      const response = await fetch(
        `${projectUrl}/rest/v1/rpc/exec_sql`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseToken,
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ query })
        }
      );

      if (!response.ok) {
        const altResponse = await fetch(
          `${projectUrl}/rest/v1/`,
          {
            headers: {
              'apikey': supabaseToken,
              'Authorization': `Bearer ${supabaseToken}`,
              'Accept': 'application/json'
            }
          }
        );

        if (altResponse.ok) {
          const data = await altResponse.json();
          const tableNames = Object.keys(data.paths || {})
            .filter(path => path.startsWith('/') && !path.includes('rpc'))
            .map(path => ({
              table_name: path.substring(1),
              table_schema: 'public'
            }));
          
          setTables(tableNames);
        } else {
          setTables([]);
          setError('Unable to fetch tables. Make sure your API key has the correct permissions.');
        }
      } else {
        const data = await response.json();
        setTables(data || []);
      }
    } catch (err: any) {
      console.error('Fetch tables error:', err);
      setError('Failed to fetch tables. Check your project URL and API key.');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (tableName: string) => {
    if (!supabaseToken) return;
    
    try {
      setTableDataLoading(true);
      setError('');

      // Fetch data from the table (limit to 100 rows)
      const response = await fetch(
        `${projectUrl}/rest/v1/${tableName}?limit=100`,
        {
          headers: {
            'apikey': supabaseToken,
            'Authorization': `Bearer ${supabaseToken}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${tableName}`);
      }

      const data = await response.json();
      setTableData(data || []);
      
      // Extract column names from the first row
      if (data && data.length > 0) {
        setTableColumns(Object.keys(data[0]));
      } else {
        setTableColumns([]);
      }
      
      setSelectedTable(tableName);
    } catch (err: any) {
      console.error('Fetch table data error:', err);
      setError(`Failed to fetch data from ${tableName}. Check your API key permissions.`);
      setTableData([]);
      setTableColumns([]);
    } finally {
      setTableDataLoading(false);
    }
  };

  const closeTableViewer = () => {
    setSelectedTable(null);
    setTableData([]);
    setTableColumns([]);
    setError('');
  };

  const fetchAuthUsers = async () => {
    if (!supabaseToken) return;
    
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${projectUrl}/auth/v1/admin/users`,
        {
          headers: {
            'apikey': supabaseToken,
            'Authorization': `Bearer ${supabaseToken}`,
            'Content-Type': 'application/json'
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 401) {
          throw new Error('Access denied. You need a service_role key to view auth users.');
        }
        throw new Error('Failed to fetch auth users.');
      }

      const data = await response.json();
      setAuthUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch authentication users');
      setAuthUsers([]);
      console.error('Fetch auth users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  };

  if (!supabaseToken) {
    return (
      <div className="bg-background rounded-2xl shadow-sm p-12 text-center border border-gray-100">
        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg font-medium">No Supabase Token Connected</p>
        <p className="text-gray-400 text-sm mt-2">Connect your Supabase account in Settings to view database stats</p>
      </div>
    );
  }

  if (showUrlInput || !projectUrl) {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Supabase Database</h2>
          <p className="text-green-100">Real-time database and authentication</p>
        </div>

        <div className="bg-background rounded-2xl shadow-sm p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Enter Your Project URL</h3>
          <p className="text-gray-600 mb-4">
            Please enter your Supabase project URL to continue. You can find this in your project settings.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project URL
              </label>
              <input
                type="text"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxxx.supabase.co"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: https://your-project-id.supabase.co
              </p>
            </div>
            <button
              onClick={saveProjectUrl}
              disabled={!projectUrl}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save & Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Table Data Viewer
  if (selectedTable) {
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center gap-3">
            <button
              onClick={closeTableViewer}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-3xl font-bold mb-1">Table: {selectedTable}</h2>
              <p className="text-green-100">Viewing table data (max 100 rows)</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Table Data */}
        <div className="bg-background rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-green-700">Data</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tableData.length} row{tableData.length !== 1 ? 's' : ''} • {tableColumns.length} column{tableColumns.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => fetchTableData(selectedTable)}
                disabled={tableDataLoading}
                className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${tableDataLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {tableDataLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
            </div>
          ) : tableData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {tableColumns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-gray-200">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {tableColumns.map((column) => (
                        <td
                          key={column}
                          className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate"
                          title={formatValue(row[column])}
                        >
                          {formatValue(row[column])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Table className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No data in this table</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Supabase Database</h2>
            <p className="text-green-100">Real-time database and authentication</p>
          </div>
          <button
            onClick={() => setShowUrlInput(true)}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
          >
            Change URL
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Connection Info */}
      <div className="bg-background rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900">Connected</p>
              <p className="text-sm text-gray-500">{projectUrl}</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-background rounded-xl shadow-sm border border-gray-100 p-2">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors flex-1 ${
            activeTab === 'tables'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Table className="w-5 h-5" />
          <span className="font-medium">Tables</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors flex-1 ${
            activeTab === 'users'
              ? 'bg-green-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">Auth Users</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600"></div>
        </div>
      ) : (
        <div className="bg-background rounded-xl shadow-sm border border-gray-100">
          {activeTab === 'tables' ? (
            <>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-green-700">Database Tables</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {tables.length} table{tables.length !== 1 ? 's' : ''} found - Click to view data
                </p>
              </div>
              {tables.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {tables.map((table, index) => (
                    <button
                      key={index}
                      onClick={() => fetchTableData(table.table_name)}
                      className="w-full p-5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                            <Table className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-600">
                              {table.table_name}
                            </h4>
                            <p className="text-sm text-green-600">
                              Schema: {table.table_schema || 'public'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Table className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No tables found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Create tables in your Supabase dashboard or check your API key permissions
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-green-700">Authentication Users</h3>
                <p className="text-sm text-green-600 mt-1">
                  {authUsers.length} user{authUsers.length !== 1 ? 's' : ''} registered
                </p>
              </div>
              {authUsers.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {authUsers.map((user) => (
                    <div
                      key={user.id}
                      className="p-5 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-600">
                              {user.email}
                            </h4>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                              <span>Joined: {formatDate(user.created_at)}</span>
                              {user.last_sign_in_at && (
                                <>
                                  <span>•</span>
                                  <span>Last sign in: {formatDate(user.last_sign_in_at)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        {user.email_confirmed_at ? (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No users found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Note: Viewing auth users requires a service_role key
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}