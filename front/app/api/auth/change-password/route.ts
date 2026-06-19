import { proxy } from "@lib/backend";
import type { NextRequest } from "next/server";

export function POST(req: NextRequest): Promise<Response> {
  return proxy(req, "/auth/change-password");
}
