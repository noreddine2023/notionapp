"use client";

import * as React from "react";
import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/components/ui";
import { PaperViewerDialog } from "@/components/research";
import { Beaker, ExternalLink, BookOpen, Calendar, Users } from "lucide-react";

/**
 * Research Papers Data (Mock)
 */
const papers = [
  {
    id: "1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"],
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.",
    date: "2017-06-12",
    tags: ["Transformers", "NLP", "Deep Learning"],
    citations: 87000,
    url: "https://arxiv.org/pdf/1706.03762.pdf",
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"],
    abstract:
      "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.",
    date: "2018-10-11",
    tags: ["NLP", "Language Models", "Pre-training"],
    citations: 65000,
    url: "https://arxiv.org/pdf/1810.04805.pdf",
  },
  {
    id: "3",
    title: "GPT-3: Language Models are Few-Shot Learners",
    authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder"],
    abstract:
      "Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. By contrast, humans can generally perform a new language task from only a few examples or from simple instructions.",
    date: "2020-05-28",
    tags: ["GPT", "Language Models", "Few-Shot Learning"],
    citations: 12000,
    url: "https://arxiv.org/pdf/2005.14165.pdf",
  },
];

/**
 * Research Page (Client Component)
 * 
 * Architecture Decision: This page showcases saved research papers
 * in a Bento Box style grid layout with paper viewer functionality.
 */
export default function ResearchPage() {
  const [selectedPaper, setSelectedPaper] = React.useState<typeof papers[0] | null>(null);
  const [viewerOpen, setViewerOpen] = React.useState(false);

  const handleViewPaper = (paper: typeof papers[0]) => {
    setSelectedPaper(paper);
    setViewerOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Research</h1>
            <p className="text-muted-foreground">
              Your saved papers and research library.
            </p>
          </div>
          <Button>
            <Beaker className="mr-2 h-4 w-4" />
            Search Papers
          </Button>
        </div>

        {/* Papers Grid - Bento Box Layout */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {papers.map((paper) => (
            <Card
              key={paper.id}
              className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
              onClick={() => handleViewPaper(paper)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                    <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(paper.url, "_blank");
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="line-clamp-2 mt-2">{paper.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {paper.abstract}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mb-4">
                  {paper.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {paper.authors.length} authors
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {paper.date}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Paper Viewer Dialog */}
        <PaperViewerDialog
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          paper={selectedPaper}
        />
      </div>
    </DashboardLayout>
  );
}
