import React, { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';

// Initialize Highcharts modules using dynamic imports
const initHighchartsModules = async () => {
  try {
    // Import modules using dynamic import
    const HighchartsMore = await import('highcharts/highcharts-more');
    const HighchartsSolidGauge = await import('highcharts/modules/solid-gauge');

    // Initialize modules
    if (typeof HighchartsMore.default === 'function') {
      HighchartsMore.default(Highcharts);
    }

    if (typeof HighchartsSolidGauge.default === 'function') {
      HighchartsSolidGauge.default(Highcharts);
    }

    return true;
  } catch (error) {
    console.error('Error loading Highcharts modules:', error);
    return false;
  }
};

interface HighchartsComponentProps {
  options: Highcharts.Options;
  className?: string;
}

const HighchartsComponent: React.FC<HighchartsComponentProps> = ({ options, className }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  // Load Highcharts modules on component mount
  useEffect(() => {
    const loadModules = async () => {
      const success = await initHighchartsModules();
      setModulesLoaded(success);
    };

    loadModules();
  }, []);

  // Create chart when modules are loaded and options change
  useEffect(() => {
    if (!chartRef.current || !modulesLoaded) return;

    let chart: Highcharts.Chart | undefined;

    try {
      // Create chart with error handling
      chart = Highcharts.chart(chartRef.current, {
        ...options,
        chart: {
          ...options.chart,
          type: options.chart?.type || 'line', // Default to line chart if solidgauge fails
          backgroundColor: 'transparent',
          style: {
            fontFamily: 'Inter, sans-serif'
          }
        },
        credits: {
          enabled: false
        }
      });
    } catch (error) {
      console.error('Error creating Highcharts instance:', error);

      // Fallback to a simple display when chart creation fails
      if (chartRef.current) {
        chartRef.current.innerHTML = `
          <div class="p-4 text-center">
            <p class="text-safebite-text-secondary">Chart data unavailable</p>
          </div>
        `;
      }
    }

    return () => {
      if (chart) {
        try {
          chart.destroy();
        } catch (error) {
          console.error('Error destroying Highcharts instance:', error);
        }
      }
    };
  }, [options, modulesLoaded]);

  return (
    <div ref={chartRef} className={className} />
  );
};

export default HighchartsComponent;