import { useEffect, useRef, useState } from "react";
import { Bluetooth, Code, Moon, Sun, Wifi } from "lucide-react";
import { Geist, Geist_Mono } from "next/font/google";
import { AnimatePresence, motion } from "motion/react";

import { createPortal } from "react-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";
import { ShellIPC } from "wss-js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export function ModeToggle() {
  const { setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-white/10 border-0 hover:bg-white/20 hover:text-white"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background/20 dark:bg-background/60 mt-2 "
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Home() {
  const workspaces = [1, 2, 3, 4, 5];

  const formatCurrentDate = () => {
    const date = new Date();
    return date
      .toLocaleString("pl-PL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour12: false,
      })
      .replace(",", "");
  };

  const formatCurrentTime = () => {
    const date = new Date();
    return date
      .toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(":", ":");
  };

  // State to track if the component is mounted (for client-side rendering only)
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(formatCurrentTime());
  const [date, setDate] = useState(formatCurrentDate());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const interval = setInterval(() => {
        setTime(formatCurrentTime());
        setDate(formatCurrentDate());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  // Ensure that the component is only rendered after it's mounted on the client
  if (!mounted) {
    return null;
  }

  return (
    <div
      className={`${geistSans.className} font-sans w-full h-[50px] px-4 absolute top-0 left-0 right-0 bg-background/20 
      text-white dark:text-foreground dark:bg-background/60 dark:border-neutral-800 dark:border-b flex items-center justify-between font-medium text-sm z-10`}
    >
      <div className="flex gap-2 bg-background/10 dark:bg-neutral-800/40 py-3 px-4 rounded-full">
        {workspaces.map((ws, idx) => (
          <motion.div
            key={idx}
            className={`w-3 h-3 rounded-full flex items-center justify-center bg-background/30 dark:bg-neutral-700 ${idx === 0 ? "dark:bg-white bg-white" : ""}`}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{
              opacity: idx === 0 ? 1 : 0.6,
              scale: idx === 0 ? 1.2 : 1,
            }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: idx * 0.1,
            }}
          />
        ))}
      </div>

      <div className="flex flex-row gap-3 items-center">
        <Code className="w-5 h-5" />
        <p className="text-base">web-shell-system - index.tsx</p>
      </div>

      <div className="flex gap-4 items-center">
        <ModeToggle />
        <HoverCard openDelay={0} closeDelay={50}>
          <HoverCardTrigger className="h-full">
            <Button
              variant="outline"
              className="text-white  bg-white/10 border-0 hover:bg-white/20 hover:text-white"
            >
              Trigger
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80 h-[500px] shadow-none p-4 text-white dark:text-foreground bg-background/20 dark:bg-background/60 dark:border-neutral-800 border-0 dark:border rounded-lg mt-2">
            The React Framework – created and maintained by @vercel.
          </HoverCardContent>
        </HoverCard>
        <Sun className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <Wifi className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <Bluetooth className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <div className="flex flex-col items-end pl-4">
          <span className="text-base leading-tight">{time}</span>
          <span className="text-sm dark:text-muted-foreground leading-tight">
            {date}
          </span>
        </div>
      </div>
    </div>
  );
}
