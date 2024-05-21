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
  SummaryConfiguration, Metric, register,
} from 'prom-client';
import * as client from 'prom-client';
import { prometheus } from '../configuration';
import * as http from 'node:http';
import * as os from 'node:os';

export class PrometheusClient {
  private readonly registry: Registry<'text/plain; version=0.0.4; charset=utf-8'>;
  private readonly gateway: client.Pushgateway<client.RegistryContentType>;

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ pid: process.pid, hostname: os.hostname() });

    collectDefaultMetrics({
      register: this.registry,
      prefix: prometheus.metricPrefix,
      labels: { appName: 'prometheus_demo' },
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

    Registry.merge([this.registry, register]);
  }

  async getMetrics() {
    return await this.registry.metrics()
  }

  counterInc(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Counter) {
      labels ? metric.inc(labels, val) : metric.inc(val);
    }
  }

  gaugeInc(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.inc(labels, val) : metric.inc(val);
    }
  }

  gaugeDec(metricName: string, val: number, labels: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.dec(labels, val) : metric.dec(val);
    }
  }

  gaugeSet(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Gauge) {
      labels ? metric.set(labels, val) : metric.set(val);
    }
  }

  histogramObserve(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Histogram) {
      labels ? metric.observe(labels, val) : metric.observe(val);
    }
  }

  async summaryObserve(metricName: string, val: number, labels?: Record<string, number|string>) {
    const metric = this.registry.getSingleMetric(metricName);

    if (metric instanceof Summary) {
      labels ? metric.observe(labels, val) : metric.observe(val);
    }

    await this.push('pushAdd', {jobName: 'demo'});
  }

  async createCounterMetric<T extends string>(config: CounterConfiguration<T>) {
    const metric = new Counter(config);
    await this.registryMetric(metric);
  }

  async createGaugeMetric<T extends string>(config: GaugeConfiguration<T>) {
    const metric = new Gauge(config);
    await this.registryMetric(metric);
  }

  async createHistogramMetric<T extends string>(config: HistogramConfiguration<T>) {
    const metric = new Histogram(config);
    await this.registryMetric(metric);
  }

  async createSummaryMetric<T extends string>(config: SummaryConfiguration<T>) {
    const metric = new Summary(config);
    await this.registryMetric(metric);
  }

  private async registryMetric(metric: Metric) {
    const { name } = await metric.get();
    if (!this.registry.getSingleMetric(name)) {
      this.registry.registerMetric(metric);
    }
  }

  async push(
    action: 'pushAdd' | 'push' | 'delete',
    params: Pushgateway.Parameters,
  ) {
    try {
      await this.gateway[action](params);
    } catch (e) {
      console.error(e);
    }
  }
}
