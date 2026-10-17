import { isServerActionRequest } from "@lib/proxy/serverAction";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * This app serves no Server Actions, so any request that carries a `Next-Action` header is turned
 * away with a bare 400 before it can reach Next and log an error (CHT-16). The matcher runs this on
 * requests that carry the header and on nothing else, so pages and assets never pass through it.
 */
const proxy = (request: NextRequest): NextResponse =>
  isServerActionRequest(request.headers) ? new NextResponse(null, { status: 400 }) : NextResponse.next();

export default proxy;

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image).*)", has: [{ type: "header", key: "next-action" }] }],
};
