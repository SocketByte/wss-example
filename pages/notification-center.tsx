import { useAutoClickRegion } from "@/wss-react/useAutoClickRegion";
import { useRef } from "react";
import { useNotifications } from "@/wss-react/useNotifications";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function NotificationCenter() {
  const ref = useRef<HTMLDivElement | null>(null);
  useAutoClickRegion(ref);

  const { notifications, dismissNotification, invokeNotificationAction } =
    useNotifications();

  return (
    <div
      className="fixed top-0 left-0 right-0 flex flex-col items-end space-y-1 pointer-events-none"
      id="notification-center-box"
      ref={ref}
    >
      <AnimatePresence initial={false}>
        {notifications.slice(-3).map((notification) => (
          <motion.div
            layout
            key={notification.id}
            className="pointer-events-auto flex items-center gap-4 w-full max-w-sm p-4 dark:bg-background/60 border dark:border-neutral-800 rounded-4xl shadow-lg"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
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
                {notification.summary.length > 20
                  ? `${notification.summary.slice(0, 20)}...`
                  : notification.summary}
              </h4>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                {notification.body.length > 60
                  ? `${notification.body.slice(0, 60)}...`
                  : notification.body}
              </p>
              <div className="mt-2 flex gap-2">
                {Object.entries(notification.actions).map(
                  ([actionName, actionValue]) => (
                    <Button
                      key={actionName}
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        invokeNotificationAction(notification.id, actionName)
                      }
                    >
                      {actionValue}
                    </Button>
                  ),
                )}
              </div>
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
