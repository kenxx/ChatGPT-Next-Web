import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const { LARK_APP_ID, LARK_APP_SECRET } = process.env;

function checkAPIError<
  T extends {
    code: number;
    msg: string;
  },
>(res: T) {
  if (res.code !== 0) {
    throw new Error(`Lark API Error ${res.msg}`);
  }

  return res;
}

async function authorizeTenantAccessToken(): Promise<{
  code: number;
  msg: string;
  tenant_access_token: string;
  expire: number;
}> {
  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_id: LARK_APP_ID,
        app_secret: LARK_APP_SECRET,
      }),
    },
  );

  return await res.json().then(checkAPIError);
}

async function getJSSDKTicket(): Promise<{
  code: number;
  msg: string;
  data: {
    expire_in: number;
    ticket: string;
  };
}> {
  const token = await authorizeTenantAccessToken();
  const res = await fetch("https://open.feishu.cn/open-apis/jssdk/ticket/get", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token.tenant_access_token}`,
    },
  });

  return await res.json().then(checkAPIError);
}

async function handle(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const timestamp = +new Date();
  const nonce = randomBytes(12).toString("base64");
  const ticket = await getJSSDKTicket();

  const sign = createHash("sha1")
    .update(
      `jsapi_ticket=${ticket.data.ticket}&noncestr=${nonce}&timestamp=${timestamp}&url=${url}`,
      "utf-8",
    )
    .digest("hex");

  return NextResponse.json({
    appid: LARK_APP_ID,
    signature: sign,
    noncestr: nonce,
    timestamp: timestamp,
  });
}

export const GET = handle;
