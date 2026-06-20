import { proxy } from "@lib/backend";
import type { NextRequest } from "next/server";

// Forwards to the backend's SSE endpoint; proxy() streams the token events back.
export function POST(req: NextRequest): Promise<Response> {
  return proxy(req, "/chat/stream");
}
