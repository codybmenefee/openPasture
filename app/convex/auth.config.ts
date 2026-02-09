import { AuthConfig } from "convex/server";

function normalizeIssuerDomain(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

const issuerDomain = normalizeIssuerDomain(
  process.env.CLERK_JWT_ISSUER_DOMAIN ||
    // Common fallback in Clerk setups.
    process.env.CLERK_FRONTEND_API_URL ||
    // Workspace default fallback for this app.
    "https://clerk.themodernstrategy.com"
);

const issuerVariants = Array.from(new Set([issuerDomain, `${issuerDomain}/`]));

const providers: AuthConfig["providers"] = [
  // Preferred path: Clerk "convex" JWT template with aud=convex.
  {
    domain: issuerDomain,
    applicationID: "convex",
  },
  // Compatibility path: accept Clerk-issued JWTs without requiring aud=convex.
  // Include both issuer variants because some setups emit a trailing slash.
  ...issuerVariants.map((issuer) => ({
    type: "customJwt" as const,
    issuer,
    jwks: `${issuerDomain}/.well-known/jwks.json`,
    algorithm: "RS256" as const,
  })),
];

export default {
  providers,
} satisfies AuthConfig;
