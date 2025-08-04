import { useEffect, useState } from "react";
import { ShellIPC } from "wss-js";

export class Application {
  // id: number;
  //   name: string;
  //   comment: string;
  //   exec: string;
  //   iconBase64Large: string;
  //   iconBase64Small: string;

  id: string;
  name: string;
  comment: string;
  exec: string;
  iconBase64Large: string;
  iconBase64Small: string;

  constructor(
    id: number,
    name: string,
    comment: string,
    exec: string,
    iconBase64Large: string,
    iconBase64Small: string,
  ) {
    this.id = id;
    this.name = name;
    this.comment = comment;
    this.exec = exec;
    this.iconBase64Large = iconBase64Large;
    this.iconBase64Small = iconBase64Small;
  }

  launch() {
    const ipc = ShellIPC.getInstance();
    ipc.send("appd-application-launch", { id: this.id });
  }
}

export const useApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    if (!ShellIPC.getInstance().isReady()) {
      return;
    }
    const ipc = ShellIPC.getInstance();

    const handleApplication = (application: Application) => {
      setApplications((prev) => [...prev, application]);
    };

    const handleApplicationList = (applicationList: Application[]) => {
      setApplications(applicationList);
    };

    ipc.listen("appd-application-list-response", handleApplicationList);
    ipc.listen("appd-application-added", handleApplication);
    ipc.send("appd-application-list-request", {});

    return () => {
      ipc.unlisten("appd-application-added", handleApplication);
      ipc.unlisten("appd-application-list-response", handleApplicationList);
    };
  }, [ShellIPC.getInstance().isReady()]);

  return { applications };
};
