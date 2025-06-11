import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

// Initialize Sentry for server-side
Sentry.init({
  dsn: "https://cd41a5d2777ee6ff7f5f4941280505e2@o4509349182373888.ingest.de.sentry.io/4509349185847376",

  // Send personally identifiable information (PII) such as IP address and headers
  sendDefaultPii: true,

  // Profiling and tracing integrations
  integrations: [
    // Profiling must come before Http or Express integrations
    nodeProfilingIntegration(),
  ],

  tracesSampleRate: 1.0,    // Capture 100% of transactions (adjust for production)
  profilesSampleRate: 1.0,  // Profile every traced transaction
});
