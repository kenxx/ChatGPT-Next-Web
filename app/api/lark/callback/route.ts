import { NextRequest, NextResponse } from "next/server";
import { redis } from "../redis";
import { postAuthenV1OIDCAccessToken } from "../api";

async function handle(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code not found" });
  }
  const res = await postAuthenV1OIDCAccessToken(code);
  return NextResponse.json({ res });
}

export const GET = handle;
