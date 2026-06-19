import { NextRequest } from "next/server";
import { proxy } from "@lib/backend";

export function POST(req: NextRequest): Promise<Response> {
  return proxy(req, "/auth/logout");
}
