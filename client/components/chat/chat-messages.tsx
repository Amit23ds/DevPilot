"use client";

import { Bot, UserRound } from "lucide-react";
import { useEffect, useRef } from "react";
import "./chat-messages.css";

import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { CitationChips } from "@/components/chat/citation-chips";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { ChatMessage, Repository } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatMessages({
  repo,
  messages,
  streamText,
  isLoading,
  streaming,
  onSendSuggestion,
}: {
  repo: Repository;
  messages: ChatMessage[];
  streamText?: string;
  isLoading?: boolean;
  streaming?: boolean;
  onSendSuggestion?: (q: string) => void | Promise<void>;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Auto-scroll only when user is near the bottom (don't yank when they scrolled up)
    const el = bottomRef.current;
    if (!el) return;
    // find scrollable viewport produced by ScrollArea
    let container: HTMLElement | null = viewportRef.current;
    if (!container) {
      let p = el.parentElement;
      while (p && !container) {
        if (p.getAttribute && p.getAttribute("data-slot") === "scroll-area-viewport") {
          container = p;
          break;
        }
        p = p.parentElement;
      }
      viewportRef.current = container;
    }

    if (!container) {
      el.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const threshold = 200; // px from bottom to consider "near bottom"
    const atBottom = container.scrollHeight - (container.scrollTop + container.clientHeight) <= threshold;
    if (atBottom) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamText]);

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-6">
        <Skeleton className="h-16 w-2/3 rounded-3xl" />
        <Skeleton className="ml-auto h-12 w-1/2 rounded-3xl" />
        <Skeleton className="h-24 w-3/4 rounded-3xl" />
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
        {messages.length === 0 && !streamText && (
          <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-8 text-center">
            <div className="mx-auto max-w-prose">
              <div className="mb-3 text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">DevPilot</div>
                    <div className="text-xs text-muted-foreground">Ask anything about this codebase</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  "What is the architecture of this repository?",
                  "Where is authentication handled?",
                  "Explain the main data flow.",
                  "Where is the database accessed?",
                ].map((s) => (
                  <button
                    key={s}
                    className="w-full rounded-md border border-transparent bg-card/60 px-3 py-2 text-sm text-left hover:bg-card/80"
                    onClick={() => onSendSuggestion?.(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <MessageGroup>
          {messages.map((message) => {
            const isUser = message.role === "USER";
            return (
              <Message key={message.id} align={isUser ? "end" : "start"}>
                <MessageAvatar>
                  <Avatar className="size-8">
                    <AvatarFallback
                      className={cn(
                        isUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {isUser ? (
                        <UserRound className="size-4" />
                      ) : (
                        <Bot className="size-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble
                    variant={isUser ? "default" : "muted"}
                    align={isUser ? "end" : "start"}
                    className={cn(!isUser && "max-w-full")}
                  >
                      <BubbleContent className={cn(!isUser && "w-full max-w-full px-4 py-3")}>
                        {!isUser && (
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-sm font-medium">DevPilot</span>
                          </div>
                        )}
                        {isUser ? (
                          <span className="whitespace-pre-wrap">
                            {message.content}
                          </span>
                        ) : (
                          <ChatMarkdown content={message.content} />
                        )}
                      </BubbleContent>
                  </Bubble>
                  {!isUser && message.citations?.length > 0 && (
                    <MessageFooter>
                      <CitationChips repo={repo} citations={message.citations} />
                    </MessageFooter>
                  )}
                </MessageContent>
              </Message>
            );
          })}

            {streaming && !streamText && (
              // Typing indicator (before first token arrives)
              <Message align="start" aria-live="polite">
                <MessageAvatar>
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-muted">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                </MessageAvatar>
                <MessageContent>
                  <Bubble variant="muted" align="start" className="max-w-full">
                    <BubbleContent className="w-full max-w-full px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">DevPilot</div>
                        <div className="typing-dots" aria-hidden>
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>
            )}

            {/* streaming rendered into draft assistant message in messages cache */}
        </MessageGroup>
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
