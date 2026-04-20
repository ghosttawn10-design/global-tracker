import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Star, Upload, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useListTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial, getListTestimonialsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

async function uploadFile(file: File): Promise<string> {
  const res = await fetch(`${API_BASE}/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
  });
  if (!res.ok) throw new Error("Failed to get upload URL");
  const { uploadURL, objectPath } = await res.json();
  await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });
  const filename = objectPath.split("/").pop();
  return `${API_BASE}/storage/public-objects/${filename}`;
}

const defaultForm = {
  name: "",
  role: "",
  company: "",
  quote: "",
  rating: 5,
  avatarUrl: "",
  isActive: true,
  sortOrder: 0,
};

type TestimonialForm = typeof defaultForm;

function AvatarUploadSection({ avatarUrl, onUploaded, onRemove }: {
  avatarUrl: string;
  onUploaded: (url: string) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onUploaded(url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Avatar / Profile Photo</Label>
      {avatarUrl ? (
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30" />
          <div className="space-y-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-3 w-3" /> Change Photo
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-destructive hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-3 w-3" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            {uploading ? (
              <><span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-3.5 w-3.5" /> Upload Photo</>
            )}
          </Button>
          <span className="text-xs text-muted-foreground">or</span>
          <Input
            placeholder="Paste image URL..."
            value={avatarUrl}
            onChange={(e) => onUploaded(e.target.value)}
            className="h-8 text-xs flex-1"
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}

function TestimonialFormModal({ initial, onSave, trigger }: {
  initial?: TestimonialForm & { id?: number };
  onSave: (data: TestimonialForm) => void;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TestimonialForm>(initial ?? defaultForm);

  useEffect(() => {
    if (open) {
      setForm(initial ?? defaultForm);
    }
  }, [open, initial?.id]);

  const set = (key: keyof TestimonialForm, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    onSave(form);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <AvatarUploadSection
            avatarUrl={form.avatarUrl}
            onUploaded={(url) => set("avatarUrl", url)}
            onRemove={() => set("avatarUrl", "")}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="CEO, VP Logistics..." />
            </div>
            <div className="space-y-1.5 col-span-2">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => set("company", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Quote *</Label>
            <Textarea value={form.quote} onChange={(e) => set("quote", e.target.value)} rows={3} placeholder="What did they say about GlobalTrack?" />
          </div>

          <div className="flex items-center gap-6">
            <div className="space-y-1.5">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => set("rating", r)}>
                    <Star className={`h-6 w-6 transition-colors ${r <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
              <Label>Show on site</Label>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Sort Order (lower = appears first)</Label>
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
              className="h-8 w-24"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim() || !form.quote.trim()}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTestimonials() {
  const queryClient = useQueryClient();
  const { data: testimonials, isLoading } = useListTestimonials({}, {
    query: { queryKey: getListTestimonialsQueryKey() },
  });

  const { mutate: createTestimonial } = useCreateTestimonial({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() }) },
  });
  const { mutate: updateTestimonial } = useUpdateTestimonial({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() }) },
  });
  const { mutate: deleteTestimonial } = useDeleteTestimonial({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListTestimonialsQueryKey() }) },
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm">Manage customer testimonials shown on the public site</p>
        </div>
        <TestimonialFormModal
          onSave={(form) => createTestimonial({ data: form })}
          trigger={<Button><Plus className="h-4 w-4 mr-2" />Add Testimonial</Button>}
        />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !testimonials || testimonials.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Star className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted-foreground">No testimonials yet. Add your first one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border bg-card p-5 transition-all ${!t.isActive ? "opacity-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  {t.avatarUrl ? (
                    <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-sm">{t.name[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.role}{t.company ? `, ${t.company}` : ""}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((r) => (
                        <Star key={r} className={`h-3 w-3 ${r <= t.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <TestimonialFormModal
                    key={`edit-${t.id}`}
                    initial={{ ...defaultForm, ...t, id: t.id }}
                    onSave={(form) => updateTestimonial({ id: t.id, data: form })}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      if (confirm("Delete this testimonial?")) deleteTestimonial({ id: t.id });
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-3">"{t.quote}"</p>
              <div className="flex items-center gap-2 mt-2">
                {!t.isActive && (
                  <p className="text-xs text-muted-foreground italic">Hidden from public</p>
                )}
                {t.sortOrder != null && (
                  <p className="text-xs text-muted-foreground/60 ml-auto">Order: {t.sortOrder}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
