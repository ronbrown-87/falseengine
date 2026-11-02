import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { withTimeout } from "@/lib/async";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let result: Awaited<ReturnType<typeof supabase.auth.getUser>>;
    try {
      result = await withTimeout(supabase.auth.getUser(), 15_000, "Authentication check");
    } catch (error) {
      console.error("Admin route authentication check could not complete", error);
      throw redirect({ to: "/auth" });
    }
    if (result.error) {
      console.warn("Admin route authentication check failed", result.error.message);
      throw redirect({ to: "/auth" });
    }
    if (!result.data.user) throw redirect({ to: "/auth" });
    return { user: result.data.user };
  },
  component: () => <Outlet />,
});
