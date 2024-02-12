# Svelte Kit OpenTelemetry Middleware

A streamlined OpenTelemetry Middleware for SvelteKit

```javascript
import { withOpenTelemetry } from '@baselime/sveltekit-opentelemetry-middleware'
import { BaselimeSDK } from '@baselime/node-opentelemetry';

new BaselimeSDK({}).start();

export const handle = withOpenTelemetry(async ({ event, resolve }) => {
    return resolve(event);
});
```

