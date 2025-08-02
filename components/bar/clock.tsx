import { useEffect, useState } from "react";

export const Clock = () => {
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

  if (!mounted) {
    return null; // Ensure that the component is only rendered after it's mounted on the client
  }

  return (
    <div className="flex flex-col items-end pl-4">
      <span className="text-base leading-tight">{time}</span>
      <span className="text-sm dark:text-muted-foreground leading-tight">
        {date}
      </span>
    </div>
  );
};
