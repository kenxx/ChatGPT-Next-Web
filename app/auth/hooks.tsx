import { redirect, useSearchParams } from "next/navigation";
import { useAccessStore } from "../store";
import { useCallback, useEffect, useMemo } from "react";

export function useLarkAuthorize(
  scope?: string | string[],
  state?: string,
  autoRedirect = true,
) {
  const accessStore = useAccessStore();
  const searchParams = useSearchParams();
  const url = useMemo(() => {
    const searchParam = new URLSearchParams();
    if (scope)
      searchParam.append(
        "scope",
        Array.isArray(scope) ? scope.join(" ") : scope,
      );
    if (state) searchParam.append("state", state);
    return "/api/lark/auth?" + searchParam.toString();
  }, [scope, state]);

  const code = searchParams.get("code");
  const authorized = accessStore.isAuthorized();

  const updateCode = useCallback(() => {
    accessStore.update((access) => {
      access.accessCode = code || "";
    });
  }, [code, accessStore]);

  useEffect(() => {
    if (code) {
      console.log("go home");
      updateCode();
      if (autoRedirect) {
        redirect("/");
      }
    } else if (!authorized) {
      console.log("go url", url.toString());
      if (autoRedirect) {
        redirect(url.toString());
      }
    }
  }, [code, authorized, url, autoRedirect, updateCode]);

  return { url, authorized: code ? true : authorized, code };
}
