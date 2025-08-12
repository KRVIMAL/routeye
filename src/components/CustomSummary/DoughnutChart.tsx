// components/CustomSummary/DoughnutChart.tsx - Updated to match Chart.js docs
import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  Plugin,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartData {
  label: string;
  value: number;
  color: string;
  percentage: number;
}

interface DoughnutChartProps {
  data: ChartData[];
}

const DoughnutChart: React.FC<DoughnutChartProps> = ({ data }) => {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);

  // Transform our data to Chart.js format (following the docs structure)
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Distribution',
        data: data.map(item => item.value),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#ffffff',
        cutout: '60%', // Creates the doughnut hole
      },
    ],
  };

  // Chart configuration (following the docs structure)
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false, // We handle legend separately in the card
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const percentage = data[context.dataIndex]?.percentage || 0;
            return `${label}: ${percentage}%`;
          },
        },
      },
    },
    elements: {
      arc: {
        borderWidth: 0,
        hoverBorderWidth: 2,
      },
    },
    animation: {
      duration: 800,
      easing: 'easeInOutQuart',
    },
    interaction: {
      intersect: false,
    },
    onHover: (event, activeElements, chart) => {
      if (chart && chart.canvas) {
        chart.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
    },
  };

  // Plugin to draw percentage text on segments
  const textPlugin: Plugin<'doughnut'> = {
    id: 'textPlugin',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      
      if (!meta.data || meta.data.length === 0) return;

      ctx.save();
      ctx.font = 'bold 12px Poppins, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      meta.data.forEach((element:any, index:any) => {
        if (element && element.circumference && element.circumference > 0.3) {
          const percentage = data[index]?.percentage || 0;
          if (percentage >= 10) { // Only show percentage for segments >= 10%
            const { x, y } = element.getCenterPoint();
            ctx.fillText(`${percentage}%`, x, y);
          }
        }
      });

      ctx.restore();
    },
  };

  // Register/unregister plugin
  useEffect(() => {
    ChartJS.register(textPlugin);
    return () => {
      ChartJS.unregister(textPlugin);
    };
  }, [data]);

  return (
    <div 
      style={{ 
        width: '83.69px', 
        height: '83.69px',
        position: 'relative',
      }}
    >
      <Doughnut 
        ref={chartRef}
        data={chartData} 
        options={options}
      />
    </div>
  );
};

export default DoughnutChart;