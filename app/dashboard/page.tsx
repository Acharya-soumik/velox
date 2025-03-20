import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  PlusCircle,
  ListChecks,
  Settings,
  FileText,
  Timer,
} from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-8 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/problems/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Problem
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/resume/new">
              <FileText className="mr-2 h-4 w-4" />
              Create Resume
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Problems Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Problems
            </CardTitle>
            <CardDescription>
              Manage coding problems, patterns, and topics
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/problems">
                <ListChecks className="mr-2 h-4 w-4" />
                View All Problems
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/problems/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Problem
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Interview Practice Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Interview Practice
            </CardTitle>
            <CardDescription>
              Practice timed coding interviews with customizable settings
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/interview">
                <Timer className="mr-2 h-4 w-4" />
                Start Interview
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/interview/history">
                <ListChecks className="mr-2 h-4 w-4" />
                View History
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Resume Management Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Builder
            </CardTitle>
            <CardDescription>
              Create and manage your resumes and cover letters
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/resume">
                <ListChecks className="mr-2 h-4 w-4" />
                View All Resumes
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/resume/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Resume
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Configure patterns, topics, and other settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <div className="font-medium mb-1">Email</div>
                <div className="text-muted-foreground">{user.email}</div>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full justify-start"
              >
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Manage Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Problems</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
