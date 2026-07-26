const DEFAULT_PUBLIC_SITE_ORIGIN = 'https://www.signatureluxeevents.com';

function normalizeOrigin(value: string, variableName: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${variableName} must use http or https.`);
  }

  if (url.username || url.password || url.search || url.hash || (url.pathname && url.pathname !== '/')) {
    throw new Error(`${variableName} must be an origin without credentials, a path, query parameters, or a fragment.`);
  }

  return url.origin;
}

function configuredOrigin(variableNames: string[]) {
  for (const variableName of variableNames) {
    const value = process.env[variableName]?.trim();
    if (value) return normalizeOrigin(value, variableName);
  }

  return null;
}

function vercelDeploymentOrigin() {
  const hostname =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!hostname) return null;

  return normalizeOrigin(
    hostname.startsWith('http://') || hostname.startsWith('https://')
      ? hostname
      : `https://${hostname}`,
    'VERCEL_PROJECT_PRODUCTION_URL/VERCEL_URL',
  );
}

function developmentRequestOrigin(request?: Request) {
  if (!request || process.env.NODE_ENV === 'production') return null;

  try {
    return normalizeOrigin(new URL(request.url).origin, 'request URL');
  } catch {
    return null;
  }
}

/**
 * Public marketing origin. This is safe for customer-facing links and public
 * email assets, but it must never be used to infer an admin or token host after
 * the applications are split.
 */
export function getPublicSiteOrigin() {
  return (
    configuredOrigin(['PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL', 'APP_URL']) ||
    DEFAULT_PUBLIC_SITE_ORIGIN
  );
}

/**
 * Protected Next.js operations origin. ADMIN_APP_URL is the permanent setting;
 * legacy variables remain as a reversible migration fallback.
 */
export function getAdminAppOrigin(request?: Request) {
  return (
    configuredOrigin(['ADMIN_APP_URL', 'APP_URL', 'NEXT_PUBLIC_APP_URL']) ||
    vercelDeploymentOrigin() ||
    developmentRequestOrigin(request) ||
    DEFAULT_PUBLIC_SITE_ORIGIN
  );
}

/**
 * Origin that owns /quote/[token] and /api/quote/[token]/**. The page and its
 * APIs must remain on the same origin unless a path proxy forwards both.
 */
export function getCustomerWorkflowOrigin(request?: Request) {
  return (
    configuredOrigin(['CUSTOMER_WORKFLOW_URL', 'NEXT_PUBLIC_APP_URL', 'APP_URL']) ||
    vercelDeploymentOrigin() ||
    developmentRequestOrigin(request) ||
    DEFAULT_PUBLIC_SITE_ORIGIN
  );
}
