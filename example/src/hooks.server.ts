import type { Handle } from '@sveltejs/kit';
import { withOpenTelemetry } from '../../src/index'
import { BaselimeSDK, BetterHttpInstrumentation } from '@baselime/node-opentelemetry';

new BaselimeSDK({
    collectorUrl: 'https://otel.baselime.cc/v1',
    serverless: true,
    service: "svelte-demo",
    instrumentations: [
        new BetterHttpInstrumentation()
    ]
}).start();

export const handle: Handle= withOpenTelemetry(async ({ event, resolve }) => {
    return resolve(event);
});