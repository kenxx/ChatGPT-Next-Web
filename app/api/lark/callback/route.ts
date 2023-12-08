import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "../../redis";
import { getAuthenV1UserInfo, postAuthenV1OIDCAccessToken } from "../api";
import { createHash } from "crypto";

async function handle(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "code not found" });
  }
  const token = await postAuthenV1OIDCAccessToken(code);
  const userInfo = await getAuthenV1UserInfo(token.access_token);
  console.log("[token]", token, userInfo);

  const accessCode = createHash("sha256")
    .update(`${token.access_token}${userInfo.open_id}`)
    .digest("hex");

  getRedis().setex(
    `access_code:${accessCode}`,
    86400 * 30,
    JSON.stringify({
      token,
      user_info: userInfo,
    }),
  );

  const searchParams = new URLSearchParams();
  searchParams.append("code", accessCode);

  return NextResponse.json(
    { accessCode },
    {
      status: 302,
      headers: { Location: `/auth?${searchParams.toString()}` },
    },
  );
}

export const GET = handle;
