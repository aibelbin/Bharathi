"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Globe,
  Sparkles,
  Save,
  Trash2,
  PenLine,
  Phone,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ContextPage() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deliverable, setDeliverable] = useState(false);
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);

  const utils = trpc.useUtils();

  const { data: existingContext, isLoading: contextLoading } =
    trpc.context.getContext.useQuery();

  useEffect(() => {
    if (existingContext) {
      setName(existingContext.companyName);
      setDescription(existingContext.description);
      setDeliverable(existingContext.isDeliveriable ?? false);
      setDeliveryPhone(existingContext.deliveryPhone ?? "");
      setHasLocalData(false);
    }
  }, [existingContext]);

  const analyzeMutation = trpc.context.analyze.useMutation({
    onSuccess: (data) => {
      setName(data.name);
      setDescription(data.description);
      setHasLocalData(true);
      setIsEditing(true);
      toast.success("Website analyzed! Review and save.");
    },
    onError: (error) => {
      toast.error(error.message || "Analysis failed");
    },
  });

  const saveMutation = trpc.context.saveContext.useMutation({
    onSuccess: () => {
      utils.context.getContext.invalidate();
      setIsEditing(false);
      setHasLocalData(false);
      toast.success("Context saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save context");
    },
  });

  const deleteMutation = trpc.context.deleteContext.useMutation({
    onSuccess: () => {
      utils.context.getContext.invalidate();
      setName("");
      setDescription("");
      setDeliverable(false);
      setDeliveryPhone("");
      setIsEditing(false);
      setHasLocalData(false);
      toast.success("Context deleted");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete context");
    },
  });

  const handleAnalyze = () => {
    if (!url.trim()) return;
    analyzeMutation.mutate({ url });
  };

  const handleSave = () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    if (deliverable && !deliveryPhone.trim()) {
      toast.error(
        "Delivery phone number is required when deliverable is enabled"
      );
      return;
    }
    saveMutation.mutate({
      name,
      description,
      deliverable,
      deliveryPhone: deliverable ? deliveryPhone : undefined,
    });
  };

  const isAnalyzing = analyzeMutation.isPending;
  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const hasContext = !!existingContext;
  const showForm = isEditing || !hasContext || hasLocalData;

  if (contextLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute h-80 w-80 rounded-full bg-primary/8 blur-[120px] animate-pulse" style={{animationDuration: '6s'}} />
        <div className="absolute h-96 w-96 rounded-full bg-accent/6 blur-[140px] -translate-x-1/3 animate-pulse" style={{animationDuration: '8s', animationDelay: '1s'}} />
      </div>
      <div className="mx-auto max-w-2xl space-y-8 relative z-10">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Company Context
          </h1>
          <p className="mt-1 text-muted-foreground">
            Set up your company profile so the AI knows how to represent you.
          </p>
        </div>

        {/* Analyze Website */}
        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg shadow-black/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Globe className="size-4 text-primary" />
              Analyze Website
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Paste your website URL to auto-fill company details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="https://yourcompany.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                disabled={isAnalyzing}
                className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="bg-primary hover:bg-primary/90 text-foreground transition-all duration-300"
              >
                {isAnalyzing ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 size-4" />
                )}
                {isAnalyzing ? "Analyzing…" : "Analyze"}
              </Button>
            </div>

            {isAnalyzing && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-primary" />
                Scanning website and extracting company information…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-lg shadow-black/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-foreground">
                  <PenLine className="size-4 text-primary" />
                  Company Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {hasContext && !showForm
                    ? "Your current company context."
                    : "Fill in your company information."}
                </CardDescription>
              </div>
              {hasContext && !showForm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="border-border hover:bg-secondary/50 text-foreground transition-colors"
                >
                  <PenLine className="mr-1.5 size-3.5" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-semibold">Company Name</Label>
              {hasContext && !showForm ? (
                <p className="text-sm font-medium text-foreground">
                  {existingContext.companyName}
                </p>
              ) : (
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50"
                />
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-foreground font-semibold">Description</Label>
              {hasContext && !showForm ? (
                <p className="whitespace-pre-line text-sm text-muted-foreground">
                  {existingContext.description}
                </p>
              ) : (
                <Textarea
                  id="description"
                  placeholder="What does your company do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50"
                />
              )}
            </div>

            {/* Deliverable */}
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Deliverable</Label>

              {hasContext && !showForm ? (
                <div className="flex items-center gap-3">
                  {existingContext.isDeliveriable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-300 border border-green-500/30">
                      <CheckCircle2 className="size-3" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground border border-border">
                      <XCircle className="size-3" />
                      No
                    </span>
                  )}
                  {existingContext.isDeliveriable &&
                    existingContext.deliveryPhone && (
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Phone className="size-3.5" />
                        {existingContext.deliveryPhone}
                      </span>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliverable(true)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                        deliverable
                          ? "border-primary bg-primary text-foreground shadow-lg shadow-primary/30"
                          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <CheckCircle2 className="size-4" />
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeliverable(false);
                        setDeliveryPhone("");
                      }}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-300",
                        !deliverable
                          ? "border-primary bg-primary text-foreground shadow-lg shadow-primary/30"
                          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <XCircle className="size-4" />
                      No
                    </button>
                  </div>

                  {deliverable && (
                    <div className="space-y-2">
                      <Label htmlFor="deliveryPhone" className="text-foreground font-semibold">
                        Delivery Phone Number
                      </Label>
                      <Input
                        id="deliveryPhone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {showForm && (
              <div className="flex gap-3 border-t border-border pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim() || !description.trim()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-foreground transition-all duration-300"
                >
                  {isSaving ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 size-4" />
                  )}
                  {isSaving ? "Saving…" : "Save Context"}
                </Button>
                {isEditing && hasContext && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (existingContext) {
                        setName(existingContext.companyName);
                        setDescription(existingContext.description);
                        setDeliverable(existingContext.isDeliveriable ?? false);
                        setDeliveryPhone(
                          existingContext.deliveryPhone ?? ""
                        );
                      }
                      setIsEditing(false);
                      setHasLocalData(false);
                    }}
                    className="border-border hover:bg-secondary/50 text-foreground transition-colors"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}

            {/* Delete */}
            {hasContext && !showForm && (
              <div className="border-t border-border pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={isDeleting}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/20 transition-colors"
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 size-4" />
                  )}
                  Delete Context
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
