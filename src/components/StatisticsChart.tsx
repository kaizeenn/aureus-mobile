
import React from 'react';
import { Transaction } from '@/pages/Index';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3 } from 'lucide-react';


interface StatisticsChartProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
}

function formatCompactId(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({ transactions, selectedMonth, selectedYear }) => {
  const monthlyTransactions = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const totalsByDay = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    return { day, income: 0, expense: 0 };
  });

  for (const t of monthlyTransactions) {
    const d = new Date(t.date);
    const day = d.getDate();
    const bucket = totalsByDay[day - 1];
    if (!bucket) continue;
    if (t.type === 'income') bucket.income += t.amount;
    if (t.type === 'expense') bucket.expense += t.amount;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Tren Harian
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[260px] w-full"
          config={{
            income: {
              label: "Masuk",
              theme: { light: "hsl(var(--success))", dark: "hsl(var(--success))" },
            },
            expense: {
              label: "Keluar",
              theme: { light: "hsl(var(--destructive))", dark: "hsl(var(--destructive))" },
            },
          }}
        >
          <BarChart data={totalsByDay} margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              tickMargin={8}
              tickFormatter={(v) => String(v)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tickFormatter={(v) => formatCompactId(Number(v))}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(label) => `Tanggal ${label}`}
                  formatter={(value, name) => {
                    const n = typeof value === 'number' ? value : Number(value);
                    const label = name === 'income' ? 'Masuk' : 'Keluar';
                    return (
                      <div className="flex w-full items-center justify-between gap-6">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-mono font-medium tabular-nums">
                          Rp {n.toLocaleString('id-ID')}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Bar dataKey="income" fill="var(--color-income)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="expense" fill="var(--color-expense)" radius={[6, 6, 0, 0]} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default StatisticsChart;
