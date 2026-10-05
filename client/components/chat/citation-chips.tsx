"use client";

import { ExternalLink, FileText } from "lucide-react";

import type { Citation, Repository } from "@/lib/api";

export function citationHref(repo: Repository, citation: Citation) {
  const line =
    citation.startLine != null
      ? `#L${citation.startLine}${
          citation.endLine && citation.endLine !== citation.startLine
            ? `-L${citation.endLine}`
            : ""
        }`
      : "";
  return `https://github.com/${repo.fullName}/blob/${repo.defaultBranch}/${citation.filePath}${line}`;
}

export function CitationChips({
  repo,
  citations,
}: {
  repo: Repository;
  citations: Citation[];
}) {
  if (!citations.length) return null;

  return (
    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
      {citations.map((citation, index) => {
        const href = repo.fullName ? citationHref(repo, citation) : null;
        const lineInfo =
          citation.startLine != null
            ? citation.endLine && citation.endLine !== citation.startLine
              ? `Lines ${citation.startLine}–${citation.endLine}`
              : `Line ${citation.startLine}`
            : null;

        const Card = (
          <div
            className="flex items-start gap-3 rounded-lg border border-transparent bg-card/60 px-3 py-2 text-sm"
            role="group"
          >
            <div className="mt-0.5 text-muted-foreground">
              <FileText className="size-5 opacity-80" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate font-medium">{citation.filePath}</div>
                {lineInfo && <div className="text-xs text-muted-foreground">{lineInfo}</div>}
              </div>
              <div className="mt-1 text-xs text-muted-foreground truncate">
                {repo.fullName ? `${repo.fullName}` : ""}
              </div>
            </div>
            {href && (
              <a href={href} target="_blank" rel="noreferrer" className="ml-2 opacity-80">
                <ExternalLink className="size-4" />
              </a>
            )}
          </div>
        );

        return (
          <div key={`${citation.filePath}-${index}`} className="w-full">
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" className="block">
                {Card}
              </a>
            ) : (
              Card
            )}
          </div>
        );
      })}
    </div>
  );
}
