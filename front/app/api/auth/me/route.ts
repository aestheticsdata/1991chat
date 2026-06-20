import { proxy } from "@lib/backend";
import type { NextRequest } from "next/server";

export function GET(req: NextRequest): Promise<Response> {
  return proxy(req, "/auth/me");
}
