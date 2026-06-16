import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '../common/Card';

interface SensorChartProps {
  title: string;
  data: { timestamp: string; value: number }[];
  color?: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({ title, data, color = '#3b82f6' }) => {
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};