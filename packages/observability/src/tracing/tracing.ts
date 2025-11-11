import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { defaultResource, resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export interface TracingOptions {
  serviceName: string;
  enabled?: boolean;
  exporterEndpoint?: string | null;
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';
}

let sdk: NodeSDK | null = null;
let shuttingDown = false;
let diagConfigured = false;

const configureDiagnostics = (level: DiagLogLevel) => {
  if (!diagConfigured) {
    diag.setLogger(new DiagConsoleLogger(), level);
    diagConfigured = true;
  }
};

const gracefulShutdown = async () => {
  if (!sdk || shuttingDown) {
    return;
  }

  shuttingDown = true;
  try {
    await sdk.shutdown();
  } finally {
    sdk = null;
    shuttingDown = false;
  }
};

export const initTracing = (options: TracingOptions): Promise<void> => {
  const { serviceName, enabled = false, exporterEndpoint, logLevel = 'error' } = options;

  if (!enabled) {
    return Promise.resolve();
  }

  if (sdk) {
    return Promise.resolve();
  }

  configureDiagnostics(
    {
      error: DiagLogLevel.ERROR,
      warn: DiagLogLevel.WARN,
      info: DiagLogLevel.INFO,
      debug: DiagLogLevel.DEBUG,
      verbose: DiagLogLevel.VERBOSE,
    }[logLevel] ?? DiagLogLevel.ERROR,
  );

  const resource = defaultResource().merge(
    resourceFromAttributes({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    }),
  );

  const traceExporter = exporterEndpoint
    ? new OTLPTraceExporter({ url: exporterEndpoint })
    : undefined;

  sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();

  process.once('SIGTERM', gracefulShutdown);
  process.once('SIGINT', gracefulShutdown);

  return Promise.resolve();
};

export const shutdownTracing = gracefulShutdown;
