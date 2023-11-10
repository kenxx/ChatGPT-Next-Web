const larkAppID = process.env.NEXT_PUBLIC_LARK_APP_ID;
const larkCallbackURL = process.env.NEXT_PUBLIC_LARK_CALLBACK_URL;

export function useLarkAuthorize(scope?: string | string[], state?: string) {
  const url = new URL("https://open.feishu.cn/open-apis/authen/v1/authorize");
  url.searchParams.append("app_id", larkAppID || "");
  url.searchParams.append("redirect_uri", larkCallbackURL || "");
  if (scope)
    url.searchParams.append(
      "scope",
      Array.isArray(scope) ? scope.join(" ") : scope,
    );
  if (state) url.searchParams.append("state", state);

  console.log("test", larkAppID, larkCallbackURL);

  return url;
}
