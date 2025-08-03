import { useEffect, useState } from "react";
import { ShellIPC } from "wss-js";

export interface Notification {
  id: number;
  appName: string;
  appIcon: string;
  summary: string;
  body: string;
  actions: Record<string, string>;
  hints: Record<string, any>;
  expireTimeout: number;
}

export interface NotificationRawActions {
  id: number;
  appName: string;
  appIcon: string;
  summary: string;
  body: string;
  actions: string[];
  hints: Record<string, any>;
  expireTimeout: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const ipc = ShellIPC.getInstance();

    const handleNotification = (notification: NotificationRawActions) => {
      setNotifications((prev) => [
        ...prev,
        {
          ...notification,
          // actions are in format: ["default", "Open", "mail-mark-read", "Mark as read"]
          // convert to { default: "Open", "mail-mark-read": "Mark as read" }
          actions: notification.actions.reduce(
            (acc: Record<string, string>, action: string, index: number) => {
              if (index % 2 === 0) {
                // even index is the action name
                acc[action] = notification.actions[index + 1] || "";
              }
              return acc;
            },
            {},
          ),
        },
      ]);
    };

    const handleNotificationClosed = ({
      id,
    }: {
      id: number;
      reason: number;
    }) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    ipc.listen("notifd-notification", handleNotification);
    ipc.listen("notifd-notification-closed", handleNotificationClosed);

    return () => {
      ipc.unlisten("notifd-notification", handleNotification);
      ipc.unlisten("notifd-notification-closed", handleNotificationClosed);
    };
  }, []);

  const dismissNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    ShellIPC.getInstance().send("notifd-notification-dismiss", {
      id,
      reason: 2,
    });
  };

  const invokeNotificationAction = (id: number, action: string) => {
    ShellIPC.getInstance().send("notifd-notification-action", {
      id,
      action,
    });
  };

  return {
    notifications,
    dismissNotification,
    invokeNotificationAction,
  };
};
