"use client";

import { Loading } from "../components/home";
import { useAccessStore } from "../store";
import { Suspense, useEffect } from "react";
import { getClientConfig } from "../config/client";
import { useLarkAuthorize } from "./hooks";

function LarkAuth() {
  const { code } = useLarkAuthorize(
    ["contact:user.base:readonly"],
    "authorizing",
  );

  useEffect(() => {
    console.log("[Config] got config from build time", getClientConfig());
    useAccessStore.getState().fetch();
  }, [code]);

  return (
    <>
      <Loading />
    </>
  );
}

export default function Auth() {
  return (
    <Suspense fallback={<Loading />}>
      <LarkAuth />
    </Suspense>
  );
}
