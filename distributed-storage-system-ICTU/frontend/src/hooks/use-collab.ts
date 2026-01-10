import { useEffect, useState } from "react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export const useCollab = (documentId: string) => {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);

  useEffect(() => {
    const wsProvider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws/collab",
      documentId,
      doc
    );

    setProvider(wsProvider);

    return () => {
      wsProvider.disconnect();
      doc.destroy();
    };
  }, [documentId, doc]);

  return { doc, provider };
};