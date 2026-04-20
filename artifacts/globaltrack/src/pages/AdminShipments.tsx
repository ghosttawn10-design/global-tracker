import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit2, Trash2, Eye, MapPin, ChevronDown, ChevronUp, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListShipments, useCreateShipment, useUpdateShipment, useDeleteShipment, getListShipmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "delayed", label: "Delayed" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/25",
  in_transit: "bg-blue-500/15 text-blue-500 border-blue-500/25",
  out_for_delivery: "bg-orange-500/15 text-orange-500 border-orange-500/25",
  delivered: "bg-primary/15 text-primary border-primary/25",
  delayed: "bg-red-500/15 text-red-500 border-red-500/25",
};

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

interface LocationSearchProps {
  label: string;
  value: string;
  onChange: (name: string, lat: number, lng: number) => void;
  placeholder?: string;
}

function LocationSearch({ label, value, onChange, placeholder = "Search city or location..." }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=0`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    const shortName = result.display_name.split(",").slice(0, 3).join(",").trim();
    setQuery(shortName);
    setShowDropdown(false);
    setResults([]);
    onChange(shortName, parseFloat(result.lat), parseFloat(result.lon));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setShowDropdown(false);
    if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[0]);
    }
  };

  return (
    <div className="space-y-1.5" ref={containerRef}>
      <Label>{label}</Label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={handleInput}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-8 pr-8"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin pointer-events-none" />
        ) : query ? (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => { setQuery(""); setResults([]); setShowDropdown(false); }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {showDropdown && results.length > 0 && (
          <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-lg shadow-xl overflow-hidden max-h-56 overflow-y-auto">
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-start gap-2"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
              >
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <span className="line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface RoutePoint {
  lat: number;
  lng: number;
  label: string;
}

const defaultForm = {
  senderName: "",
  senderEmail: "",
  recipientName: "",
  recipientEmail: "",
  origin: "",
  destination: "",
  currentStatus: "pending",
  currentLocation: "",
  estimatedDelivery: "",
  weight: "",
  dimensions: "",
  packageType: "parcel",
  description: "",
  progressPercent: 0,
  routePoints: "",
  currentLat: undefined as number | undefined,
  currentLng: undefined as number | undefined,
};

type ShipmentForm = typeof defaultForm;

function ShipmentFormModal({ initial, onSave, trigger }: {
  initial?: ShipmentForm & { id?: number };
  onSave: (data: ShipmentForm) => void;
  trigger: React.ReactNode;
}) {
  const [form, setForm] = useState<ShipmentForm>(initial ?? defaultForm);
  const [open, setOpen] = useState(false);
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(() => {
    if (initial?.routePoints) {
      try { return JSON.parse(initial.routePoints); } catch {}
    }
    return [];
  });
  const [showRouteEditor, setShowRouteEditor] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initial ?? defaultForm);
      if (initial?.routePoints) {
        try { setRoutePoints(JSON.parse(initial.routePoints)); } catch { setRoutePoints([]); }
      } else {
        setRoutePoints([]);
      }
    }
  }, [open, initial?.id]);

  const set = (key: keyof ShipmentForm, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleOriginSelect = (name: string, lat: number, lng: number) => {
    set("origin", name);
    setRoutePoints((pts) => {
      const rest = pts.filter((_, i) => i !== 0);
      return [{ label: name, lat, lng }, ...rest];
    });
  };

  const handleDestSelect = (name: string, lat: number, lng: number) => {
    set("destination", name);
    set("currentLocation", name);
    set("currentLat", lat);
    set("currentLng", lng);
    setRoutePoints((pts) => {
      const withoutLast = pts.length >= 2 ? pts.slice(0, pts.length - 1) : pts;
      return [...withoutLast, { label: name, lat, lng }];
    });
  };

  const addWaypoint = (name: string, lat: number, lng: number) => {
    setRoutePoints((pts) => {
      if (pts.length < 2) return [...pts, { label: name, lat, lng }];
      const last = pts[pts.length - 1];
      return [...pts.slice(0, -1), { label: name, lat, lng }, last];
    });
  };

  const removeWaypoint = (idx: number) => {
    setRoutePoints((pts) => pts.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const finalForm = {
      ...form,
      routePoints: JSON.stringify(routePoints),
    };
    onSave(finalForm);
    setOpen(false);
    setForm(defaultForm);
    setRoutePoints([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial?.id ? "Edit Shipment" : "Create New Shipment"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Parties</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Sender Name *</Label>
                <Input value={form.senderName} onChange={(e) => set("senderName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sender Email</Label>
                <Input type="email" value={form.senderEmail} onChange={(e) => set("senderEmail", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Recipient Name *</Label>
                <Input value={form.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Recipient Email</Label>
                <Input type="email" value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Route</h3>
            <p className="text-xs text-muted-foreground -mt-2">Search any city or location worldwide — powered by OpenStreetMap</p>
            <div className="grid grid-cols-2 gap-3">
              <LocationSearch
                label="Origin *"
                value={form.origin}
                onChange={handleOriginSelect}
                placeholder="Search origin city..."
              />
              <LocationSearch
                label="Destination *"
                value={form.destination}
                onChange={handleDestSelect}
                placeholder="Search destination city..."
              />
            </div>

            <div className="rounded-xl border border-dashed p-3 space-y-2">
              <button
                type="button"
                onClick={() => setShowRouteEditor(!showRouteEditor)}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full"
              >
                <MapPin className="h-4 w-4 text-primary" />
                Route Points ({routePoints.length} point{routePoints.length !== 1 ? "s" : ""} set)
                {showRouteEditor ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
              </button>

              {showRouteEditor && (
                <div className="space-y-3 pt-2 border-t">
                  {routePoints.length > 0 && (
                    <div className="space-y-1.5">
                      {routePoints.map((pt, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs bg-muted/30 rounded-lg px-2 py-1.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] shrink-0 ${
                            i === 0 ? "bg-slate-400" : i === routePoints.length - 1 ? "bg-primary" : "bg-primary/60"
                          }`}>
                            {i === 0 ? "O" : i === routePoints.length - 1 ? "D" : i}
                          </div>
                          <span className="flex-1 text-muted-foreground truncate">{pt.label}</span>
                          <span className="text-muted-foreground/50 font-mono text-[10px] shrink-0">{pt.lat.toFixed(2)}, {pt.lng.toFixed(2)}</span>
                          {i !== 0 && i !== routePoints.length - 1 && (
                            <button onClick={() => removeWaypoint(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label className="text-xs">Add Waypoint</Label>
                    <LocationSearch
                      label=""
                      value=""
                      onChange={(name, lat, lng) => addWaypoint(name, lat, lng)}
                      placeholder="Search waypoint city..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Shipment Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.currentStatus} onValueChange={(v) => set("currentStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Package Type</Label>
                <Select value={form.packageType} onValueChange={(v) => set("packageType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parcel">Parcel</SelectItem>
                    <SelectItem value="freight">Freight</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="perishable">Perishable</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Est. Delivery *</Label>
                <Input type="date" value={form.estimatedDelivery} onChange={(e) => set("estimatedDelivery", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Current Location</Label>
                <Input value={form.currentLocation} onChange={(e) => set("currentLocation", e.target.value)} placeholder="e.g. Frankfurt Hub" />
              </div>
              <div className="space-y-1.5">
                <Label>Weight</Label>
                <Input value={form.weight} onChange={(e) => set("weight", e.target.value)} placeholder="2.5 kg" />
              </div>
              <div className="space-y-1.5">
                <Label>Dimensions</Label>
                <Input value={form.dimensions} onChange={(e) => set("dimensions", e.target.value)} placeholder="30×20×15 cm" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Package contents description..." />
              </div>
              <div className="space-y-2 col-span-2">
                <div className="flex justify-between">
                  <Label>Progress</Label>
                  <span className="text-sm font-semibold text-primary">{form.progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.progressPercent}
                  onChange={(e) => set("progressPercent", Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0% (Pending)</span>
                  <span>50% (In Transit)</span>
                  <span>100% (Delivered)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.senderName || !form.recipientName || !form.origin || !form.destination || !form.estimatedDelivery}>
            {initial?.id ? "Update Shipment" : "Create Shipment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminShipments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const { data, isLoading } = useListShipments({ page: 1, limit: 100 }, {
    query: { queryKey: getListShipmentsQueryKey({ page: 1, limit: 100 }) },
  });

  const { mutate: createShipment } = useCreateShipment({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListShipmentsQueryKey() }) },
  });

  const { mutate: updateShipment } = useUpdateShipment({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListShipmentsQueryKey() }) },
  });

  const { mutate: deleteShipment } = useDeleteShipment({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListShipmentsQueryKey() }) },
  });

  const filtered = (data?.shipments ?? []).filter((s) =>
    !search ||
    s.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
    s.recipientName.toLowerCase().includes(search.toLowerCase()) ||
    s.destination.toLowerCase().includes(search.toLowerCase()) ||
    s.origin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Shipments</h1>
          <p className="text-muted-foreground text-sm">Manage all shipments and tracking data</p>
        </div>
        <ShipmentFormModal
          onSave={(form) => createShipment({ data: form })}
          trigger={
            <Button className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />New Shipment
            </Button>
          }
        />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-10 h-10"
          placeholder="Search by tracking number, recipient, route..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/20">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Tracking #</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Recipient</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden md:table-cell">Route</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider hidden lg:table-cell">ETA</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 rounded-lg bg-muted animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    {search ? "No shipments match your search" : "No shipments yet — create your first one above"}
                  </td>
                </tr>
              ) : (
                filtered.map((ship, i) => (
                  <motion.tr
                    key={ship.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-xs">{ship.trackingNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{ship.recipientName}</p>
                      {ship.recipientEmail && <p className="text-xs text-muted-foreground">{ship.recipientEmail}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      <span className="truncate block max-w-[160px] text-xs">{ship.origin} → {ship.destination}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`border text-xs font-medium ${STATUS_COLORS[ship.currentStatus] ?? ""}`}>
                        {STATUS_OPTIONS.find(s => s.value === ship.currentStatus)?.label ?? ship.currentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${ship.progressPercent}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{ship.progressPercent}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden lg:table-cell">{ship.estimatedDelivery}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <a href={`/track?number=${ship.trackingNumber}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" title="Preview">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                        <ShipmentFormModal
                          key={`edit-${ship.id}`}
                          initial={{ ...defaultForm, ...ship, id: ship.id }}
                          onSave={(form) => updateShipment({ id: ship.id, data: form })}
                          trigger={
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" title="Edit">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Delete"
                          onClick={() => {
                            if (confirm(`Delete shipment ${ship.trackingNumber}? This cannot be undone.`)) {
                              deleteShipment({ id: ship.id });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="px-4 py-3 border-t border-border/50 text-xs text-muted-foreground">
            Showing {filtered.length} of {data.total} shipment{data.total !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
