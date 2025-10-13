'use client';

import { LucideIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down';
}

export function StatCard({ icon: Icon, title, value, change, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <TrendingUp className={`w-3 h-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}