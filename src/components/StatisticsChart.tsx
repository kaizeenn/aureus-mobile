
import React from 'react';
import { Transaction } from '@/pages/Index';


interface StatisticsChartProps {
  transactions: Transaction[];
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ transactions }) => {
  return (
    <div className="space-y-6">
      {/* Statistics chart content will be implemented here */}
    </div>
  );
};

export default StatisticsChart;
