import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-2 text-gray-700">{title}</h3>}
      <div>{children}</div>
    </div>
  );
};