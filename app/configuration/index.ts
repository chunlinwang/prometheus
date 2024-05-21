export const port = process.env.PORT || 3000;

export const prometheus = {
  pushGateway: {
    url: process.env.PROMETHEUS_PUSH_GATEWAY,
    timeout: 5000,
    maxSocket: 5,
    keepAliveMsecs: 1000,
    keepAlive: true,
  },
  metricPrefix: 'prometheus_demo_',
  counterMetrics: [
    {
      name: 'demo_counter_metric',
      help: 'demo_counter_metric',
      labelNames: ['provider']
    }
  ],
  gaugeMetrics: [
    {
      name: 'demo_gauge_metric',
      help: 'demo_gauge_metric',
      labelNames: ['provider']
    }
  ],
  histogramMetrics: [
    {
      name: 'demo_histogram_metric',
      help: 'demo_histogram_metric',
      labelNames: ['provider'],
      buckets: [0.1, 1, 5, 15, 30, 50, 100, 200, 400, 500],
    }
  ],
  summaryMetrics: [
    {
      name: 'demo_summary_metric',
      help: 'demo_summary_metric',
      labelNames: ['provider'],
      percentiles: [0.01, 0.1, 0.3, 0.5, 0.7, 0.9, 0.99],
    }
  ],
};

export default {
  port,
  prometheus,
};
