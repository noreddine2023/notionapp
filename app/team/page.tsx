import { DashboardLayout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui";
import { Users, Mail, UserPlus, MoreVertical } from "lucide-react";

/**
 * Team Members Data (Mock)
 */
const teamMembers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    avatar: null,
    initials: "JD",
    status: "online",
    projects: 5,
    notes: 28,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    avatar: null,
    initials: "JS",
    status: "online",
    projects: 3,
    notes: 15,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Editor",
    avatar: null,
    initials: "MJ",
    status: "away",
    projects: 4,
    notes: 22,
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "Viewer",
    avatar: null,
    initials: "SW",
    status: "offline",
    projects: 2,
    notes: 8,
  },
  {
    id: "5",
    name: "Alex Chen",
    email: "alex@example.com",
    role: "Editor",
    avatar: null,
    initials: "AC",
    status: "online",
    projects: 6,
    notes: 34,
  },
  {
    id: "6",
    name: "Emily Brown",
    email: "emily@example.com",
    role: "Viewer",
    avatar: null,
    initials: "EB",
    status: "offline",
    projects: 1,
    notes: 5,
  },
];

/**
 * Get role badge variant
 */
function getRoleVariant(role: string): "default" | "secondary" | "outline" {
  switch (role.toLowerCase()) {
    case "admin":
      return "default";
    case "editor":
      return "secondary";
    default:
      return "outline";
  }
}

/**
 * Get status color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    default:
      return "bg-gray-400";
  }
}

/**
 * Team Page
 */
export default function TeamPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Team</h1>
            <p className="text-muted-foreground">
              Manage your team members and their permissions.
            </p>
          </div>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>

        {/* Team Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">Active collaborators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online Now</CardTitle>
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.filter((m) => m.status === "online").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
              <CardDescription className="text-2xl">📝</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {teamMembers.reduce((acc, m) => acc + m.notes, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Created by team</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <Card
              key={member.id}
              className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(
                          member.status
                        )}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-base">{member.name}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getRoleVariant(member.role)}>{member.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium text-foreground">{member.projects}</span>{" "}
                    projects
                  </div>
                  <div>
                    <span className="font-medium text-foreground">{member.notes}</span>{" "}
                    notes
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
