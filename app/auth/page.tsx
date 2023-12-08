"use client";

import { Loading } from "../components/home";
import { useAccessStore } from "../store";
import { useEffect } from "react";
import { getClientConfig } from "../config/client";
import { useLarkAuthorize } from "./hooks";

export default function Auth() {
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
