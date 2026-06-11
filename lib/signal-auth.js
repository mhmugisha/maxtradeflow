// lib/signal-auth.js — Bearer auth for publish-signal and signal-event (A0-4).
//
// Accepts PUBLISH_SECRET (the token the live production bot already uses) and,
// if configured, SIGNAL_API_TOKEN. Accepting both lets the bot's token rotate
// during the v1→v2 transition without breaking the live publishing pipeline.

export function isAuthorized(request) {
  const auth = request.headers.get('authorization') || '';
  const tokens = [process.env.PUBLISH_SECRET, process.env.SIGNAL_API_TOKEN].filter(Boolean);
  return tokens.some((t) => auth === `Bearer ${t}`);
}
