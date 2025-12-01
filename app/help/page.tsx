import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
} from "@/components/ui";
import {
  HelpCircle,
  Book,
  MessageCircle,
  Video,
  FileText,
  ExternalLink,
  Search,
  Mail,
} from "lucide-react";

/**
 * Help Resources
 */
const helpResources = [
  {
    id: "1",
    title: "Getting Started Guide",
    description: "Learn the basics of using NotionApp",
    icon: Book,
    href: "#",
  },
  {
    id: "2",
    title: "Video Tutorials",
    description: "Watch step-by-step video guides",
    icon: Video,
    href: "#",
  },
  {
    id: "3",
    title: "Documentation",
    description: "Detailed documentation and API reference",
    icon: FileText,
    href: "#",
  },
  {
    id: "4",
    title: "Community Forum",
    description: "Connect with other users",
    icon: MessageCircle,
    href: "#",
  },
];

/**
 * FAQ Items
 */
const faqItems = [
  {
    question: "How do I create a new note?",
    answer:
      "Click the 'Add New' button on the Notes page, or use the keyboard shortcut Ctrl+N (Cmd+N on Mac).",
  },
  {
    question: "Can I collaborate with my team?",
    answer:
      "Yes! You can invite team members from the Team page and share notes and projects with them.",
  },
  {
    question: "How do I organize my notes with tags?",
    answer:
      "When creating or editing a note, you can add tags by typing in the tag input field and pressing Enter.",
  },
  {
    question: "Is my data backed up?",
    answer:
      "Yes, your data is automatically saved and stored locally. You can also export your notes at any time.",
  },
  {
    question: "How do I change the app theme?",
    answer:
      "Click the theme toggle button in the header to switch between light and dark modes.",
  },
];

/**
 * Help Page
 */
export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions and learn how to get the most out
            of NotionApp.
          </p>
          <div className="relative mt-6 max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Help Resources */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {helpResources.map((resource) => {
            const Icon = resource.icon;
            return (
              <Card
                key={resource.id}
                className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4 flex items-center gap-2">
                    {resource.title}
                    <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <h3 className="font-medium mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
            <CardDescription>
              Our support team is here to assist you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="outline">
              <MessageCircle className="mr-2 h-4 w-4" />
              Live Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
