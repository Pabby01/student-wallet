import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

// Decide where to send the user after auth: onboarding or home.
export const Route = createFileRoute("/_authenticated/")({
  component: Gateway,
});

function Gateway() {
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", user.id)
        .maybeSingle();
      navigate({ to: data?.onboarded ? "/home" : "/onboarding", replace: true });
    })();
  }, [user, navigate]);
  return (
    <div className="grid min-h-screen place-items-center">
      <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
    </div>
  );
}
