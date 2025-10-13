import { createClient } from './supabase';

const supabase = createClient();

export type Platform = 'vercel' | 'supabase' | 'github';

export interface PlatformToken {
  platform: Platform;
  token: string;
  connectedAt: string;
}

export async function savePlatformToken(platform: Platform, token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('platform_tokens')
      .upsert({
        user_id: user.id,
        platform,
        token,
      });

    if (error) throw error;
    
    // Also save to localStorage as backup
    const savedConnections = localStorage.getItem('platform_connections');
    const connections = savedConnections ? JSON.parse(savedConnections) : [];
    const updatedConnections = connections.map((c: any) =>
      c.platform === platform
        ? { ...c, isConnected: true, connectedAt: new Date().toISOString(), token }
        : c
    );
    localStorage.setItem('platform_connections', JSON.stringify(updatedConnections));

    return true;
  } catch (error) {
    console.error('Error saving platform token:', error);
    return false;
  }
}

export async function getPlatformToken(platform: Platform): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('platform_tokens')
      .select('token')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .single();

    if (error) throw error;
    return data?.token || null;
  } catch (error) {
    console.error('Error getting platform token:', error);
    return null;
  }
}

export async function deletePlatformToken(platform: Platform) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('platform_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', platform);

    if (error) throw error;

    // Also remove from localStorage
    const savedConnections = localStorage.getItem('platform_connections');
    const connections = savedConnections ? JSON.parse(savedConnections) : [];
    const updatedConnections = connections.map((c: any) =>
      c.platform === platform
        ? { ...c, isConnected: false, connectedAt: undefined, token: undefined }
        : c
    );
    localStorage.setItem('platform_connections', JSON.stringify(updatedConnections));

    return true;
  } catch (error) {
    console.error('Error deleting platform token:', error);
    return false;
  }
}

export async function getAllPlatformTokens(): Promise<PlatformToken[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('platform_tokens')
      .select('platform, token, connected_at')
      .eq('user_id', user.id);

    if (error) throw error;

    return data.map(({ platform, token, connected_at }) => ({
      platform: platform as Platform,
      token,
      connectedAt: new Date(connected_at).toISOString(),
    }));
  } catch (error) {
    console.error('Error getting platform tokens:', error);
    return [];
  }
}