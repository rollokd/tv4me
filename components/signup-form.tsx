"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { authClient } from "@/lib/auth-client"; //import the auth client
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
    const name = (e.currentTarget.elements[1] as HTMLInputElement).value;
    const password = (e.currentTarget.elements[2] as HTMLInputElement).value;
    const confirmPassword = (e.currentTarget.elements[3] as HTMLInputElement)
      .value;
    if (!email || !password || !confirmPassword || !name) {
      alert("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      await authClient.signUp.email(
        {
          email, // user email address
          password, // user password -> min 8 characters by default
          name, // user display name
          callbackURL: "/trending", // a url to redirect to after the user verifies their email (optional)
        },
        {
          onRequest: () => {
            //show loading\
            setLoading(true);
          },
          onSuccess: () => {
            //redirect to the dashboard or sign in page
            router.push("/trending");
          },
          onError: (ctx) => {
            // display the error message
            toast(ctx.error.message);
          },
        }
      );
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign Up for an account</CardTitle>
          <CardDescription>
            Enter your email below to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitHandler}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="name" placeholder="John Doe" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input id="password" type="password" required />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                </div>
                <Input id="confirm-password" type="password" required />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  className="w-full"
                  variant={loading ? "outline" : "default"}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Sign Up"}
                </Button>
                {/* <Button variant="outline" className="w-full">
                  Login with Google
                </Button> */}
              </div>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
