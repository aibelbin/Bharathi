"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
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
      toast.success("Context saved successfully");
      // Always redirect to dashboard after saving context
      router.push("/dashboard");
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
      return <ImageIcon className="size-5 text-blue-500" />;
    }
    if (fileType === "application/pdf") {
      return <FileText className="size-5 text-red-500" />;
    }
    return <File className="size-5 text-slate-400" />;
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <Loader2 className="size-6 animate-spin text-orange-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-10 sm:px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="absolute h-80 w-80 rounded-full bg-orange-200/30 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute h-96 w-96 rounded-full bg-amber-200/20 blur-[140px] -translate-x-1/3 animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
      </div>
      <div className="mx-auto max-w-2xl space-y-8 relative z-10">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Company Context
          </h1>
          <p className="mt-1 text-slate-500">
            Set up your company profile so the AI knows how to represent you.
          </p>
        </div>

        {/* Analyze Website */}
        <Card className="border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <Globe className="size-4 text-orange-500" />
              Analyze Website
            </CardTitle>
            <CardDescription className="text-slate-500">
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
                className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !url.trim()}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-md shadow-orange-500/20"
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
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-dashed border-orange-300 bg-orange-50 p-3 text-sm text-slate-600">
                <Loader2 className="size-3.5 animate-spin text-orange-500" />
                Scanning website and extracting company information…
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card className="border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-lg shadow-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <PenLine className="size-4 text-orange-500" />
                  Company Details
                </CardTitle>
                <CardDescription className="text-slate-500">
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
                  className="border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
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
              <Label htmlFor="name" className="text-slate-700 font-semibold">Company Name</Label>
              {hasContext && !showForm ? (
                <p className="text-sm font-medium text-slate-800">
                  {existingContext.companyName}
                </p>
              ) : (
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
              {hasContext && !showForm ? (
                <p className="whitespace-pre-line text-sm text-slate-600">
                  {existingContext.description}
                </p>
              ) : (
                <Textarea
                  id="description"
                  placeholder="What does your company do?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                />
              )}
            </div>

            {/* File Upload */}
            {showForm && (
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold">
                  Content File <span className="text-slate-400 font-normal">(optional)</span>
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
                        ? "border-orange-400 bg-orange-50"
                        : "border-slate-200 bg-slate-50/50 hover:border-orange-300 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "flex size-12 items-center justify-center rounded-full transition-colors",
                      isDragging ? "bg-orange-100" : "bg-slate-100"
                    )}>
                      <Upload className={cn(
                        "size-5 transition-colors",
                        isDragging ? "text-orange-500" : "text-slate-400"
                      )} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">
                        {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
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
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      className="size-8 text-slate-400 hover:text-red-500 hover:bg-red-50"
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
                <Label className="text-slate-700 font-semibold">Content File</Label>
                <a
                  href={existingContext.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 hover:underline"
                >
                  <FileText className="size-4" />
                  View uploaded file
                </a>
              </div>
            )}

            {/* Deliverable */}
            <div className="space-y-3">
              <Label className="text-slate-700 font-semibold">Deliverable</Label>

              {hasContext && !showForm ? (
                <div className="flex items-center gap-3">
                  {existingContext.isDeliverable ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="size-3" />
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 border border-slate-200">
                      <XCircle className="size-3" />
                      No
                    </span>
                  )}
                  {existingContext.isDeliverable &&
                    existingContext.deliveryPhone && (
                      <span className="flex items-center gap-1.5 text-sm text-slate-500">
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
                          ? "border-orange-400 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
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
                          ? "border-orange-400 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      <XCircle className="size-4" />
                      No
                    </button>
                  </div>

                  {deliverable && (
                    <div className="space-y-2">
                      <Label htmlFor="deliveryPhone" className="text-slate-700 font-semibold">
                        Delivery Phone Number
                      </Label>
                      <Input
                        id="deliveryPhone"
                        type="tel"
                        placeholder="+91 00000 00000"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus-visible:ring-orange-500/30 focus-visible:border-orange-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            {showForm && (
              <div className="flex gap-3 border-t border-slate-200 pt-6">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim() || !description.trim()}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-md shadow-orange-500/20"
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
                    className="border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}

            {/* Delete */}
            {hasContext && !showForm && (
              <div className="border-t border-slate-200 pt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate()}
                  disabled={isDeleting}
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
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
