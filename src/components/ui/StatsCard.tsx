import React from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  change,
  color = 'green',
}) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      icon: 'text-green-500',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      icon: 'text-blue-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      icon: 'text-purple-500',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      icon: 'text-orange-500',
    },
    red: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      icon: 'text-red-500',
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center">
              {change.type === 'increase' ? (
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              <span className={`ml-1 text-sm font-medium ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change.value}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color].bg} ${colorClasses[color].icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;