import { NextRequest } from "next/server";
import { proxy } from "@lib/backend";

export function GET(req: NextRequest): Promise<Response> {
  return proxy(req, "/conversations");
}

export function POST(req: NextRequest): Promise<Response> {
  return proxy(req, "/conversations");
}
