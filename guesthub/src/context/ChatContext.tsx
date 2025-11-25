import React, { useCallback, useState } from "react";

type BotSegment =
  | string
  | { type: "link"; to: string; text: string }
  | { type: "image"; src: string; alt?: string };

type BotContent = BotSegment[];

export interface Message {
  _id: string;
  conversationId: string;
  senderType: "user" | "bot" | "admin";
  text: string | BotContent;
  createdAt: string;
}

interface ChatContextType {
  conversationId: string | null;
  history: Message[];
  setConversationState: (id: string, initialHistory: Message[]) => void;
  clearChatHistory: () => void;
  addMessage: (message: Message) => void;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<Message[]>([]);

  const setConversationState = useCallback(
    (id: string, initialHistory: Message[]) => {
      setConversationId(id);
      setHistory(initialHistory);
    },
    []
  );

  const clearChatHistory = useCallback(() => {
    setConversationId(null);
    setHistory([]);
  }, []);

  React.useEffect(() => {
    const handleLogout = () => {
      clearChatHistory();
    };

    window.addEventListener("user:logout-success", handleLogout as EventListener);

    return () => {
      window.removeEventListener(
        "user:logout-success",
        handleLogout as EventListener
      );
    };
  }, [clearChatHistory]);

  const addMessage = useCallback((message: Message) => {
    setHistory((prev) => {
      // Prevent duplicates when the same socket message fires multiple times
      if (prev.some((m) => m._id === message._id)) return prev;
      return [...prev, message];
    });
  }, []);

  const value: ChatContextType = {
    conversationId,
    history,
    setConversationState,
    clearChatHistory,
    addMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within a ChatProvider");
  return ctx;
};
