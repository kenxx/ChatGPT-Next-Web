import { cacheAround } from "./redis";
import { TenantAccessToken } from "./types";
import { checkAPIError } from "./utils";

const {
  NEXT_PUBLIC_LARK_APP_ID: larkAppID = "",
  NEXT_PUBLIC_LARK_CALLBACK_URL: larkCallbackURL = "",
  LARK_APP_SECRET = "",
} = process.env;

export { larkAppID };

async function tenantAccessTokenHeader() {
  const token = await postAuthV3TenantAccessTokenInternal();
  return {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: `Bearer ${token.tenant_access_token}`,
  };
}

export function getAuthenV1AuthorizeURL(
  scope?: string | string[],
  state?: string,
): URL {
  const url = new URL("https://open.feishu.cn/open-apis/authen/v1/authorize");
  url.searchParams.append("app_id", larkAppID || "");
  url.searchParams.append("redirect_uri", larkCallbackURL);
  if (scope)
    url.searchParams.append(
      "scope",
      Array.isArray(scope) ? scope.join(" ") : scope,
    );
  if (state) url.searchParams.append("state", state);
  return url;
}

export async function postAuthV3TenantAccessTokenInternal(): Promise<TenantAccessToken> {
  return await cacheAround(
    `tenant_access_token:${larkAppID}`,
    async (): Promise<TenantAccessToken> => {
      const res = await fetch(
        "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app_id: larkAppID,
            app_secret: LARK_APP_SECRET,
          }),
        },
      );

      return await res
        .json()
        .then(checkAPIError)
        .then((r) => ({
          tenant_access_token: r.tenant_access_token,
          expire: r.expire,
        }));
    },
    "@expire",
  );
}

export async function postJSSDKTicketGet(): Promise<{
  expire_in: number;
  ticket: string;
}> {
  const headers = await tenantAccessTokenHeader();
  const res = await fetch("https://open.feishu.cn/open-apis/jssdk/ticket/get", {
    method: "POST",
    headers,
  });

  return await res
    .json()
    .then(checkAPIError)
    .then((r) => r.data);
}

export async function postAuthenV1OIDCAccessToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
}> {
  const headers = await tenantAccessTokenHeader();
  const res = await fetch(
    "https://open.feishu.cn/open-apis/authen/v1/oidc/access_token",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
      }),
    },
  );

  return res
    .json()
    .then(checkAPIError)
    .then((r) => r.data);
}

export async function postAuthenV1OIDCRefreshAccessToken(
  refreshToken: string,
): Promise<{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  refresh_expires_in: number;
  scope: string;
}> {
  const headers = await tenantAccessTokenHeader();
  const res = await fetch(
    "https://open.feishu.cn/open-apis/authen/v1/oidc/refresh_access_token",
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    },
  );

  return res
    .json()
    .then(checkAPIError)
    .then((r) => r.data);
}

export async function getAuthenV1UserInfo(userAccessToken: string): Promise<{
  name: string;
  en_name: string;
  avatar_url: string;
  avatar_thumb: string;
  avatar_middle: string;
  avatar_big: string;
  open_id: string;
  union_id: string;
  email: string;
  enterprise_email: string;
  user_id: string;
  mobile: string;
  tenant_key: string;
  employee_no: string;
}> {
  const res = await fetch(
    "https://open.feishu.cn/open-apis/authen/v1/user_info",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userAccessToken}`,
      },
    },
  );

  return res
    .json()
    .then(checkAPIError)
    .then((r) => r.data);
}
