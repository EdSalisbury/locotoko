import { Request } from "express";

// Behind Caddy, every request arrives from Caddy's own address; Caddy puts the
// real client address first in X-Forwarded-For and overwrites anything a
// client tries to send itself, since the client isn't a trusted proxy.
export function getClientIp(request: Request): string {
  const forwarded = request.headers["x-forwarded-for"];
  const forwardedStr = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (forwardedStr) {
    return forwardedStr.split(",")[0].trim();
  }
  return request.socket?.remoteAddress || "";
}
