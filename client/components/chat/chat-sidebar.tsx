"use client";

import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";
import { Plus, RotateCcw } from "lucide-react";

import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useChatSessions,
  useCreateChatSession,
} from "@/hooks/use-chat";
import { useStartIndexing } from "@/hooks/use-repos";
import type { Repository, ChatSession } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatSidebar({
  repo,
  sessionId,
  onSelectSession,
}: {
  repo: Repository;
  sessionId: string | null;
  onSelectSession: (id: string) => void;
}) {
  const ready = repo.indexStatus === "READY";
  const sessionsQuery = useChatSessions(repo.id, ready);
  const createSession = useCreateChatSession(repo.id);
  const reindex = useStartIndexing();

  return (
    <aside className="flex w-full flex-col border-b md:w-72 md:border-r md:border-b-0">
      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <p className="truncate text-sm font-medium">{repo.fullName}</p>
          <div className="flex flex-wrap items-center gap-2">
            <IndexStatusBadge status={repo.indexStatus} />
            {repo.isPrivate && (
              <span className="text-xs text-muted-foreground">Private</span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={!ready || createSession.isPending}
            onClick={() =>
              createSession.mutate("New chat", {
                onSuccess: (session) => onSelectSession(session.id),
              })
            }
          >
            <Plus data-icon="inline-start" />
            New chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={reindex.isPending || repo.indexStatus === "INDEXING"}
            onClick={() => reindex.mutate(repo.id)}
            aria-label="Re-index repository"
          >
            <RotateCcw />
          </Button>
        </div>
      </div>

      <Separator />

      <div className="px-4 py-2 text-xs font-medium text-muted-foreground">
        Sessions
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-3 px-2 pb-4">
          {!ready && (
            <p className="px-2 text-xs text-muted-foreground">
              Sessions unlock after indexing completes.
            </p>
          )}

          {sessionsQuery.isLoading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}

          {sessionsQuery.data && sessionsQuery.data.length > 0 && (
            (() => {
              // group sessions by date bucket
              const groups: Record<string, ChatSession[]> = {};
              sessionsQuery.data.forEach((s) => {
                const d = new Date(s.createdAt);
                let key = "";
                if (isToday(d)) key = "Today";
                else if (isYesterday(d)) key = "Yesterday";
                else key = format(d, "MMM d, yyyy");
                if (!groups[key]) groups[key] = [];
                groups[key].push(s);
              });

              return Object.keys(groups).map((key) => (
                <div key={key} className="px-1">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold text-muted-foreground">
                      {key}
                    </div>
                    <div className="h-px flex-1 ml-3 bg-muted/20" />
                  </div>

                  <div className="space-y-1">
                    {groups[key].map((session) => (
                      <button
                        key={session.id}
                        type="button"
                        onClick={() => onSelectSession(session.id)}
                        className={cn(
                          "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted/60",
                          sessionId === session.id && "bg-muted/80"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium">
                            {session.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(session.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className={cn("w-2 h-2 rounded-full mr-1", sessionId === session.id ? "bg-pink-500" : "bg-transparent border border-muted/40")} />
                      </button>
                    ))}
                  </div>
                </div>
              ));
            })()
          )}

          {ready && sessionsQuery.isSuccess && sessionsQuery.data.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">
              No chats yet. Start one to begin.
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
