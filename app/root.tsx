import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import * as Sentry from "@sentry/react-router";

import type { Route } from "./+types/root";
import "./app.css";

// Initialize Sentry
Sentry.init({
  dsn: "https://cd41a5d2777ee6ff7f5f4941280505e2@o4509349182373888.ingest.de.sentry.io/4509349185847376",
  sendDefaultPii: true,
  // Comment out the replay integration:
  // integrations: [Sentry.replayIntegration()],
  integrations: [],
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
});

// Syncfusion License Registration
import { registerLicense } from "@syncfusion/ej2-base";
registerLicense(import.meta.env.VITE_SYNCFUSION_LICENSE_KEY);

// External fonts and styles
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Layout component
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

// Main app component
export default function App() {
  return <Outlet />;
}

// Error boundary for handling unexpected and route errors
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    if (import.meta.env.DEV) {
      stack = error.stack;
    }
    Sentry.captureException(error);
    details = error.message;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1 className="text-3xl font-bold mb-2">{message}</h1>
      <p className="text-lg mb-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 bg-gray-100 rounded overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
