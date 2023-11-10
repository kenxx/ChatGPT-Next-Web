import { NextRequest, NextResponse } from "next/server";
import { redis } from "../redis";
import { createDecipheriv, createHash } from "crypto";

const {
  LARK_EVENT_ENCRYPT_KEY: EventEncryptKey = "",
  LARK_EVENT_VERIFICATION_TOKEN: EventVerifyToken = "",
} = process.env;

interface Encrypted {
  encrypt: string;
}

enum EventType {
  UrlVerification = "url_verification",
}

interface EventBase {
  challenge?: string;
  token?: string;
  type?: string;
}

type Event<T> = EventBase & T;

const cipherKey = createHash("sha256").update(EventEncryptKey).digest();

function decrypt(cipher: string) {
  const encryptBuffer = Buffer.from(cipher, "base64");
  const decipher = createDecipheriv(
    "aes-256-cbc",
    cipherKey,
    encryptBuffer.subarray(0, 16),
  );
  let decrypted = decipher.update(
    encryptBuffer.subarray(16).toString("hex"),
    "hex",
    "utf8",
  );
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function handle(request: NextRequest) {
  const body = await request.json();
  let event: Event<{}> = body;
  if (EventEncryptKey) {
    event = JSON.parse(decrypt(body.encrypt));
  }

  if (
    event.type == EventType.UrlVerification &&
    event.token === EventVerifyToken
  ) {
    return NextResponse.json({
      challenge: event.challenge,
    });
  }
}

export const POST = handle;
