"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, Loader2 } from "lucide-react";
import { trpc } from "@/trpc/client";

interface CallerFormProps {
  companyId: string;
  onRegistered: (userId: string) => void;
}

export function CallerForm({ companyId, onRegistered }: CallerFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const registerMutation = trpc.caller.registerCaller.useMutation({
    onSuccess: (data) => {
      onRegistered(data.userId);
    },
    onError: (err) => {
      setError(err.message || "Something went wrong. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name");
      return;
    }
    if (!trimmedPhone) {
      setError("Please enter your phone number");
      return;
    }
    if (!/^[\d\s\-+()]{7,15}$/.test(trimmedPhone)) {
      setError("Please enter a valid phone number");
      return;
    }

    registerMutation.mutate({
      name: trimmedName,
      phone: trimmedPhone,
      companyId,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      {/* Background animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-amber-200/20 blur-3xl"
          animate={{
            x: [0, -30, 25, 0],
            y: [0, 20, -35, 0],
            scale: [1, 0.9, 1.15, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Glow effect behind card */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-200/40 to-amber-200/40 blur-xl" />

        <div className="relative rounded-3xl bg-white/95 border border-slate-200/80 backdrop-blur-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 mb-5"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(249, 115, 22, 0.25)",
                  "0 0 35px rgba(249, 115, 22, 0.45)",
                  "0 0 20px rgba(249, 115, 22, 0.25)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Phone className="h-8 w-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome
            </h1>
            <p className="mt-2 text-sm text-slate-500 text-center leading-relaxed">
              Enter your details to connect with our AI agent
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div className="space-y-2">
              <label
                htmlFor="caller-name"
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="caller-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 hover:border-slate-300"
                  disabled={registerMutation.isPending}
                  autoComplete="name"
                  autoFocus
                />
              </div>
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <label
                htmlFor="caller-phone"
                className="block text-xs font-medium text-slate-500 uppercase tracking-wider"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="caller-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 py-3.5 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 hover:border-slate-300"
                  disabled={registerMutation.isPending}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -5, height: 0 }}
                  className="rounded-xl bg-red-50 border border-red-200 px-4 py-3"
                >
                  <p className="text-xs text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/35 disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={!registerMutation.isPending ? { scale: 1.01, y: -1 } : {}}
              whileTap={!registerMutation.isPending ? { scale: 0.99 } : {}}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                "Continue to Call"
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed">
            Your information is securely stored and used only for this call session.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
