import { useEffect, useState } from "react";
import { ShellIPC } from "wss-js";

export const useMousePosition = () => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);

  useEffect(() => {
    const ipc = ShellIPC.getInstance();

    const handleMousePosition = (position: { x: number; y: number }) => {
      setMouseX(position.x);
      setMouseY(position.y);
    };

    ipc.listen("mouse-position-update", handleMousePosition);

    return () => {
      ipc.unlisten("mouse-position-update", handleMousePosition);
    };
  }, []);

  return { mouseX, mouseY };
};
