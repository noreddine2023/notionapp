"use client";

import * as React from "react";
import { FileText, Download, ExternalLink } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  ScrollArea,
  Badge,
} from "@/components/ui";
import { cn } from "@/lib/utils";

interface PaperViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: {
    id: string;
    title: string;
    authors: string[];
    abstract: string;
    date: string;
    tags: string[];
    citations: number;
    url?: string;
  } | null;
}

/**
 * Research Paper Viewer Dialog Component
 *
 * A dialog for viewing research paper details and PDF content.
 * For a production app, this would integrate with a proper PDF viewer library.
 */
export function PaperViewerDialog({
  open,
  onOpenChange,
  paper,
}: PaperViewerDialogProps) {
  const [viewMode, setViewMode] = React.useState<"details" | "pdf">("details");

  if (!paper) return null;

  // In a real implementation, this would be the actual PDF URL
  const pdfUrl = paper.url || "#";
  const hasPdf = !!paper.url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950 shrink-0">
                <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <DialogTitle className="truncate">{paper.title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {hasPdf && (
                <div className="flex gap-1 mr-2">
                  <Button
                    variant={viewMode === "details" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("details")}
                  >
                    Details
                  </Button>
                  <Button
                    variant={viewMode === "pdf" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("pdf")}
                  >
                    PDF
                  </Button>
                </div>
              )}
              {hasPdf && (
                <Button variant="outline" size="sm" asChild>
                  <a href={pdfUrl} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" asChild>
                <a
                  href={`https://scholar.google.com/scholar?q=${encodeURIComponent(
                    paper.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Scholar
                </a>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {viewMode === "details" ? (
            <ScrollArea className="h-full px-6 py-4">
              <div className="space-y-6 max-w-4xl">
                {/* Authors */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    AUTHORS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.authors.map((author, index) => (
                      <span
                        key={index}
                        className="text-sm text-foreground"
                      >
                        {author}
                        {index < paper.authors.length - 1 && ","}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Publication Info */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    PUBLICATION INFO
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span>Published: {paper.date}</span>
                    <span>•</span>
                    <span>Citations: {paper.citations.toLocaleString()}</span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    TAGS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {paper.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Abstract */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    ABSTRACT
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {paper.abstract}
                  </p>
                </div>

                {/* Notes Section */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    YOUR NOTES
                  </h3>
                  <div className="border rounded-lg p-4 min-h-[200px]">
                    <p className="text-sm text-muted-foreground italic">
                      Add your notes and annotations here...
                    </p>
                  </div>
                </div>

                {/* Key Findings (Placeholder) */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    KEY FINDINGS
                  </h3>
                  <div className="space-y-2">
                    <div className="border-l-2 border-primary pl-4 py-2">
                      <p className="text-sm">
                        This section would contain extracted key findings and
                        highlights from the paper.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/20">
              {hasPdf ? (
                <div className="w-full h-full">
                  {/* PDF Viewer Placeholder */}
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <FileText className="h-16 w-16 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-lg font-medium mb-2">
                        PDF Viewer
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
                        In a production environment, this would display the PDF
                        using a library like react-pdf or PDF.js
                      </p>
                      <Button asChild>
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open PDF in New Tab
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-muted-foreground">
                    No PDF available for this paper
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
