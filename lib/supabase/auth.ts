import { createSupabaseServerClient } from "./server";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "faculty" | "admin" | "reviewer";
  initials: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", authData.user.id)
    .single();

  if (!profile) return null;
  return {
    id: profile.id,
    name: profile.name,
    email: authData.user.email || "",
    role: profile.role,
    initials: getInitials(profile.name),
  };
}