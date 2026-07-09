import { Button } from "@/components/ui/button";
import { getR2UploadUrl } from "@/lib/r2.functions";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface R2ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function R2ImageUpload({ value, onChange }: R2ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;

      const res = await getR2UploadUrl({ data: { fileName, contentType: file.type } });

      const uploadRes = await fetch(res.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status})`);
      }

      onChange(res.publicUrl);
    } catch (err: unknown) {
      console.error("R2 upload error:", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="group relative h-48 w-full overflow-hidden rounded-lg border border-[var(--brand-hairline)]">
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => onChange("")}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--brand-hairline)] text-muted-foreground transition-colors hover:border-foreground/50"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-foreground" />
              <span className="text-sm">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="mb-1 h-8 w-8" />
              <span className="text-sm font-medium text-foreground">Click to upload an image</span>
              <span className="text-xs">PNG, JPG, WebP</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
