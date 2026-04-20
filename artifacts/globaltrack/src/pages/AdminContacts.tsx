import { motion } from "framer-motion";
import { CheckCheck, Mail, Phone, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useListContacts, useMarkContactRead, getListContactsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "") + "/api";

export default function AdminContacts() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: contacts, isLoading } = useListContacts({}, {
    query: { queryKey: getListContactsQueryKey() },
  });

  const { mutate: markRead } = useMarkContactRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() }),
    },
  });

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this contact message? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${API_BASE}/contacts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok || res.status === 204) {
        queryClient.invalidateQueries({ queryKey: getListContactsQueryKey() });
      } else {
        console.error("Failed to delete contact message");
      }
    } catch (err) {
      console.error("Error deleting contact message:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const unreadCount = (contacts ?? []).filter((c) => !c.isRead).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground text-sm">
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "All messages read"}
            {contacts && contacts.length > 0 ? ` · ${contacts.length} total` : ""}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !contacts || contacts.length === 0 ? (
        <div className="rounded-xl border bg-card p-16 text-center">
          <Mail className="h-12 w-12 text-muted mx-auto mb-3" />
          <p className="text-muted-foreground">No contact messages yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`rounded-xl border bg-card p-5 transition-all ${!msg.isRead ? "border-primary/30 bg-primary/5" : ""}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="font-semibold">{msg.name}</p>
                    {!msg.isRead && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 border text-xs">New</Badge>
                    )}
                    {msg.subject && (
                      <span className="text-sm text-muted-foreground truncate">— {msg.subject}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 flex-wrap">
                    <a href={`mailto:${msg.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Mail className="h-3 w-3" /> {msg.email}
                    </a>
                    {msg.phone && (
                      <a href={`tel:${msg.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Phone className="h-3 w-3" /> {msg.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!msg.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markRead({ id: msg.id })}
                    >
                      <CheckCheck className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    disabled={deletingId === msg.id}
                    onClick={() => handleDelete(msg.id)}
                    title="Delete message"
                  >
                    {deletingId === msg.id ? (
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
