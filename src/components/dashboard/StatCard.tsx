import React from 'react';
import { Card } from '../common/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, unit, icon, color = 'blue' }) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>
            {value} {unit && <span className="text-sm">{unit}</span>}
          </p>
        </div>
        {icon && <div className="text-3xl">{icon}</div>}
      </div>
    </Card>
  );
};