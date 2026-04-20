import { db, testimonialsTable, shipmentsTable, trackingEventsTable, siteSettingsTable } from "./index.js";
import { count, sql } from "drizzle-orm";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "VP of Logistics",
    company: "TechCorp Solutions",
    quote: "GlobalTrack transformed our supply chain. Real-time visibility across 40+ countries, with zero surprises. Our on-time delivery rate jumped from 81% to 97% in just three months.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/12.jpg",
    isActive: true,
    sortOrder: 1,
  },
  {
    name: "Marcus Johnson",
    role: "CEO",
    company: "Premier Imports Ltd",
    quote: "We handle over 2,000 shipments monthly. GlobalTrack gives us and our clients complete peace of mind. The tracking dashboard is simply the best I've seen in 20 years in this industry.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/men/23.jpg",
    isActive: true,
    sortOrder: 2,
  },
  {
    name: "Fatima Al-Hassan",
    role: "Supply Chain Director",
    company: "Gulf Petrochemicals",
    quote: "Precision and reliability are non-negotiable in our industry. GlobalTrack delivers both. Their platform handles our complex multi-leg shipments flawlessly, with instant alerts at every checkpoint.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/33.jpg",
    isActive: true,
    sortOrder: 3,
  },
  {
    name: "Pierre Dubois",
    role: "Procurement Manager",
    company: "Luxe Boutiques Paris",
    quote: "We ship luxury goods that require the utmost care. GlobalTrack's system gives us granular tracking and the confidence that every package is handled with the attention it deserves.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/men/34.jpg",
    isActive: true,
    sortOrder: 4,
  },
  {
    name: "Yuki Tanaka",
    role: "Operations Head",
    company: "Tanaka Electronics",
    quote: "Our Japan-to-US shipments used to be a black box. Now we have live visibility with precise ETAs. GlobalTrack's platform has become an indispensable part of our daily operations.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    isActive: true,
    sortOrder: 5,
  },
  {
    name: "Amara Osei",
    role: "Founder",
    company: "AfriGoods Marketplace",
    quote: "As a growing e-commerce platform across West Africa, reliable logistics is everything. GlobalTrack has been instrumental in building our customers' trust with accurate, real-time tracking.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/55.jpg",
    isActive: true,
    sortOrder: 6,
  },
  {
    name: "Carlos Rivera",
    role: "Logistics Coordinator",
    company: "Rivera & Sons Trading",
    quote: "I've worked with many logistics platforms over the years. GlobalTrack is in a class of its own — intuitive, fast, and the support team is outstanding whenever we need them.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/men/67.jpg",
    isActive: true,
    sortOrder: 7,
  },
  {
    name: "Ingrid Svensson",
    role: "Director of Operations",
    company: "Nordic Seafoods AS",
    quote: "Shipping perishables across continents requires absolute precision. GlobalTrack's live tracking and proactive delay alerts have helped us maintain our quality standards and customer satisfaction.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/78.jpg",
    isActive: true,
    sortOrder: 8,
  },
  {
    name: "Rajan Patel",
    role: "CFO",
    company: "Patel Pharma Industries",
    quote: "Pharmaceutical logistics has zero tolerance for error. GlobalTrack's end-to-end visibility and compliance features have made it our platform of choice for all temperature-sensitive shipments.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/men/89.jpg",
    isActive: true,
    sortOrder: 9,
  },
  {
    name: "Elena Volkov",
    role: "Export Manager",
    company: "Volkov Agricultural Group",
    quote: "We export to 30+ countries. GlobalTrack gives our buyers real-time shipment status, which has significantly reduced support inquiries and strengthened our business relationships worldwide.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/90.jpg",
    isActive: true,
    sortOrder: 10,
  },
  {
    name: "James Okafor",
    role: "VP Supply Chain",
    company: "Lagos Consolidated",
    quote: "Before GlobalTrack, we were drowning in emails trying to track shipments. Now everything is in one dashboard. The efficiency gains have been remarkable — easily 30% reduction in logistics overhead.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/men/91.jpg",
    isActive: true,
    sortOrder: 11,
  },
  {
    name: "Maria Santos",
    role: "Head of Procurement",
    company: "Santos Coffee Exports",
    quote: "We export premium coffee beans from Brazil to distributors worldwide. GlobalTrack has made our export operations seamless and given our partners the transparency they expect from a world-class supplier.",
    rating: 5,
    avatarUrl: "https://randomuser.me/api/portraits/women/92.jpg",
    isActive: true,
    sortOrder: 12,
  },
];

const DEFAULT_BUSINESS_HOURS = JSON.stringify({
  monday:    { open: true,  from: "09:00", to: "18:00" },
  tuesday:   { open: true,  from: "09:00", to: "18:00" },
  wednesday: { open: true,  from: "09:00", to: "18:00" },
  thursday:  { open: true,  from: "09:00", to: "18:00" },
  friday:    { open: true,  from: "09:00", to: "17:00" },
  saturday:  { open: true,  from: "10:00", to: "14:00" },
  sunday:    { open: false, from: "09:00", to: "18:00" },
});

async function seed() {
  console.log("🌱 Starting seed...");

  // ── Testimonials ───────────────────────────────────────────────────────────
  console.log("  Upserting 12 testimonials with avatars...");
  await db.execute(sql`TRUNCATE TABLE testimonials RESTART IDENTITY CASCADE`);
  await db.insert(testimonialsTable).values(TESTIMONIALS);
  console.log("  ✓ 12 testimonials inserted");

  // ── Shipments ──────────────────────────────────────────────────────────────
  console.log("  Inserting 5 realistic shipments...");
  await db.execute(sql`TRUNCATE TABLE tracking_events RESTART IDENTITY CASCADE`);
  await db.execute(sql`TRUNCATE TABLE shipments RESTART IDENTITY CASCADE`);

  const now = new Date();
  const daysFromNow = (d: number) =>
    new Date(now.getTime() + d * 86400000).toISOString().split("T")[0];

  const shipments = await db.insert(shipmentsTable).values([
    {
      trackingNumber: "GTL-2026-0481",
      senderName: "TechCorp Solutions Inc.",
      senderEmail: "logistics@techcorp.com",
      recipientName: "Premier Distribution UK",
      recipientEmail: "receiving@premierdist.co.uk",
      origin: "New York, NY, USA",
      destination: "London, United Kingdom",
      currentStatus: "in_transit",
      currentLocation: "JFK International Airport, Queens, NY",
      estimatedDelivery: daysFromNow(3),
      weight: "12.5 kg",
      dimensions: "60 × 40 × 30 cm",
      packageType: "electronics",
      description: "Server hardware components — fragile, handle with care",
      currentLat: 40.6413,
      currentLng: -73.7781,
      progressPercent: 45,
      routePoints: JSON.stringify([
        { lat: 40.7128, lng: -74.006, label: "New York, NY" },
        { lat: 40.6413, lng: -73.7781, label: "JFK International Airport" },
        { lat: 51.5074, lng: -0.1278, label: "London, UK" },
      ]),
    },
    {
      trackingNumber: "GTL-2026-0392",
      senderName: "Tanaka Electronics Co.",
      senderEmail: "export@tanaka-elec.jp",
      recipientName: "Pacific Retail Group USA",
      recipientEmail: "imports@pacificretail.com",
      origin: "Shanghai, China",
      destination: "Los Angeles, CA, USA",
      currentStatus: "delivered",
      currentLocation: "Los Angeles, CA, USA",
      estimatedDelivery: daysFromNow(-2),
      weight: "32 kg",
      dimensions: "80 × 60 × 50 cm",
      packageType: "electronics",
      description: "Consumer electronics — LCD panels, fragile",
      currentLat: 34.0522,
      currentLng: -118.2437,
      progressPercent: 100,
      routePoints: JSON.stringify([
        { lat: 31.2304, lng: 121.4737, label: "Shanghai, China" },
        { lat: 31.1443, lng: 121.8083, label: "Shanghai Pudong Airport" },
        { lat: 33.9425, lng: -118.408, label: "Los Angeles Airport" },
        { lat: 34.0522, lng: -118.2437, label: "Los Angeles, CA" },
      ]),
    },
    {
      trackingNumber: "GTL-2026-0517",
      senderName: "Luxe Boutiques Paris SAS",
      senderEmail: "expeditions@luxeboutiques.fr",
      recipientName: "Al-Rashid Fashion House LLC",
      recipientEmail: "receiving@alrashidfashion.ae",
      origin: "Paris, France",
      destination: "Dubai, United Arab Emirates",
      currentStatus: "out_for_delivery",
      currentLocation: "Dubai International Airport, UAE",
      estimatedDelivery: daysFromNow(0),
      weight: "4.2 kg",
      dimensions: "50 × 35 × 25 cm",
      packageType: "parcel",
      description: "Luxury couture — High value, signature required",
      currentLat: 25.2532,
      currentLng: 55.3657,
      progressPercent: 88,
      routePoints: JSON.stringify([
        { lat: 48.8566, lng: 2.3522, label: "Paris, France" },
        { lat: 49.0097, lng: 2.5479, label: "CDG Airport, Paris" },
        { lat: 25.2532, lng: 55.3657, label: "Dubai International Airport" },
        { lat: 25.2048, lng: 55.2708, label: "Dubai, UAE" },
      ]),
    },
    {
      trackingNumber: "GTL-2026-0288",
      senderName: "Nordic Seafoods AS",
      senderEmail: "export@nordicseafoods.no",
      recipientName: "Harbour Fresh Markets Pty",
      recipientEmail: "imports@harbourfresh.com.au",
      origin: "Bergen, Norway",
      destination: "Sydney, New South Wales, Australia",
      currentStatus: "delayed",
      currentLocation: "Doha, Qatar — Transit Hub",
      estimatedDelivery: daysFromNow(2),
      weight: "68 kg",
      dimensions: "120 × 80 × 60 cm",
      packageType: "freight",
      description: "Fresh Atlantic salmon — Temperature-controlled cold chain",
      currentLat: 25.2731,
      currentLng: 51.6081,
      progressPercent: 58,
      routePoints: JSON.stringify([
        { lat: 60.3913, lng: 5.3221, label: "Bergen, Norway" },
        { lat: 60.1938, lng: 11.1004, label: "Oslo Airport Gardermoen" },
        { lat: 25.2731, lng: 51.6081, label: "Hamad International Airport, Qatar" },
        { lat: -33.9399, lng: 151.1753, label: "Sydney Airport, Australia" },
      ]),
    },
    {
      trackingNumber: "GTL-2026-0644",
      senderName: "Patel Pharma Industries Ltd.",
      senderEmail: "exports@patelpharma.in",
      recipientName: "MedSupply Deutschland GmbH",
      recipientEmail: "procurement@medsupply.de",
      origin: "Mumbai, Maharashtra, India",
      destination: "Frankfurt, Germany",
      currentStatus: "pending",
      currentLocation: "Chhatrapati Shivaji Airport, Mumbai",
      estimatedDelivery: daysFromNow(6),
      weight: "18 kg",
      dimensions: "45 × 30 × 20 cm",
      packageType: "freight",
      description: "Pharmaceutical supplies — Temperature sensitive 2–8°C",
      currentLat: 19.0896,
      currentLng: 72.8656,
      progressPercent: 8,
      routePoints: JSON.stringify([
        { lat: 19.0760, lng: 72.8777, label: "Mumbai, India" },
        { lat: 19.0896, lng: 72.8656, label: "Chhatrapati Shivaji Airport" },
        { lat: 50.0379, lng: 8.5622, label: "Frankfurt Airport, Germany" },
        { lat: 50.1109, lng: 8.6821, label: "Frankfurt, Germany" },
      ]),
    },
  ]).returning();

  for (const shipment of shipments) {
    if (shipment.trackingNumber === "GTL-2026-0481") {
      await db.insert(trackingEventsTable).values([
        { shipmentId: shipment.id, status: "processing", description: "Shipment registered and documentation verified", location: "New York, NY, USA", lat: 40.7128, lng: -74.006, timestamp: new Date(now.getTime() - 3 * 86400000) },
        { shipmentId: shipment.id, status: "picked_up", description: "Package collected from sender warehouse", location: "Manhattan, New York, NY", lat: 40.7589, lng: -73.9851, timestamp: new Date(now.getTime() - 2.5 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Arrived at JFK cargo sorting facility", location: "JFK International Airport", lat: 40.6413, lng: -73.7781, timestamp: new Date(now.getTime() - 1 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Loaded and departed JFK — en route to London Heathrow", location: "JFK International Airport", lat: 40.6413, lng: -73.7781, timestamp: new Date(now.getTime() - 0.5 * 86400000) },
      ]);
    } else if (shipment.trackingNumber === "GTL-2026-0392") {
      await db.insert(trackingEventsTable).values([
        { shipmentId: shipment.id, status: "processing", description: "Export documentation cleared at Shanghai customs", location: "Shanghai, China", lat: 31.2304, lng: 121.4737, timestamp: new Date(now.getTime() - 12 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Departed Pudong International on cargo flight CA837", location: "Shanghai Pudong Airport", lat: 31.1443, lng: 121.8083, timestamp: new Date(now.getTime() - 10 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Arrived LAX — US Customs inspection in progress", location: "Los Angeles International Airport", lat: 33.9425, lng: -118.408, timestamp: new Date(now.getTime() - 3 * 86400000) },
        { shipmentId: shipment.id, status: "out_for_delivery", description: "Customs cleared — out for final delivery, driver assigned", location: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, timestamp: new Date(now.getTime() - 1 * 86400000) },
        { shipmentId: shipment.id, status: "delivered", description: "Package delivered and signature obtained — L. Thompson", location: "Los Angeles, CA", lat: 34.0522, lng: -118.2437, timestamp: new Date(now.getTime() - 0.5 * 86400000) },
      ]);
    } else if (shipment.trackingNumber === "GTL-2026-0517") {
      await db.insert(trackingEventsTable).values([
        { shipmentId: shipment.id, status: "processing", description: "Luxury items inspected, packaged and certified", location: "Paris, France", lat: 48.8566, lng: 2.3522, timestamp: new Date(now.getTime() - 3 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Departed Charles de Gaulle cargo terminal, Flight EK76", location: "CDG Airport, Paris", lat: 49.0097, lng: 2.5479, timestamp: new Date(now.getTime() - 2 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Arrived Dubai — customs valuation in process", location: "Dubai International Airport", lat: 25.2532, lng: 55.3657, timestamp: new Date(now.getTime() - 0.5 * 86400000) },
        { shipmentId: shipment.id, status: "out_for_delivery", description: "Cleared customs — assigned to white-glove delivery team", location: "Dubai, UAE", lat: 25.2048, lng: 55.2708, timestamp: new Date(now.getTime() - 0.1 * 86400000) },
      ]);
    } else if (shipment.trackingNumber === "GTL-2026-0288") {
      await db.insert(trackingEventsTable).values([
        { shipmentId: shipment.id, status: "processing", description: "Cold chain shipment prepared and temperature verified", location: "Bergen, Norway", lat: 60.3913, lng: 5.3221, timestamp: new Date(now.getTime() - 5 * 86400000) },
        { shipmentId: shipment.id, status: "in_transit", description: "Departed Bergen — cold cargo flight via Oslo", location: "Oslo Airport Gardermoen", lat: 60.1938, lng: 11.1004, timestamp: new Date(now.getTime() - 4 * 86400000) },
        { shipmentId: shipment.id, status: "delayed", description: "Weather disruption at Doha hub — revised ETA +48h, temp maintained", location: "Hamad International Airport, Doha, Qatar", lat: 25.2731, lng: 51.6081, timestamp: new Date(now.getTime() - 1 * 86400000) },
      ]);
    } else if (shipment.trackingNumber === "GTL-2026-0644") {
      await db.insert(trackingEventsTable).values([
        { shipmentId: shipment.id, status: "processing", description: "Export license approved, pharmaceutical cert. obtained", location: "Mumbai, India", lat: 19.076, lng: 72.8777, timestamp: new Date(now.getTime() - 0.5 * 86400000) },
        { shipmentId: shipment.id, status: "processing", description: "Temperature-controlled packaging applied and sealed", location: "Chhatrapati Shivaji Airport, Mumbai", lat: 19.0896, lng: 72.8656, timestamp: new Date(now.getTime() - 0.2 * 86400000) },
      ]);
    }
  }

  console.log("  ✓ 5 realistic shipments with tracking events inserted");

  // ── Site Settings ──────────────────────────────────────────────────────────
  const [{ value: settingsCount }] = await db.select({ value: count() }).from(siteSettingsTable);
  if (Number(settingsCount) === 0) {
    console.log("  Inserting default site settings...");
    await db.insert(siteSettingsTable).values({
      companyName: "GlobalTrack Logistique",
      heroTitle: "Track Every Shipment, Everywhere.",
      heroSubtitle: "Premium global logistics with precision tracking and real-time updates. Your packages are always in sight, always on time.",
      primaryColor: "#0066FF",
      contactEmail: "contact@globaltrack.com",
      contactPhone: "+1 (800) 555-0199",
      address: "123 Logistics Way, New York, NY 10001",
      darkModeDefault: true,
      businessHours: DEFAULT_BUSINESS_HOURS,
      businessHoursTimezone: "America/New_York",
    });
    console.log("  ✓ Default site settings inserted");
  } else {
    // Ensure businessHours is set even if settings already exist
    await db.execute(sql`
      UPDATE site_settings SET 
        business_hours = ${DEFAULT_BUSINESS_HOURS},
        business_hours_timezone = 'America/New_York'
      WHERE business_hours IS NULL
    `);
    console.log(`  Settings already exist — patched businessHours if missing`);
  }

  console.log("✅ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
