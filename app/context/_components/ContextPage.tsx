"use client";

import { useState, useEffect, useRef } from "react";
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
  Upload,
  File,
  X,
  FileText,
  Image as ImageIcon,
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
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getUploadUrl = trpc.upload.getUploadUrl.useMutation();

  const uploadFile = async () => {
    if (!file) return;

    const data = await getUploadUrl.mutateAsync({
      fileName: file.name,
      fileType: file.type,
    });

    await fetch(data.uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    setImageUrl(data.ObjectUrl);
    return data.ObjectUrl;
  };

  const utils = trpc.useUtils();

  const { data: existingContext, isLoading: contextLoading } =
    trpc.context.getContext.useQuery();

  useEffect(() => {
    if (existingContext) {
      setName(existingContext.companyName);
      setDescription(existingContext.description);
      setDeliverable(existingContext.isDeliverable ?? false);
      setDeliveryPhone(existingContext.deliveryPhone ?? "");
      setImageUrl(existingContext.content ?? null);
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
      setFile(null);
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
      setFile(null);
      setImageUrl(null);
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

  const handleSave = async () => {
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
    const res = await uploadFile();
    saveMutation.mutate({
      name,
      description,
      deliverable,
      deliveryPhone: deliverable ? deliveryPhone : undefined,
      content: res ?? imageUrl ?? undefined,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="size-5 text-blue-400" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="size-5 text-red-400" />;
    }
    return <File className="size-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isAnalyzing = analyzeMutation.isPending;
  const isSaving = saveMutation.isPending || getUploadUrl.isPending;
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
        <div className="absolute h-80 w-80 rounded-full bg-primary/8 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute h-96 w-96 rounded-full bg-accent/6 blur-[140px] -translate-x-1/3 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
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

            {/* File Upload */}
            {showForm && (
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">
                  Content File <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                
                {!file ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all duration-200",
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/50 hover:bg-secondary/50"
                    )}
                  >
                    <div className={cn(
                      "flex size-12 items-center justify-center rounded-full transition-colors",
                      isDragging ? "bg-primary/20" : "bg-secondary"
                    )}>
                      <Upload className={cn(
                        "size-5 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, Images up to 10MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf"
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Show existing content URL if available */}
            {hasContext && !showForm && existingContext?.content && (
              <div className="space-y-2">
                <Label className="text-foreground font-semibold">Content File</Label>
                <a
                  href={existingContext.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <FileText className="size-4" />
                  View uploaded file
                </a>
              </div>
            )}

            {/* Deliverable */}
            <div className="space-y-3">
              <Label className="text-foreground font-semibold">Deliverable</Label>

              {hasContext && !showForm ? (
                <div className="flex items-center gap-3">
                  {existingContext.isDeliverable ? (
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
                  {existingContext.isDeliverable &&
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
                        setDeliverable(existingContext.isDeliverable ?? false);
                        setDeliveryPhone(existingContext.deliveryPhone ?? "");
                      }
                      setIsEditing(false);
                      setHasLocalData(false);
                      setFile(null);
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
