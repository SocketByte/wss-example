import { useApplications } from "@/wss-react/useApplications";
import { useEffect, useRef, useState } from "react";
import { useAutoClickRegion } from "@/wss-react/useAutoClickRegion";
import { motion } from "motion/react";
import { AnimatePresence } from "framer-motion";
import { useMousePosition } from "@/wss-react/useMousePosition";
import { useMonitor } from "@/wss-react/useMonitor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const loadImageFromBase64 = (base64: string) => {
  return `data:image/png;base64,${base64}`;
};

export default function AppLauncher() {
  const { applications } = useApplications();
  const ref = useRef<HTMLDivElement>(null);
  useAutoClickRegion(ref);

  const { mouseX, mouseY } = useMousePosition();
  const monitorInfo = useMonitor();

  const [showLauncher, setShowLauncher] = useState(false);
  const [isHoveringOver, setIsHoveringOver] = useState(false);

  const [visibleApps, setVisibleApps] = useState(applications);

  useEffect(() => {
    if (!monitorInfo) {
      return;
    }
    const minHeight = monitorInfo.height * 0.98;
    if (mouseY > minHeight && mouseX > 960 && mouseX < 1630) {
      setShowLauncher(true);
    } else if (mouseY < minHeight && !isHoveringOver) {
      setShowLauncher(false);
    }
  }, [mouseY, monitorInfo]);

  return (
    <div className="w-full flex flex-row justify-center items-center mt-4">
      <AnimatePresence>
        {showLauncher && (
          <motion.div
            id="app-launcher"
            ref={ref}
            onMouseLeave={() => setIsHoveringOver(false)}
            onMouseEnter={() => setIsHoveringOver(true)}
            className="p-2 bg-background/60 rounded-t-4xl w-1/4 h-full"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
          >
            <h1 className="text-lg p-4">Search for apps...</h1>
            {applications.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 px-2 mt-4 overflow-y-scroll h-[calc(100vh-170px)]">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-row items-center py-2 px-3 gap-4 rounded-4xl hover:bg-background cursor-pointer "
                    //onClick={() => app.launch()}
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
                  </div>
                ))}
              </div>
            ) : (
              <p>No applications available.</p>
            )}
            <div className="w-full px-4 mt-4">
              <Input
                type="text"
                placeholder="Search applications..."
                autoFocus
                className="h-[50px] text-white dark:text-foreground dark:bg-background/60 dark:border-neutral-800 border-0 rounded-lg"
                onChange={(e) => {
                  const searchTerm = e.target.value.toLowerCase();
                  const filteredApps = applications.filter((app) =>
                    app.name.toLowerCase().includes(searchTerm),
                  );
                  setVisibleApps(filteredApps);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
