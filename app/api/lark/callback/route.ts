import { NextRequest, NextResponse } from "next/server";
import { redis } from "../redis";

async function handle(request: NextRequest) {
  const res = await redis.get("test");

  return NextResponse.json(
    { res },
    {
      headers: {},
    },
  );
}

export const GET = handle;
