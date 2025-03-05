"use client";
import React from "react";
import { Button } from "./ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const SignOutButton = (props: React.ComponentProps<"button">) => {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/"); // redirect to login page
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
