import React, { useEffect, useRef } from "react";
import { Bluetooth, Code, Sun, Wifi } from "lucide-react";
import { Geist } from "next/font/google";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { useAutoClickRegion } from "@/wss-react/useAutoClickRegion";
import { Clock } from "@/components/bar/clock";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoClickRegion(ref); 
 
  return (
    <div
      className={`${geistSans.className} font-sans w-full h-[50px] px-4 absolute top-0 left-0 right-0 bg-background/20 
      text-white dark:text-foreground dark:bg-background/60 dark:border-neutral-800 dark:border-b flex items-center justify-between font-medium text-sm z-10`}
    >
      <div className="flex flex-row gap-3 items-center">
        <Code className="w-5 h-5" />
        <p className="text-base">web-shell-system - index.tsx</p>
      </div>

      <div className="flex gap-4 items-center">
        <HoverCard openDelay={0} closeDelay={100}>
          <HoverCardTrigger className="h-full">
            <Button
              variant="outline"
              className="text-white  bg-white/10 border-0 hover:bg-white/20 hover:text-white"
            >
              Trigger
            </Button> 
          </HoverCardTrigger>
          <HoverCardContent
            id="hover-popup-example"
            ref={ref}
            className="w-[400px] h-[400px] shadow-none p-4 text-white dark:text-foreground bg-background/20 dark:bg-background/60 dark:border-neutral-800 border-0 dark:border rounded-4xl mt-2"
          >
            <div className="flex flex-col gap-2 select-none">
              <h3 className="text-lg font-semibold">Hover Card Example</h3>
              <p className="text-sm">
                This is an example of a hover card that can be used to display
                additional information or actions related to the trigger.
              </p>
              <Button
                variant="outline"
                className="mt-2 text-white bg-white/10 border-0 hover:bg-white/20 hover:text-white"
              >
                Action Button
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
        <Sun className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <Wifi className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <Bluetooth className="w-5 h-5 dark:text-muted-foreground hover:dark:text-white transition" />
        <Clock />
      </div>
    </div>
  );
}
