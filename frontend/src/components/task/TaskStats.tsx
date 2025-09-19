// ===== TASK STATS COMPONENT =====
import React from 'react';
import type { TaskStats as TaskStatsType } from '../../types';
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react';

interface TaskStatsProps {
  stats: TaskStatsType;
}

const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  const statItems = [
    {
      name: 'Total Tasks',
      value: stats.total,
      icon: CheckSquare,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      name: 'In Progress',
      value: stats.inProgress,
      icon: TrendingUp,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Completed',
      value: stats.completed,
      icon: CheckSquare,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Overdue',
      value: stats.overdue,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.name} className="card">
            <div className="card-content">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg shadow-sm ${item.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {item.name}
                    </dt>
                    <dd className={`text-lg font-semibold ${item.textColor}`}>
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStats;


