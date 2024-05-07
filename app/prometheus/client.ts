import {
  Registry,
  collectDefaultMetrics,
  Pushgateway,
  Histogram,
  Gauge,
  Summary,
  Counter,
  CounterConfiguration,
  GaugeConfiguration,
  HistogramConfiguration,
  SummaryConfiguration, Metric,
} from 'prom-client';
import * as client from 'prom-client';
import { prometheus } from '../configuration';
import * as http from 'node:http';
import * as os from 'node:os';

export class PrometheusClient {
  private readonly register: Registry<'text/plain; version=0.0.4; charset=utf-8'>;
  private readonly gateway: client.Pushgateway<client.RegistryContentType>;

  constructor() {
    this.register = new Registry();
    this.register.setDefaultLabels({ pid: process.pid });

    collectDefaultMetrics({
      register: this.register,
      prefix: prometheus.metricPrefix,
      labels: { hostname: os.hostname() },
    });

    this.gateway = new client.Pushgateway(prometheus.pushGateway.url, {
      timeout: prometheus.pushGateway.timeout,
      agent: new http.Agent({
        keepAliveMsecs: prometheus.pushGateway.keepAliveMsecs,
        keepAlive: prometheus.pushGateway.keepAlive,
        maxSockets: prometheus.pushGateway.maxSocket,
      }),
    });

    prometheus.counterMetrics.forEach(async (metric) => {
      await this.createCounterMetric(metric);
    });
    prometheus.gaugeMetrics.forEach(async (metric) => {
      await this.createGaugeMetric(metric);
    })
    prometheus.histogramMetrics.forEach(async (metric) => {
      await this.createHistogramMetric(metric);
    })
    prometheus.summaryMetrics.forEach(async (metric) => {
      await this.createSummaryMetric(metric);
    })
  }

  async getMetrics() {
    return await this.register.metrics()
  }

  counterInc(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Counter) {
      labels ? metric.inc(labels, val) : metric.inc(val);
    }
  }

  gaugeInc(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.inc(labels, val) : metric.inc(val);
    }
  }

  gaugeDec(metricName: string, val: number, labels: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.dec(labels, val) : metric.dec(val);
    }
  }

  gaugeSet(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.set(labels, val) : metric.set(val);
    }
  }

  histogramObserve(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Histogram) {
      labels ? metric.observe(labels, val) : metric.observe(val);
    }
  }

  summaryObserve(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.register.getSingleMetric(metricName);

    if (metric instanceof Summary) {
      labels ? metric.observe(labels, val) : metric.observe(val);
    }
  }

  async createCounterMetric<T extends string>(config: CounterConfiguration<T>) {
    const metric = new Counter(config);
    await this.registerMetric(metric);
  }

  async createGaugeMetric<T extends string>(config: GaugeConfiguration<T>) {
    const metric = new Gauge(config);
    await this.registerMetric(metric);
  }

  async createHistogramMetric<T extends string>(config: HistogramConfiguration<T>) {
    const metric = new Histogram(config);
    await this.registerMetric(metric);
  }

  async createSummaryMetric<T extends string>(config: SummaryConfiguration<T>) {
    const metric = new Summary(config);
    await this.registerMetric(metric);
  }

  private async registerMetric(metric: Metric) {
    const { name } = await metric.get();
    if (!this.register.getSingleMetric(name)) {
      this.register.registerMetric(metric)
    }
  }

  async push(
    action: 'pushAll' | 'push' | 'delete',
    params: Pushgateway.Parameters,
  ) {
    try {
      await this.gateway[action](params);
    } catch (e) {
      console.error(e);
    }
  }
}
