CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"tracking_number" text NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text,
	"recipient_name" text NOT NULL,
	"recipient_email" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"current_status" text DEFAULT 'pending' NOT NULL,
	"current_location" text NOT NULL,
	"estimated_delivery" text NOT NULL,
	"weight" text,
	"dimensions" text,
	"package_type" text DEFAULT 'parcel' NOT NULL,
	"description" text,
	"current_lat" real,
	"current_lng" real,
	"route_points" text,
	"progress_percent" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_tracking_number_unique" UNIQUE("tracking_number")
);
--> statement-breakpoint
CREATE TABLE "tracking_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"shipment_id" integer NOT NULL,
	"status" text NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"lat" real,
	"lng" real,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"role" text,
	"company" text,
	"quote" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"avatar_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text DEFAULT 'Admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'GlobalTrack Logistique' NOT NULL,
	"hero_title" text DEFAULT 'Track Every Shipment, Everywhere.' NOT NULL,
	"hero_subtitle" text DEFAULT 'Premium global logistics with precision tracking and real-time updates. Your packages are always in sight, always on time.' NOT NULL,
	"primary_color" text DEFAULT '#0066FF',
	"logo_url" text,
	"hero_images" text,
	"hero_image_slide_enabled" boolean DEFAULT false NOT NULL,
	"hero_image_slide_interval" integer DEFAULT 5 NOT NULL,
	"whatsapp_number" text,
	"whatsapp_enabled" boolean DEFAULT false NOT NULL,
	"telegram_link" text,
	"telegram_enabled" boolean DEFAULT false NOT NULL,
	"tawkto_script" text,
	"tawkto_enabled" boolean DEFAULT false NOT NULL,
	"facebook_url" text,
	"twitter_url" text,
	"instagram_url" text,
	"linkedin_url" text,
	"contact_email" text,
	"contact_phone" text,
	"address" text,
	"smtp_host" text,
	"smtp_port" text DEFAULT '587',
	"smtp_user" text,
	"smtp_pass" text,
	"smtp_from" text,
	"smtp_to" text,
	"smtp_enabled" boolean DEFAULT false NOT NULL,
	"dark_mode_default" boolean DEFAULT true NOT NULL,
	"privacy_policy" text,
	"terms_of_service" text,
	"cookies_policy" text,
	"business_hours" text,
	"business_hours_timezone" text DEFAULT 'America/New_York',
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tracking_events" ADD CONSTRAINT "tracking_events_shipment_id_shipments_id_fk" FOREIGN KEY ("shipment_id") REFERENCES "public"."shipments"("id") ON DELETE cascade ON UPDATE no action;