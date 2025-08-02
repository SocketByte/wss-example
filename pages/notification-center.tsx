import { useAutoClickRegion } from "@/wss-react/useAutoClickRegion";
import { useRef } from "react";
import { useNotifications } from "@/wss-react/useNotifications";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function NotificationCenter() {
  const ref = useRef<HTMLDivElement | null>(null);
  useAutoClickRegion(ref);

  const { notifications, dismissNotification } = useNotifications();

  return (
    <div
      className="fixed top-0 left-0 right-0 flex flex-col items-end p-4 space-y-2 pointer-events-none"
      id="notification-center-box"
      ref={ref}
    >
      <AnimatePresence initial={false}>
        {notifications.slice(0, 3).map((notification) => (
          <motion.div
            key={notification.id}
            className="pointer-events-auto flex items-center gap-4 w-full max-w-sm p-4  dark:bg-background/60 border dark:border-neutral-800 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Avatar>
              <AvatarImage
                src={notification.appIcon}
                alt={notification.appName}
              />
              <AvatarFallback>
                {notification.appName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="text-sm font-semibold dark:text-foreground">
                {notification.summary}
              </h4>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                {notification.body}
              </p>
            </div>
            <button
              onClick={() => dismissNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
