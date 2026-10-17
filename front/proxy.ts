import { isForgedAction } from "@lib/proxy/forgedAction";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Only here to turn away forged Server Action probes (CHT-16). The matcher runs it on requests that
 * carry a `Next-Action` header and on nothing else, so pages and assets never pass through it.
 */
const proxy = (request: NextRequest): NextResponse =>
  isForgedAction(request.headers) ? new NextResponse(null, { status: 400 }) : NextResponse.next();

export default proxy;

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image).*)", has: [{ type: "header", key: "next-action" }] }],
};
