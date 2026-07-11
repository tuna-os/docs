// Minimal Worker entry point for Workers + Assets (static site).
// All requests are proxied to the static assets directory.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
