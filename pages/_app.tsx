import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { ThemeProvider } from "@/components/theme-provider";
import { useEffect } from "react";
import { ShellIPC } from "wss-js";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    ShellIPC.connect("ws://localhost:8080").then((r) => {
      if (r) {
        console.log("Connected to Shell IPC");
      } else {
        console.error("Failed to connect to Shell IPC");
      }
    });
  }, []);

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
