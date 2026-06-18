import { NextRequest } from 'next/server';
import { proxy } from '@lib/backend';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return proxy(req, `/conversations/${encodeURIComponent(id)}`);
}

export async function DELETE(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { id } = await ctx.params;
  return proxy(req, `/conversations/${encodeURIComponent(id)}`);
}
