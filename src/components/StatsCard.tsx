import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend?: string;
}

const colorVariants = {
  blue: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600'
  },
  green: {
    bg: 'from-green-500 to-green-600',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    icon: 'bg-purple-100 text-purple-600',
    text: 'text-purple-600'
  },
  orange: {
    bg: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-100 text-orange-600',
    text: 'text-orange-600'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend
}) => {
  const variant = colorVariants[color];

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${variant.bg} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
              {trend && (
                <span className={`text-sm font-medium ${variant.text}`}>
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${variant.icon}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
