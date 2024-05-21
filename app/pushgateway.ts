import {prometheusClient} from './prometheus';
import { DEMO_HISTOGRAM_METRIC, DEMO_SUMMARY_METRIC } from './prometheus/constants';
import * as os from 'node:os';

// DEMO_SUMMARY_METRIC PUSHGATEWAY
(async () => {
  while (true) {
    const val = Math.floor(Math.random() * 100);
    prometheusClient.summaryObserve(DEMO_SUMMARY_METRIC, val, {provider: 'Tesla'});
    console.log(`Summary observe  ${val} for provider Tesla`);

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
    const val = Math.floor(Math.random() * 100);
    prometheusClient.summaryObserve(DEMO_SUMMARY_METRIC, val, {provider: 'Toyota'});
    console.log(`Summary observe  ${val} for provider Toyota`);

    await (new Promise(resolve => {
      const interval = Math.floor(Math.random() * 10000);
      setTimeout(() => {
        resolve('ok');
      }, interval);
    }));
  }
})();

(async () => {
  while (true) {
    await (new Promise(resolve => {
      const interval = Math.floor(Math.random() * 10000);
      setTimeout(async () => {
        await prometheusClient.push('push', {jobName: 'demo', groupings:{ hostname: os.hostname()}});
        resolve('ok');
      }, interval);
    }));
  }
})();