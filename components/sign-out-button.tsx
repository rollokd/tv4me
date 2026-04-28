"use client";
import React from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignOutButton = (props: React.ComponentProps<typeof Button>) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace("/");
        },
      },
    });
  };
  return (
    <Button onClick={handleSignOut} {...props}>
      Sign Out
    </Button>
  );
};

export default SignOutButton;
