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
import { FolderKanban, Plus, Calendar, Users, MoreVertical } from "lucide-react";

/**
 * Projects Data (Mock)
 */
const projects = [
  {
    id: "1",
    name: "AI Research Initiative",
    description: "Exploring machine learning applications for product improvement",
    status: "active",
    progress: 65,
    members: 5,
    dueDate: "2024-03-15",
    notesCount: 12,
  },
  {
    id: "2",
    name: "Mobile App Redesign",
    description: "Complete overhaul of the mobile experience",
    status: "active",
    progress: 40,
    members: 3,
    dueDate: "2024-02-28",
    notesCount: 8,
  },
  {
    id: "3",
    name: "API Documentation",
    description: "Comprehensive API documentation for developers",
    status: "completed",
    progress: 100,
    members: 2,
    dueDate: "2024-01-10",
    notesCount: 15,
  },
  {
    id: "4",
    name: "User Research Q1",
    description: "Quarterly user interviews and feedback analysis",
    status: "active",
    progress: 25,
    members: 4,
    dueDate: "2024-04-01",
    notesCount: 6,
  },
];

/**
 * Get status badge variant
 */
function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "completed":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Projects Page
 */
export default function ProjectsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Organize your work into projects and track progress.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950">
                    <FolderKanban className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant={getStatusVariant(project.status)} className="capitalize">
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{project.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {project.members} members
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {project.dueDate}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
