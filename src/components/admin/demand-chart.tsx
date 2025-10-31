'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card } from '../ui/card';

const chartData = [
  { month: 'January', standard: 186, luxury: 80 },
  { month: 'February', standard: 305, luxury: 200 },
  { month: 'March', standard: 237, luxury: 120 },
  { month: 'April', standard: 273, luxury: 190 },
  { month: 'May', standard: 209, luxury: 130 },
  { month: 'June', standard: 214, luxury: 140 },
];

const chartConfig = {
  standard: {
    label: 'Standard',
    color: 'hsl(var(--chart-1))',
  },
  luxury: {
    label: 'Luxury',
    color: 'hsl(var(--chart-2))',
  },
};

export function DemandChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[350px]">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="standard" fill="var(--color-standard)" radius={4} />
        <Bar dataKey="luxury" fill="var(--color-luxury)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
