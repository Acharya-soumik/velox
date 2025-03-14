import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ResumeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect("/sign-in");
  }

  return (
    <main className="flex min-h-screen flex-col">
      {children}
    </main>
  );
} 