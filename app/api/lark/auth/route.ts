import { NextRequest, NextResponse } from "next/server";
import { getAuthenV1AuthorizeURL } from "../api";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("scope") || "";
  const state = request.nextUrl.searchParams.get("state") || "";
  const url = getAuthenV1AuthorizeURL(code, state);

  return NextResponse.redirect(url);
}
