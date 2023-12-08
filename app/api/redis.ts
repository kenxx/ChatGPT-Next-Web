import { Redis } from "ioredis";

const { REDIS_URL = "" } = process.env;
const redis = new Redis(REDIS_URL);

export function getRedis() {
  return redis;
}

export async function cacheAround<T>(
  key: string,
  around: () => Promise<T>,
  expire?: number | string,
): Promise<T> {
  const redis = getRedis();
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const caching = await around();
  if (typeof expire === "string") {
    if (expire.startsWith("@")) {
      expire = caching[expire.substring(1) as keyof typeof caching] as string;
    }
    expire = Number(expire);
  }
  await redis.set(
    key,
    JSON.stringify(caching),
    "EX",
    expire ? expire - 10 : -1,
  );
  return caching;
}
