import { getR2UploadUrl } from "@/lib/r2.functions";
import { Loader2, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";

interface R2MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}

export function R2MultiImageUpload({ value, onChange, max = 4 }: R2MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    const batch = Array.from(files).slice(0, remaining);

    if (batch.length === 0) return;

    try {
      setUploading(true);

      const uploaded = await Promise.all(
        batch.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`;
          const res = await getR2UploadUrl({ data: { fileName, contentType: file.type } });

          const uploadRes = await fetch(res.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });

          if (!uploadRes.ok) throw new Error(`Upload failed (${uploadRes.status})`);
          return res.publicUrl;
        }),
      );

      onChange([...value, ...uploaded]);
    } catch (err: unknown) {
      console.error("R2 upload error:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const canAddMore = value.length < max;

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        disabled={!canAddMore}
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div
              key={i}
              className="group relative h-14 w-14 shrink-0 overflow-hidden rounded border border-[var(--brand-hairline)]"
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[var(--brand-hairline)] text-muted-foreground transition-colors hover:border-foreground/50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-foreground" />
              <span className="text-sm">Uploading {uploading && value.length < max ? "…" : ""}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <UploadCloud className="h-6 w-6" />
              <span className="text-sm font-medium text-foreground">
                Upload images ({value.length}/{max})
              </span>
              <span className="text-xs">PNG, JPG, WebP &middot; Select multiple</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Maximum of {max} images reached.</p>
      )}
    </div>
  );
}
