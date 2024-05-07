import {prometheusClient} from './prometheus';
import { DEMO_HISTOGRAM_METRIC } from './prometheus/constants';

// DEMO_HISTOGRAM_METRIC
(async () => {
  while (true) {
    const valCostco = Math.floor(Math.random() * 100);
    prometheusClient.histogramObserve(DEMO_HISTOGRAM_METRIC, valCostco, {provider: 'Costco'});
    console.log(`Histogram observe  ${valCostco} for provider costco`);

    await (new Promise(resolve => {
      const interval = Math.floor(Math.random() * 10000);
      setTimeout(() => {
        resolve('ok');
      }, interval);
    }));
    await prometheusClient.push('push', {jobName: 'demo'});
  }
})();

(async () => {
  while (true) {
    const valAuchan = Math.floor(Math.random() * 100);
    prometheusClient.histogramObserve(DEMO_HISTOGRAM_METRIC, valAuchan, {provider: 'Auchan'});
    console.log(`Histogram observe  ${valAuchan} for provider auchan`);

    await (new Promise(resolve => {
      const interval = Math.floor(Math.random() * 10000);
      setTimeout(() => {
        resolve('ok');
      }, interval);
    }));

    await prometheusClient.push('push', {jobName: 'demo'});
  }
})();
