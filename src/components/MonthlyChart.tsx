import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyData {
  month: string;
  month_name: string;
  await_review: number;
  pending: number;
  in_progress: number;
  active: number;
  completed: number;
  failed: number;
  rejected: number;
}

interface MonthlyChartProps {
  data: MonthlyData[];
  currentMonthIndex: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({
  data,
  currentMonthIndex,
  onPreviousMonth,
  onNextMonth,
  canGoPrevious,
  canGoNext,
}) => {
  const currentData = data[currentMonthIndex];
  
  if (!currentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const chartData = {
    labels: ['Await Review', 'Pending', 'In Progress', 'Active', 'Completed', 'Failed', 'Rejected'],
    datasets: [
      {
        label: 'Applications',
        data: [
          currentData.await_review,
          currentData.pending,
          currentData.in_progress,
          currentData.active,
          currentData.completed,
          currentData.failed,
          currentData.rejected,
        ],
        backgroundColor: [
          'rgb(255, 143, 0)',  // Amber-50 for await review
          'rgb(191, 54, 12)',  // Orange-50 for pending
          'rgb(27, 71, 114)',  // Blue-50 for in progress
          'rgb(27, 94, 32)',  // Green-50 for active
          'rgb(93, 64, 55)',  // Brown-50 for completed
          'rgb(239, 68, 68)',  // Red-50 for failed
          'rgb(224, 224, 224)',  // Gray-300 for rejected
        ],
        borderColor: [
          'rgb(255, 143, 0)',  // Amber-500
          'rgb(191, 54, 12)',  // Orange-500
          'rgb(27, 71, 114)',  // Blue-500
          'rgb(27, 94, 32)',  // Green-500
          'rgb(93, 64, 55)',  // Purple-500
          'rgb(239, 68, 68)',  // Red-500
          'rgb(224, 224, 224)',  // Gray-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="w-full">
      {/* Chart Header with Navigation */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {currentData.month_name}
        </h3>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <Bar data={chartData} options={options} />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-800 rounded"></div>
          <span className="text-sm text-gray-600">Await Review</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-deep-orange-500 rounded"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-900 rounded"></div>
          <span className="text-sm text-gray-600">In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-900 rounded"></div>
          <span className="text-sm text-gray-600">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-brown-700 rounded"></div>
          <span className="text-sm text-gray-600">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-700 rounded"></div>
          <span className="text-sm text-gray-600">Failed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-sm text-gray-600">Rejected</span>
        </div>
      </div>
    </div>
  );
};
