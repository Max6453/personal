export interface Connection {
  id: string;
  platform: 'vercel' | 'supabase' | 'github';
  name: string;
  isConnected: boolean;
  connectedAt?: string;
  token?: string;
}

export interface AnalyticsData {
  visitors: Array<{ date: string; visitors: number; pageviews: number }>;
  topPages: Array<{ page: string; views: number }>;
  metrics: { 
    totalVisitors: number; 
    totalPageviews: number; 
    avgLoadTime: string; 
    bounceRate: string 
  };
}