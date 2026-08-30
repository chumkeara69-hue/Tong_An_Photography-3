"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

async function uploadWithRetry(url: string, file: File, attempts = 4) {
  let lastError = "Upload failed.";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5 * 60 * 1000);
    try {
      const response = await fetch(url, {
        method: "PUT",
        mode: "cors",
        headers: { "content-type": file.type },
        body: file,
        signal: controller.signal,
      });
      if (response.ok) return;
      let detail = "";
      try {
        const text = await response.text();
        detail = text.replace(/<[^>]+>/g, " ").replace(/\\s+/g, " ").trim().slice(0, 240);
      } catch {}
      lastError = `Upload failed (HTTP ${response.status})${detail ? `: ${detail}` : "."}`;
      // Retry transient server/rate-limit errors; fail fast on client errors.
      if (response.status < 500 && response.status !== 429) break;
    } catch (error) {
      lastError = error instanceof DOMException && error.name === "AbortError"
        ? "Upload timed out. Please try again."
        : error instanceof TypeError
          ? "Browser could not reach Backblaze B2 (likely CORS or S3_ENDPOINT mismatch). Check B2 CORS, S3_BUCKET and S3_ENDPOINT."
          : error instanceof Error ? error.message : "Network error during upload.";
    } finally {
      window.clearTimeout(timeout);
    }
    if (attempt < attempts) {
      const delay = Math.min(1000 * 2 ** (attempt - 1), 8000) + Math.floor(Math.random() * 500);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(lastError);
}

export default function NewPhoto() {
  const r = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const f = new FormData(e.currentTarget);
      const data = {
        title: String(f.get("title") || ""),
        category: String(f.get("category") || ""),
        price: String(f.get("price") || ""),
        description: String(f.get("description") || ""),
      };
      const original = f.get("original") as File;
      const preview = f.get("preview") as File;

      if (!original?.size || !preview?.size) throw new Error("Please select both image files.");
      for (const file of [original, preview]) {
        if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error("Only JPG, PNG or WebP images are supported.");
        if (file.size > MAX_IMAGE_BYTES) throw new Error("Each image must be smaller than 25 MB.");
      }

      const p = await fetch("/api/admin/photos/presign", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          originalName: original.name,
          originalType: original.type,
          originalSize: original.size,
          previewName: preview.name,
          previewType: preview.type,
          previewSize: preview.size,
        }),
      });
      const urls = await p.json().catch(() => ({}));
      if (p.status === 401) {
        throw new Error("UNAUTHORIZED: Your admin session has expired. Please log in again and retry.");
      }
      if (!p.ok) throw new Error(urls.error || `Could not prepare the upload (HTTP ${p.status}).`);

      await Promise.all([
        uploadWithRetry(urls.original.url, original),
        uploadWithRetry(urls.preview.url, preview),
      ]);

      const c = await fetch("/api/admin/photos/complete", {
        method: "POST",
        credentials: "same-origin",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          priceCents: Math.round(Number(data.price) * 100),
          originalStorageKey: urls.original.key,
          previewStorageKey: urls.preview.key,
          originalSize: original.size,
          previewSize: preview.size,
          originalContentType: original.type,
          previewContentType: preview.type,
        }),
      });
      const result = await c.json().catch(() => ({}));
      if (c.status === 401) {
        throw new Error("UNAUTHORIZED: Your admin session has expired. Please log in again and retry.");
      }
      if (!c.ok) throw new Error(result.error || `Could not save photo (HTTP ${c.status}).`);
      r.push("/admin");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="container" style={{ padding: "45px 0", maxWidth: 760 }}><h1>Upload Original Photo</h1><form onSubmit={submit} style={{ display: "grid", gap: 16, marginTop: 25 }} className="card"><div style={{ padding: 24, display: "grid", gap: 16 }}><div><label className="label">Title</label><input name="title" className="input" required /></div><div><label className="label">Category</label><input name="category" className="input" placeholder="Landscape" required /></div><div><label className="label">Price (USD)</label><input name="price" type="number" min="0.01" step="0.01" className="input" required /></div><div><label className="label">Description</label><textarea name="description" className="input" rows={4} /></div><div><label className="label">Original File</label><input name="original" type="file" accept="image/jpeg,image/png,image/webp" required /></div><div><label className="label">Preview / Watermarked File</label><input name="preview" type="file" accept="image/jpeg,image/png,image/webp" required /></div>{msg && <p style={{ color: "#fca5a5" }}>{msg}</p>}<button className="btn btn-gold" disabled={busy}>{busy ? "Uploading…" : "Upload Photo"}</button></div></form></main>;
}
