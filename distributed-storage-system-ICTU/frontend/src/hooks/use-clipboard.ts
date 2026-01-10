import { useState } from "react";

export const useClipboard = (timeout = 2000) => {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) return;

    await navigator.clipboard.writeText(text);
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, timeout);
  };

  return { copy, hasCopied };
};