import { createClient } from './supabase';

export async function getUserData<T>(
  tableName: string,
  columns: string = '*',
  extraQuery?: (query: any) => any
) {
  const supabase = createClient();
  let query = supabase
    .from(tableName)
    .select(columns);

  // Apply any extra query modifications if provided
  if (extraQuery) {
    query = extraQuery(query);
  }

  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }

  return data as T[];
}

export async function insertUserData<T>(
  tableName: string,
  data: Partial<T>
) {
  const supabase = createClient();
  const { data: insertedData, error } = await supabase
    .from(tableName)
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(`Error inserting data: ${error.message}`);
  }

  return insertedData as T;
}

export async function updateUserData<T>(
  tableName: string,
  id: number | string,
  data: Partial<T>
) {
  const supabase = createClient();
  const { data: updatedData, error } = await supabase
    .from(tableName)
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating data: ${error.message}`);
  }

  return updatedData as T;
}

export async function deleteUserData(
  tableName: string,
  id: number | string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting data: ${error.message}`);
  }

  return true;
}

// Helper to check if user is authenticated
export async function isUserAuthenticated() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

// Helper to get current user ID
export async function getCurrentUserId() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id;
}

// Middleware helper to check auth
export async function requireAuth() {
  const isAuth = await isUserAuthenticated();
  if (!isAuth) {
    throw new Error('Authentication required');
  }
}