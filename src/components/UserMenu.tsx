"use client";

import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="hidden md:flex items-center gap-2">
      <ThemeToggle />
      <Button
        size="sm"
        className="bg-hustle text-white font-black"
        onClick={async () => {
          await signOut();
          router.push("/login");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
