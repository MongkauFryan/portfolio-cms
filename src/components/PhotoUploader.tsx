"use client";

import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "../lib/supabase/client";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";

interface PhotoUploaderProps {
  currentUrl: string;
  onUploadSuccess: (url: string) => void;
}

export default function PhotoUploader({
  currentUrl,
  onUploadSuccess,
}: PhotoUploaderProps) {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `pas-photo-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("portfolio-assets")
        .getPublicUrl(filePath);

      onUploadSuccess(data.publicUrl);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Gagal mengunggah foto."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-900">
        {currentUrl ? (
          <Image alt="Pas Photo Preview" className="object-cover" fill sizes="56px" src={currentUrl} />
        ) : (
          <span className="text-[10px] text-slate-500">Pas Photo</span>
        )}
      </div>

      <div className="flex-1 space-y-1">
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-emerald-400 transition hover:bg-slate-700">
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin"/>
          ) : (
            <Upload className="h-3.5 w-3.5"/>
          )}
          <span>{uploading ? "Mengunggah..." : "Unggah Pas Photo"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {currentUrl && !uploading && (
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <CheckCircle2 className="h-3 w-3 text-emerald-400"/>
            Foto siap dirender ke PDF CV
          </p>
        )}
        {errorMsg && <p className="text-[11px] text-red-400">{errorMsg}</p>}
      </div>
    </div>
  );
}