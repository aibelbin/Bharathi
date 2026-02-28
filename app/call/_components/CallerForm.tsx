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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0d1f0d] via-[#1a2e1a] to-[#0d1f0d] px-4">
      {/* Background animated orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#2d6a4f]/10 blur-3xl"
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#40916c]/8 blur-3xl"
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
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#2d6a4f]/30 to-[#40916c]/30 blur-xl" />

        <div className="relative rounded-3xl bg-gradient-to-b from-[#1a2e1a]/95 to-[#0d1f0d]/95 border border-[#2d6a4f]/20 backdrop-blur-xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <motion.div
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#40916c] to-[#2d6a4f] shadow-lg shadow-[#2d6a4f]/40 mb-5"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(45, 106, 79, 0.3)",
                  "0 0 35px rgba(45, 106, 79, 0.5)",
                  "0 0 20px rgba(45, 106, 79, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Phone className="h-8 w-8 text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome
            </h1>
            <p className="mt-2 text-sm text-white/50 text-center leading-relaxed">
              Enter your details to connect with our AI agent
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div className="space-y-2">
              <label
                htmlFor="caller-name"
                className="block text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  id="caller-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full rounded-xl bg-white/5 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 transition-all focus:outline-none focus:ring-2 focus:ring-[#40916c]/50 focus:border-[#40916c]/50 hover:border-white/20"
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
                className="block text-xs font-medium text-white/60 uppercase tracking-wider"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                <input
                  id="caller-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl bg-white/5 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/25 transition-all focus:outline-none focus:ring-2 focus:ring-[#40916c]/50 focus:border-[#40916c]/50 hover:border-white/20"
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
                  className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3"
                >
                  <p className="text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full rounded-xl bg-gradient-to-r from-[#2d6a4f] to-[#40916c] py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2d6a4f]/30 transition-all hover:shadow-xl hover:shadow-[#2d6a4f]/40 disabled:opacity-60 disabled:cursor-not-allowed"
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
          <p className="mt-6 text-center text-[11px] text-white/25 leading-relaxed">
            Your information is securely stored and used only for this call session.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
