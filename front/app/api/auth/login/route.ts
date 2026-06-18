import { NextRequest } from 'next/server';
import { proxy } from '@lib/backend';

// Backend sets the session cookie; the proxy relays its Set-Cookie to the browser.
export function POST(req: NextRequest): Promise<Response> {
  return proxy(req, '/auth/login');
}
