import React, { useEffect, useRef } from "react";
import { ShellIPC } from "wss-js";

export const useAutoClickRegion = (
  ref: React.RefObject<HTMLDivElement | null>,
) => {
  const lastElement = useRef<HTMLDivElement | null>(null);
  const lastRect = useRef<DOMRect | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const mutationObserver = useRef<MutationObserver | null>(null);
  const intervalId = useRef<number | null>(null);

  const rectsAreEqual = (r1: DOMRect, r2: DOMRect) =>
    r1.x === r2.x &&
    r1.y === r2.y &&
    r1.width === r2.width &&
    r1.height === r2.height;

  useEffect(() => {
    const sendClickRegion = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();

      if (lastRect.current && rectsAreEqual(rect, lastRect.current)) {
        // No change, skip sending
        return;
      }

      lastRect.current = rect;

      ShellIPC.getInstance().send("window-update-click-region", {
        name: element.id,
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      });
    };

    const cleanup = () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
        resizeObserver.current = null;
      }
      if (mutationObserver.current) {
        mutationObserver.current.disconnect();
        mutationObserver.current = null;
      }
      if (intervalId.current !== null) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
      lastRect.current = null;
    };

    const checkElement = () => {
      const element = ref.current;

      if (element !== lastElement.current) {
        cleanup();
        lastElement.current = element;

        if (element) {
          if (!element.id) {
            console.error("Element for auto click region does not have an ID!");
            return;
          }

          sendClickRegion(element);

          resizeObserver.current = new ResizeObserver(() =>
            sendClickRegion(element),
          );
          resizeObserver.current.observe(element);

          mutationObserver.current = new MutationObserver(() => {
            const style = window.getComputedStyle(element);
            if (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            ) {
              sendClickRegion(element);
            }
          });
          mutationObserver.current.observe(element, {
            attributes: true,
            attributeFilter: ["style"],
          });

          intervalId.current = window.setInterval(() => {
            const style = window.getComputedStyle(element);
            if (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              style.opacity !== "0"
            ) {
              sendClickRegion(element);
            }
          }, 300);
        }
      } else if (lastElement.current) {
        // Element is same, maybe still check visibility and update if changed
        const style = window.getComputedStyle(lastElement.current);
        if (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          style.opacity !== "0"
        ) {
          sendClickRegion(lastElement.current);
        }
      }
    };

    const pollId = window.setInterval(checkElement, 300);

    return () => {
      window.clearInterval(pollId);
      cleanup();
    };
  }, [ref]);
};
