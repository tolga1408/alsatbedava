export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

const getDemoLoginUrl = () => {
  const redirect =
    typeof window === "undefined"
      ? "/"
      : `${window.location.pathname}${window.location.search}`;

  return `/api/demo-login?redirect=${encodeURIComponent(redirect)}`;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const authorizeUrl = import.meta.env.VITE_OAUTH_AUTHORIZE_URL;
  const clientId = import.meta.env.VITE_OAUTH_CLIENT_ID;
  const scope = import.meta.env.VITE_OAUTH_SCOPE || "openid profile email";

  if (!authorizeUrl || !clientId || typeof window === "undefined") {
    return getDemoLoginUrl();
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  let url: URL;
  try {
    url = new URL(authorizeUrl);
  } catch {
    return getDemoLoginUrl();
  }

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("state", state);

  return url.toString();
};
