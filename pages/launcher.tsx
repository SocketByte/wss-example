import { Application, useApplications } from "@/wss-react/useApplications";
import { useEffect, useRef, useState } from "react";
import { useAutoClickRegion } from "@/wss-react/useAutoClickRegion";
import { motion } from "motion/react";
import { AnimatePresence } from "framer-motion";
import { useMousePosition } from "@/wss-react/useMousePosition";
import { useMonitor } from "@/wss-react/useMonitor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ShellIPC } from "wss-js";
import { cn } from "@/lib/utils";
import { stagger } from "motion";
import { ScrollArea } from "@/components/ui/scroll-area";

const loadImageFromBase64 = (base64: string) => {
  return `data:image/png;base64,${base64}`;
};

export default function AppLauncher() {
  const { applications } = useApplications();
  const ref = useRef<HTMLDivElement>(null);
  useAutoClickRegion(ref);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  useAutoClickRegion(buttonRef);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const { mouseX, mouseY } = useMousePosition();
  const monitorInfo = useMonitor();

  const [showLauncher, setShowLauncher] = useState(false);
  const [isHoveringOver, setIsHoveringOver] = useState(false);

  const [visibleApps, setVisibleApps] = useState<Application[]>([]);
  const [focusedAppId, setFocusedAppId] = useState<string>("");

  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!monitorInfo) {
      return;
    }
    const minHeight = monitorInfo.height * 0.98;
    if (mouseY > minHeight && mouseX > 960 && mouseX < 1630) {
      if (!showLauncher) {
        ShellIPC.getInstance().send("widget-set-keyboard-interactivity", {
          interactive: true,
        });
      }
      setShowLauncher(true);
    } else if (mouseY < minHeight && !isHoveringOver) {
      if (showLauncher) {
        ShellIPC.getInstance().send("widget-set-keyboard-interactivity", {
          interactive: false,
        });
        setVisibleApps(applications || []);
        setFocusedAppId("");
        setSearchTerm("");
        setIsSearching(false);
      }
      setShowLauncher(false);
    }
  }, [mouseY, monitorInfo]);

  const [clickedKey, setClickedKey] = useState<string | null>(null);
  useEffect(() => {
    // handle keybinds
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setClickedKey(event.key);
        setShowLauncher(false);
        setFocusedAppId("");
        setSearchTerm("");
        setIsSearching(false);
        ShellIPC.getInstance().send("widget-set-keyboard-interactivity", {
          interactive: false,
        });
      } else if (event.key === "Enter") {
        setClickedKey(event.key);
        ShellIPC.getInstance().send("appd-application-run", {
          appId: focusedAppId,
          prefix: "app2unit -- ",
        });
        setShowLauncher(false);
        ShellIPC.getInstance().send("widget-set-keyboard-interactivity", {
          interactive: false,
        });
      }

      // arrows to navigate apps
      if (event.key === "ArrowDown") {
        setClickedKey(event.key);
        const currentIndex = visibleApps.findIndex(
          (app) => app.id === focusedAppId,
        );
        if (currentIndex < visibleApps.length - 1) {
          const nextApp = visibleApps[currentIndex + 1];
          setFocusedAppId(nextApp.id);
        }
      } else if (event.key === "ArrowUp") {
        setClickedKey(event.key);
        const currentIndex = visibleApps.findIndex(
          (app) => app.id === focusedAppId,
        );
        if (currentIndex > 0) {
          const prevApp = visibleApps[currentIndex - 1];
          setFocusedAppId(prevApp.id);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visibleApps, focusedAppId, showLauncher]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setIsSearching(false);
      setVisibleApps(applications); // Optional: reset list when search is cleared
      setFocusedAppId(applications[0]?.id ?? "");
    }
  }, [searchTerm, applications]);

  useEffect(() => {
    // scroll down to the focused app when it changes
    if (scrollRef.current && focusedAppId) {
      const focusedAppElement = scrollRef.current.querySelector(
        `[data-app-id="${focusedAppId}"]`,
      );
      if (focusedAppElement) {
        focusedAppElement.scrollIntoView({
          behavior: "instant",
          block: "nearest",
        });
      }
    }
  }, [focusedAppId]);

  if (!applications) {
    return (
      <div className="w-full flex flex-row justify-center items-center mt-4"></div>
    );
  }

  return (
    <div
      className="w-full flex flex-row justify-center items-end mt-4"
      autoFocus
    >
      <p>
        {mouseX} {mouseY} {showLauncher ? "true" : "false"} {monitorInfo?.width}{" "}
        {monitorInfo?.height}{" "}
        {clickedKey ? `Clicked: ${clickedKey}` : "Not clicked"}
      </p>
      <AnimatePresence>
        {showLauncher && (
          <motion.div
            className="w-1/4 h-full relative"
            onMouseLeave={() => setIsHoveringOver(false)}
            onMouseEnter={() => setIsHoveringOver(true)}
          >
            <motion.div
              id="app-launcher"
              ref={ref}
              layout
              className="p-2 bg-background rounded-t-4xl w-full absolute bottom-20 overflow-hidden"
              initial={{ y: 1500, opacity: 1 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.15,
                  ease: [0.4, 0, 0.2, 1], // easeInOut cubic-bezier
                },
              }}
              exit={{
                height: 0,
                y: 1500,
                opacity: 1,
                transition: { duration: 0.1, ease: "easeInOut" },
              }}
            >
              {visibleApps.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-1 gap-3 px-2 mt-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-500 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-700 dark:scrollbar-track-gray-800"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: {
                      transition: {
                        delayChildren: stagger(0.05, { from: "last" }),
                      },
                    },
                    hidden: {
                      transition: {
                        delayChildren: stagger(0.02, { from: "last" }),
                      },
                    },
                  }}
                >
                  <ScrollArea
                    className="w-full h-full max-h-[80vh] pr-6"
                    ref={scrollRef}
                  >
                    <AnimatePresence>
                      {visibleApps
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .sort((a, b) => {
                          if (isSearching) {
                            const aStartsWith = a.name
                              .toLowerCase()
                              .startsWith(searchTerm.toLowerCase());
                            const bStartsWith = b.name
                              .toLowerCase()
                              .startsWith(searchTerm.toLowerCase());
                            return aStartsWith === bStartsWith
                              ? 0
                              : aStartsWith
                                ? -1
                                : 1;
                          }
                          return 0;
                        })
                        .map((app) => {
                          const matchesSearch = app.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase());
                          return matchesSearch ? (
                            <motion.div
                              layout
                              initial={{ opacity: 0, y: 15, scale: 0.95 }}
                              animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                transition: { duration: 0.1, ease: "easeOut" },
                              }}
                              exit={{
                                opacity: 0,
                                y: 15,
                                scale: 0.95,
                                transition: { duration: 0.1, ease: "easeIn" },
                              }}
                              data-app-id={app.id}
                              key={app.id}
                              className={cn(
                                "flex flex-row items-start py-3 px-4 gap-4 rounded-4xl cursor-pointer select-none",
                                {
                                  "bg-secondary shadow-lg":
                                    focusedAppId === app.id,
                                },
                              )}
                              onClick={() => {
                                ShellIPC.getInstance().send(
                                  "appd-application-run",
                                  {
                                    appId: focusedAppId,
                                    prefix: "app2unit -- ",
                                  },
                                );
                                setShowLauncher(false);
                                ShellIPC.getInstance().send(
                                  "widget-set-keyboard-interactivity",
                                  {
                                    interactive: false,
                                  },
                                );
                              }}
                              onMouseEnter={() => setFocusedAppId(app.id)}
                            >
                              <Avatar>
                                <AvatarImage
                                  src={loadImageFromBase64(app.iconBase64Large)}
                                  alt={app.name}
                                />
                                <AvatarFallback>
                                  {app.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col justify-center">
                                <span className="text-sm">{app.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {app.comment.length > 80
                                    ? `${app.comment.slice(0, 80)}...`
                                    : app.comment}
                                </span>
                              </div>
                            </motion.div>
                          ) : null;
                        })}
                    </AnimatePresence>
                  </ScrollArea>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="p-4 text-center text-muted-foreground"
                >
                  No applications available.
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className="w-full z-10 absolute bottom-0 p-4 bg-background"
              id="button-app-launcher"
              ref={buttonRef}
              initial={{ y: 500, opacity: 0 }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.15,
                  ease: [0.4, 0, 0.2, 1], // easeInOut cubic-bezier
                },
              }}
              exit={{
                height: 0,
                y: 500,
                opacity: 0,
                transition: { duration: 0.1, ease: "easeInOut" },
              }}
            >
              <Input
                type="text"
                placeholder="Search applications..."
                autoFocus
                className="h-[50px] text-white dark:text-foreground dark:border-neutral-800 border-0 rounded-lg"
                onChange={(e) => {
                  const term = e.target.value.toLowerCase();
                  setSearchTerm(term);

                  const isActive = term.trim().length > 0;
                  setIsSearching(isActive);

                  const filtered = applications.filter((app) =>
                    app.name.toLowerCase().includes(term),
                  );
                  setVisibleApps(filtered);

                  // focus on the app that exactly matches the beginning of the search term
                  const exactMatch = filtered.find((app) =>
                    app.name.toLowerCase().startsWith(term),
                  );
                  if (exactMatch) {
                    setFocusedAppId(exactMatch.id);
                  } else {
                    setFocusedAppId(filtered[0]?.id ?? "");
                  }
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
