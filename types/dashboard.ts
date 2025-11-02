export interface Connection {
  id: string;
  platform: string;
  name: string;
  isConnected: boolean;
  connectedAt?: string;
  token?: string;
  projectUrl?: string; // Add this for Supabase
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