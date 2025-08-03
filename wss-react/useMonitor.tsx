import { useEffect, useState } from "react";
import { ShellIPC } from "wss-js";

export interface MonitorInfo {
  id: number;
  width: number;
  height: number;
}

export const useMonitor = () => {
  const [monitorInfo, setMonitorInfo] = useState<MonitorInfo | null>(null);

  useEffect(() => {
    if (!ShellIPC.getInstance().isReady()) {
      return;
    }
    const ipc = ShellIPC.getInstance();

    const handleMonitorInfo = (monitorInfo: MonitorInfo) => {
      setMonitorInfo(monitorInfo);
    };

    ipc.listen("monitor-info-response", handleMonitorInfo);
    ipc.send("monitor-info-request", {});

    return () => {
      ipc.unlisten("monitor-info-response", handleMonitorInfo);
    };
  }, [ShellIPC.getInstance().isReady()]);

  return monitorInfo;
};
