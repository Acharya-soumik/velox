import Hero from "@/components/hero";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-medium text-2xl mb-4">Welcome to Velox</h2>
          <p className="text-muted-foreground mb-8">
            Your all-in-one platform for DSA practice, resume building, and interview preparation.
            Get started by exploring our features or creating your first resume.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/resume/new">
                Create Resume
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
