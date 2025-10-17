'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface RechartsWrapperProps {
  workSessionId: string;
  employeeId: string;
}

interface ChartData {
  name: string;
  hours: number;
  productivity: number;
}

export default function RechartsWrapper({ workSessionId, employeeId }: RechartsWrapperProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading chart data
    const loadChartData = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockData = [
        { name: 'Mon', hours: 8.5, productivity: 85 },
        { name: 'Tue', hours: 7.2, productivity: 78 },
        { name: 'Wed', hours: 9.1, productivity: 92 },
        { name: 'Thu', hours: 8.8, productivity: 88 },
        { name: 'Fri', hours: 7.5, productivity: 82 },
        { name: 'Sat', hours: 4.0, productivity: 95 },
        { name: 'Sun', hours: 2.0, productivity: 90 }
      ];
      
      setData(mockData);
      setLoading(false);
    };

    loadChartData();
  }, [workSessionId, employeeId]);

  const pieData = [
    { name: 'Work', value: 35, color: '#3B82F6' },
    { name: 'Break', value: 8, color: '#F59E0B' },
    { name: 'Idle', value: 2, color: '#EF4444' },
    { name: 'Offline', value: 3, color: '#6B7280' }
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Hours Chart */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Hours</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Productivity Trend */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="productivity" stroke="#10B981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time Distribution */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Time Distribution</h4>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props: Record<string, unknown>) => {
                const name = props.name as string;
                const percent = props.percent as number;
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
