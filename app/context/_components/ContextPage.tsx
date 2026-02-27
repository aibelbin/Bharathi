"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Sparkles, CheckCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export default function ContextPage() {
  const [url, setUrl] = useState("");
  const [completed, setCompleted] = useState(false);

  const analyzeMutation = trpc.context.analyze.useMutation({
    onSuccess: () => {
      setCompleted(true);
      toast.success("Analyze completed");
    },
    onError: (error:any) => {
      toast.error(error.message || "Analyze failed");
    },
  });

  const analyzeWebsite = () => {
    if (!url) return;
    setCompleted(false);
    analyzeMutation.mutate({ url });
  };

  const isAnalyzing = analyzeMutation.isPending;

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-green-950/80 to-black flex items-center justify-center p-6">
      
      <div className="w-full max-w-xl space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Globe className="text-green-400" />
            Website Analyzer
          </h1>

          <p className="text-gray-400">
            Enter a website URL and analyze with AI
          </p>
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAnalyzing}
            className="bg-black/60 border-green-500/30 text-white"
          />

          <Button
            onClick={analyzeWebsite}
            disabled={!url || isAnalyzing}
            className="bg-green-600 hover:bg-green-500 text-white"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {completed && (
          <div className="flex items-center justify-center gap-2 text-green-400 text-lg">
            <CheckCircle />
            Analyze Completed
          </div>
        )}

      </div>

    </div>
  );
}