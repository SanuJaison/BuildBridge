import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Paperclip, Trash2, UploadCloud } from "lucide-react";
import api, { assetUrl, getApiMessage } from "../../lib/api";
import { fileSize } from "../../lib/format";
import { Avatar } from "./Avatar";

export async function uploadFile(file, purpose = "portfolio") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("purpose", purpose);
  const { data } = await api.post("/uploads", formData);
  return data.upload;
}

function useUploader(purpose) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const openPicker = () => inputRef.current?.click();

  const pick = async (event, onUploaded) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setError("");
    setUploading(true);
    try {
      const uploads = [];
      for (const file of files) {
        uploads.push(await uploadFile(file, purpose));
      }
      await onUploaded(uploads);
    } catch (uploadError) {
      setError(getApiMessage(uploadError, "The file could not be uploaded"));
    } finally {
      setUploading(false);
    }
  };

  return { inputRef, uploading, error, openPicker, pick };
}

export function ImageUploader({ value, onChange, purpose = "portfolio", label = "Image", hint, shape = "wide" }) {
  const { inputRef, uploading, error, openPicker, pick } = useUploader(purpose);

  return (
    <div>
      {label ? <span className="label-base">{label}</span> : null}
      <div className="flex flex-wrap items-center gap-3">
        {shape === "avatar" ? (
          <Avatar src={value} name="Upload" size="xl" />
        ) : (
          <div className="relative h-24 w-40 overflow-hidden rounded-xl border border-white/10 bg-ink-800">
            {value ? (
              <img src={assetUrl(value)} alt="Upload preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-600">
                <ImagePlus size={18} />
                <span className="text-[10px]">No image yet</span>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="btn btn-secondary px-3 py-2 text-xs"
          >
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />}
            {uploading ? "Uploading…" : value ? "Replace" : "Upload"}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="btn btn-ghost px-3 py-2 text-xs text-slate-400"
            >
              <Trash2 size={13} />
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(event) =>
            pick(event, async (uploads) => {
              onChange(uploads[0]?.url || "");
            })
          }
        />
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-400">{error}</p> : null}
      {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function ImageGalleryUploader({ value = [], onChange, purpose = "portfolio", max = 6, label = "Images" }) {
  const { inputRef, uploading, error, openPicker, pick } = useUploader(purpose);
  const remaining = Math.max(0, max - value.length);

  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="label-base mb-0">{label}</span>
          <span className="text-[11px] text-slate-500">
            {value.length}/{max}
          </span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2.5">
        {value.map((url, index) => (
          <div key={`${url}-${index}`} className="group relative h-24 w-32 overflow-hidden rounded-xl border border-white/10">
            <img src={assetUrl(url)} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              className="absolute right-1.5 top-1.5 rounded-md bg-ink-950/80 p-1.5 text-slate-300 opacity-0 transition hover:text-rose-300 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {remaining > 0 ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className="flex h-24 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.02] text-slate-500 transition hover:border-brand-400/40 hover:text-brand-300"
          >
            {uploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            <span className="text-[10px]">{uploading ? "Uploading…" : "Add image"}</span>
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-400">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(event) =>
          pick(event, async (uploads) => {
            onChange([...value, ...uploads.map((upload) => upload.url)].slice(0, max));
          })
        }
      />
    </div>
  );
}

const DOCUMENT_ACCEPT =
  ".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip,text/plain";

export function AttachmentUploader({ value = [], onChange, max = 3 }) {
  const { inputRef, uploading, error, openPicker, pick } = useUploader("attachment");
  const remaining = Math.max(0, max - value.length);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-base mb-0">Attachments</span>
        <span className="text-[11px] text-slate-500">
          {value.length}/{max} · private
        </span>
      </div>
      {value.length ? (
        <ul className="mb-2.5 space-y-2">
          {value.map((file, index) => (
            <li
              key={`${file.uploadId}-${index}`}
              className="flex items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
            >
              <FileText size={15} className="shrink-0 text-brand-300" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs text-slate-200">{file.name}</p>
                <p className="text-[10px] text-slate-500">{file.size ? fileSize(file.size) : "Uploaded file"}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                className="rounded p-1 text-slate-500 transition hover:text-rose-300"
                aria-label={`Remove ${file.name}`}
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {remaining > 0 ? (
        <button
          type="button"
          onClick={openPicker}
          disabled={uploading}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-4 text-xs text-slate-500 transition hover:border-brand-400/40 hover:text-brand-300"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
          {uploading ? "Uploading securely…" : "Attach a brief, PDF, or reference sheet"}
        </button>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_ACCEPT}
        multiple
        className="hidden"
        onChange={(event) =>
          pick(event, async (uploads) => {
            const next = uploads.map((upload) => ({
              uploadId: upload._id,
              url: upload.url,
              name: upload.originalName,
              size: upload.size,
              mimeType: upload.mimeType,
            }));
            onChange([...value, ...next].slice(0, max));
          })
        }
      />
      {error ? <p className="mt-1.5 text-xs text-rose-400">{error}</p> : null}
      <p className="mt-1.5 text-[11px] text-slate-500">Up to {max} files, 12 MB each. Only you and the provider can open them.</p>
    </div>
  );
}
