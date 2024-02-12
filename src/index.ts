import type { Handle } from '@sveltejs/kit';
import { trace, propagation, ROOT_CONTEXT } from '@opentelemetry/api';
import { flatten } from 'flat';

type TraceOptions = {
    captureRequestBody?: boolean;
    captureResponseBody?: boolean;
}

const possibleRequestIdHeaders = [
    "x-request-id",
    "x-vercel-id"
];


export function withOpenTelemetry(fn: Handle, opts?: TraceOptions): Handle {
    opts = opts || {};
    const tracer = trace.getTracer('svelte-kit');
    return async function (args) {
        const name = `${args.event.request.method} ${args.event.route.id}`;

        const traceParent = propagation.extract(ROOT_CONTEXT, args.event.request.headers);

        let requestId: string | undefined = undefined;
        for(const [key, value] of args.event.request.headers.entries()) {
            if(possibleRequestIdHeaders.includes(key.toLowerCase())) {
                requestId = value;
                break;
            }
        }

        return tracer.startActiveSpan(name, {
            // SpanKind.SERVER -> 1
            kind: 1,
            attributes: flatten({
                requestId,
                http: {
                    headers: args.event.request.headers,
                    method: args.event.request.method,
                    url: args.event.request.url,
                    ...opts.captureRequestBody && {
                        request: {
                            // todo format based on headers
                            body: args.event.request.body,
                        }
                    },
                   
                },
                svelte: {
                    route: args.event.route,
                    isDataRequest: args.event.isDataRequest,
                    isSubRequest: args.event.isSubRequest,
                    params: args.event.params,
                    platform: args.event.platform
                }
            })
        }, traceParent, async (span) => {

            const res = await fn(args);

            span.setAttributes(flatten({
                http: {
                    status: res.status,
                    ...opts.captureResponseBody && {
                        response: {
                            body: res.body
                        }
                    }
                }
            }));
            
            span.end();

            return res;
        });
    };
}