import type { Request } from "express";

interface DraftRow {
  id: string;
  title: string;
  lucidaItemNumber: string | null;
  identifyStatus: string | null;
  identifyError: string | null;
  createdAt: Date;
}

// The address Locotoko was reached at (behind Caddy, from its forwarded
// headers), for the draft's edit page link.
export function siteAddress(request: Pick<Request, "headers" | "protocol">): string {
  const forwardedProto = request.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0].trim();
  const forwardedHost = request.headers["x-forwarded-host"];
  const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || request.headers.host;
  return `${proto || request.protocol}://${host}`;
}

// What Lucida gets back about a draft: where it stands and its edit page.
export function draftAnswer(draft: DraftRow, site: string) {
  const status =
    draft.identifyStatus === "identifying" || draft.identifyStatus === "failed" ? draft.identifyStatus : "ready";
  return {
    id: draft.id,
    lucidaItemNumber: draft.lucidaItemNumber,
    status,
    error: status === "failed" ? draft.identifyError : null,
    title: draft.title,
    editUrl: `${site}/editItem/${draft.id}`,
    createdAt: draft.createdAt,
  };
}
