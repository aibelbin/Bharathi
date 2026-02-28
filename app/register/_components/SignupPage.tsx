"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Loader2, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        name: companyName,
        email,
        password,
        phone,
      });

      if (signUpError) {
        setError(signUpError.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/context");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-50 via-white to-slate-100 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-orange-200/30 blur-[120px] animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-200/20 blur-[140px] animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-orange-200/40 to-amber-200/40 blur-xl" />

        <Card className="relative border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/50">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">Create an account</CardTitle>
            <CardDescription className="text-slate-500">
              Enter your details below to get started
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-700 font-medium">Company Name</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-700 font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full mt-7 bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="text-orange-600 font-medium hover:text-orange-700 underline-offset-4 hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
