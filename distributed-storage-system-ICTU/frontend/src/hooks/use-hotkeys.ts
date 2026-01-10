import { useEffect } from "react";

type HotkeyHandler = (event: KeyboardEvent) => void;

export const useHotkeys = (keyCombo: string, handler: HotkeyHandler) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const keys = keyCombo.toLowerCase().split("+");
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      const match = keys.every(key => {
        if (key === "ctrl" || key === "cmd") return isCtrlOrCmd;
        if (key === "shift") return event.shiftKey;
        if (key === "alt") return event.altKey;
        return event.key.toLowerCase() === key;
      });

      if (match) {
        event.preventDefault();
        handler(event);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [keyCombo, handler]);
};