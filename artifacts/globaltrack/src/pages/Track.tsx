import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Search, Package, MapPin, Clock, CheckCircle2, Circle, Truck, AlertCircle, ArrowRight, Weight, Ruler, Box, Calendar, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTrackShipment, getTrackShipmentQueryKey } from "@workspace/api-client-react";
import "leaflet/dist/leaflet.css";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-500 border-yellow-500/25",
  in_transit: "bg-blue-500/15 text-blue-500 border-blue-500/25",
  out_for_delivery: "bg-orange-500/15 text-orange-500 border-orange-500/25",
  delivered: "bg-primary/15 text-primary border-primary/25",
  delayed: "bg-red-500/15 text-red-500 border-red-500/25",
};

const statusLabels: Record<string, string> = {
  pending: "Order Placed",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  delayed: "Delayed",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  out_for_delivery: <ArrowRight className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  delayed: <AlertCircle className="h-4 w-4" />,
};

function interpolateAlongRoute(
  pts: Array<{ lat: number; lng: number }>,
  progress: number
): { lat: number; lng: number } {
  if (pts.length === 0) return { lat: 0, lng: 0 };
  if (pts.length === 1) return pts[0];
  if (progress <= 0) return pts[0];
  if (progress >= 1) return pts[pts.length - 1];

  const segmentCount = pts.length - 1;
  const targetDist = progress * segmentCount;
  const segmentIdx = Math.floor(targetDist);
  const segmentProgress = targetDist - segmentIdx;

  const p1 = pts[Math.min(segmentIdx, pts.length - 1)];
  const p2 = pts[Math.min(segmentIdx + 1, pts.length - 1)];

  return {
    lat: p1.lat + (p2.lat - p1.lat) * segmentProgress,
    lng: p1.lng + (p2.lng - p1.lng) * segmentProgress,
  };
}

function TrackingMap({ routePoints, progressPercent }: {
  routePoints: Array<{ lat: number; lng: number; label?: string }>;
  progressPercent: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const currentPosRef = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current || routePoints.length === 0) return;

    const progress = Math.max(0, Math.min(1, progressPercent / 100));
    const targetPos = interpolateAlongRoute(routePoints, progress);

    import("leaflet").then((L) => {
      if (mapInstanceRef.current) return;

      delete (L.Icon.Default.prototype as any)._getIconUrl;

      const center = routePoints[Math.floor(routePoints.length / 2)] ?? routePoints[0];

      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: routePoints.length > 2 ? 3 : 5,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      const isDark = document.documentElement.classList.contains("dark");
      const tiles = isDark
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      const tileLayer = L.tileLayer(tiles, {
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = tileLayer;

      if (routePoints.length >= 2) {
        const latlngs = routePoints.map((p) => [p.lat, p.lng] as [number, number]);
        L.polyline(latlngs, {
          color: "hsl(158, 60%, 48%)",
          weight: 2.5,
          opacity: 0.5,
          dashArray: "6, 4",
        }).addTo(map);

        routePoints.forEach((point, i) => {
          const isOrigin = i === 0;
          const isDest = i === routePoints.length - 1;
          if (isOrigin || isDest) {
            const marker = L.circleMarker([point.lat, point.lng], {
              radius: 5,
              fillColor: isDest ? "hsl(158, 60%, 48%)" : "#94a3b8",
              color: "#0f172a",
              weight: 2,
              fillOpacity: 1,
            }).addTo(map);
            const lbl = point.label ?? (isOrigin ? "Origin" : "Destination");
            marker.bindTooltip(lbl, { permanent: false, direction: "top", className: "leaflet-tooltip-custom" });
          }
        });

        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds, { padding: [40, 40] });
      }

      const pulsingIcon = L.divIcon({
        html: `<div class="gtl-marker">
          <div class="gtl-ring"></div>
          <div class="gtl-dot"></div>
        </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([targetPos.lat, targetPos.lng], { icon: pulsingIcon }).addTo(map);
      marker.bindTooltip("Current Location", { permanent: false, direction: "top" });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      currentPosRef.current = targetPos;

      setTimeout(() => map.invalidateSize(), 150);
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const updateTiles = () => {
      import("leaflet").then((L) => {
        const map = mapInstanceRef.current;
        if (!map) return;
        const isDark = document.documentElement.classList.contains("dark");
        const tiles = isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

        if (tileLayerRef.current && tileLayerRef.current._url === tiles) return;
        if (tileLayerRef.current) {
          map.removeLayer(tileLayerRef.current);
          tileLayerRef.current = null;
        }

        tileLayerRef.current = L.tileLayer(tiles, { subdomains: "abcd", maxZoom: 19 }).addTo(map);
      });
    };

    updateTiles();
    const obs = new MutationObserver(() => updateTiles());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!markerRef.current || routePoints.length === 0) return;
    const progress = Math.max(0, Math.min(1, progressPercent / 100));
    const target = interpolateAlongRoute(routePoints, progress);

    const smoothMove = () => {
      const cur = currentPosRef.current;
      const dx = target.lat - cur.lat;
      const dy = target.lng - cur.lng;
      if (Math.abs(dx) < 0.0001 && Math.abs(dy) < 0.0001) {
        markerRef.current?.setLatLng([target.lat, target.lng]);
        currentPosRef.current = target;
        return;
      }
      const next = {
        lat: cur.lat + dx * 0.08,
        lng: cur.lng + dy * 0.08,
      };
      currentPosRef.current = next;
      markerRef.current?.setLatLng([next.lat, next.lng]);
      animFrameRef.current = requestAnimationFrame(smoothMove);
    };
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(smoothMove);
  }, [progressPercent, routePoints]);

  return (
    <div className="relative w-full h-72 md:h-96 rounded-xl overflow-hidden border border-border">
      <div ref={mapRef} className="w-full h-full" />
      <style>{`
        .gtl-marker { position: relative; width: 28px; height: 28px; }
        .gtl-ring {
          position: absolute; top: 0; left: 0; width: 28px; height: 28px;
          border-radius: 50%; background: rgba(52, 211, 153, 0.25);
          animation: gtl-pulse 2s ease-out infinite;
        }
        .gtl-dot {
          position: absolute; top: 7px; left: 7px; width: 14px; height: 14px;
          border-radius: 50%; background: hsl(158, 60%, 48%); border: 2.5px solid #0f172a;
          box-shadow: 0 0 10px rgba(52, 211, 153, 0.6);
        }
        @keyframes gtl-pulse {
          0% { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .leaflet-tooltip-custom {
          background: #0f172a;
          border: 1px solid rgba(52,211,153,0.3);
          color: #e2e8f0;
          border-radius: 6px;
          font-size: 11px;
          padding: 2px 6px;
        }
      `}</style>
    </div>
  );
}

export default function Track() {
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [trackingNumber, setTrackingNumber] = useState(searchParams.get("number") ?? "");
  const [activeTracking, setActiveTracking] = useState(searchParams.get("number") ?? "");

  const { data: shipment, isLoading, isError } = useTrackShipment(activeTracking, {
    query: {
      enabled: !!activeTracking,
      queryKey: getTrackShipmentQueryKey(activeTracking),
    },
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setActiveTracking(trackingNumber.trim());
    }
  };

  const progressSteps = ["pending", "in_transit", "out_for_delivery", "delivered"];
  const currentStepIdx = shipment ? progressSteps.indexOf(shipment.currentStatus) : -1;

  const routePoints = (shipment?.routePoints
    ? (typeof shipment.routePoints === "string" ? JSON.parse(shipment.routePoints) : shipment.routePoints)
    : []) as Array<{ lat: number; lng: number; label?: string }>;

  return (
    <div className="min-h-screen bg-background">
      <div className="hero-gradient border-b py-10 md:py-14 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-semibold uppercase tracking-widest mb-3">
              <Navigation className="h-4 w-4" />
              Real-Time Tracking
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-white">Track Your Shipment</h1>
            <p className="text-white/50 mb-8">Enter your tracking number for real-time status and live location</p>
          </motion.div>

          <form onSubmit={handleTrack} className="flex gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. GTL-DEMO001"
                className="pl-10 h-12 bg-white text-gray-900 placeholder:text-gray-400 border-0 rounded-xl shadow-lg"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 rounded-xl shrink-0">Track</Button>
          </form>
          <p className="text-xs text-white/30 mt-3">Try: GTL-DEMO001, GTL-DEMO002, GTL-DEMO003</p>
        </div>
      </div>

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Shipment Not Found</h2>
            <p className="text-muted-foreground">No shipment found with tracking number <strong className="font-mono">{activeTracking}</strong></p>
            <p className="text-sm text-muted-foreground mt-2">Please verify your tracking number and try again.</p>
          </motion.div>
        )}

        {shipment && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Status Header */}
              <div className="rounded-2xl border bg-card p-5 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center flex-wrap gap-3 mb-2">
                      <Package className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-mono text-base font-bold">{shipment.trackingNumber}</span>
                      <Badge className={`border text-xs font-medium ${statusColors[shipment.currentStatus] ?? ""}`}>
                        {statusLabels[shipment.currentStatus] ?? shipment.currentStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span>{shipment.currentLocation}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground mb-1">Estimated Delivery</p>
                    <div className="flex items-center justify-end gap-1.5 text-primary font-semibold">
                      <Calendar className="h-4 w-4" />
                      <span>{shipment.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Steps */}
                <div className="mt-2">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted z-0">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, (currentStepIdx / (progressSteps.length - 1)) * 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                    {progressSteps.map((step, i) => (
                      <div key={step} className="flex flex-col items-center z-10 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                          i < currentStepIdx
                            ? "bg-primary border-primary text-white"
                            : i === currentStepIdx
                            ? "bg-primary border-primary text-white shadow-lg"
                            : "bg-background border-border text-muted-foreground"
                        }`}>
                          {i < currentStepIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-2 text-center hidden sm:block leading-tight max-w-[60px]">
                          {statusLabels[step]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-muted-foreground">Progress</span>
                    <span className="text-xs font-semibold text-primary">{shipment.progressPercent}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${shipment.progressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Map */}
              {routePoints.length > 0 && (
                <div className="rounded-2xl border bg-card p-4 md:p-5">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Live Location
                  </h3>
                  <TrackingMap
                    routePoints={routePoints}
                    progressPercent={shipment.progressPercent}
                  />
                  <div className="flex gap-6 mt-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <span>Current Position</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-7 h-0 border-t-2 border-dashed border-primary/40" />
                      <span>Route</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5">
                {/* Package Info */}
                <div className="rounded-2xl border bg-card p-5 md:p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" />
                    Package Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Box className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize font-medium">{shipment.packageType}</span>
                    </div>
                    {shipment.weight && (
                      <div className="flex items-center gap-3">
                        <Weight className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Weight:</span>
                        <span className="font-medium">{shipment.weight}</span>
                      </div>
                    )}
                    {shipment.dimensions && (
                      <div className="flex items-center gap-3">
                        <Ruler className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">Dimensions:</span>
                        <span className="font-medium">{shipment.dimensions}</span>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> From
                        </span>
                        <span className="font-medium text-right max-w-[60%]">{shipment.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary" /> To
                        </span>
                        <span className="font-medium text-right max-w-[60%]">{shipment.destination}</span>
                      </div>
                    </div>
                    <div className="border-t pt-3 space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sender</span>
                        <span className="font-medium">{shipment.senderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-medium">{shipment.recipientName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div className="rounded-2xl border bg-card p-5 md:p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Tracking History
                  </h3>
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {[...(shipment.events ?? [])].reverse().map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                            i === 0 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {statusIcons[event.status] ?? <Circle className="h-3.5 w-3.5" />}
                          </div>
                          {i < (shipment.events?.length ?? 0) - 1 && (
                            <div className="w-px flex-1 bg-border mt-1 mb-0 min-h-[1rem]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pb-3">
                          <p className="font-medium text-sm leading-snug">{event.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{event.location}</p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {(!shipment.events || shipment.events.length === 0) && (
                      <p className="text-muted-foreground text-sm">No tracking events yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && !isError && !shipment && !activeTracking && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Enter Your Tracking Number</h2>
            <p className="text-muted-foreground">Use the search bar above to find your shipment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
