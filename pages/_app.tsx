import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { ThemeProvider } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { ShellIPC } from "wss-js";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.monitorId || !router.query.widgetName) {
      return;
    }
    ShellIPC.connect("ws://localhost:8080").then((r) => {
      if (r) {
        console.log("Connected to Shell IPC");
        ShellIPC.getInstance().send("handshake", {
          client: "web",
          version: "1.0.0",
          monitorId: parseInt(router.query.monitorId as string, 10),
          widgetName: router.query.widgetName || "",
        });
      } else {
        console.error("Failed to connect to Shell IPC");
      }
    });
  }, [router.query]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
