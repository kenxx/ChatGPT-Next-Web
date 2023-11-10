import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { larkAppID, postJSSDKTicketGet } from "./api";

async function handle(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  const timestamp = +new Date();
  const nonce = randomBytes(12).toString("base64");
  const ticket = await postJSSDKTicketGet();

  const sign = createHash("sha1")
    .update(
      `jsapi_ticket=${ticket.ticket}&noncestr=${nonce}&timestamp=${timestamp}&url=${url}`,
      "utf-8",
    )
    .digest("hex");

  return NextResponse.json({
    appid: larkAppID,
    signature: sign,
    noncestr: nonce,
    timestamp: timestamp,
  });
}

export const GET = handle;
