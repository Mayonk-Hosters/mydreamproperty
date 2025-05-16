CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"title" text NOT NULL,
	"image" text NOT NULL,
	"deals" integer DEFAULT 0,
	"rating" real DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_info" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" text DEFAULT 'My Dream Property' NOT NULL,
	"address" text NOT NULL,
	"phone1" text NOT NULL,
	"phone2" text,
	"email1" text NOT NULL,
	"email2" text,
	"business_hours" jsonb DEFAULT '{"monday":"9:00 AM - 6:00 PM","tuesday":"9:00 AM - 6:00 PM","wednesday":"9:00 AM - 6:00 PM","thursday":"9:00 AM - 6:00 PM","friday":"9:00 AM - 6:00 PM","saturday":"10:00 AM - 4:00 PM","sunday":"Closed"}'::jsonb NOT NULL,
	"map_url" text,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "districts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"state_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"property_id" integer NOT NULL,
	"user_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "neighborhood_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"neighborhood_id" integer NOT NULL,
	"avg_property_price" numeric(12, 2),
	"safety_score" integer,
	"walkability_score" integer,
	"schools_score" integer,
	"public_transport_score" integer,
	"dining_score" integer,
	"entertainment_score" integer,
	"parking_score" integer,
	"noise_level" integer,
	"schools_count" integer DEFAULT 0,
	"parks_count" integer DEFAULT 0,
	"restaurants_count" integer DEFAULT 0,
	"hospitals_count" integer DEFAULT 0,
	"shopping_count" integer DEFAULT 0,
	"grocery_stores_count" integer DEFAULT 0,
	"gyms_count" integer DEFAULT 0,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "neighborhoods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"city" text NOT NULL,
	"description" text NOT NULL,
	"location_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "neighborhoods_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_number" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" real NOT NULL,
	"location" text NOT NULL,
	"address" text NOT NULL,
	"beds" integer NOT NULL,
	"baths" real NOT NULL,
	"area" integer NOT NULL,
	"property_type" text NOT NULL,
	"type" text DEFAULT 'buy' NOT NULL,
	"status" text DEFAULT 'active',
	"featured" boolean DEFAULT false,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"agent_id" integer NOT NULL,
	"neighborhood_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "properties_property_number_unique" UNIQUE("property_number")
);
--> statement-breakpoint
CREATE TABLE "property_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "property_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "states_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "talukas" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"district_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tehsils" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"taluka_id" integer NOT NULL,
	"area" text DEFAULT '',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"first_name" text,
	"last_name" text,
	"profile_image_url" text,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "districts" ADD CONSTRAINT "districts_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "neighborhood_metrics" ADD CONSTRAINT "neighborhood_metrics_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_neighborhood_id_neighborhoods_id_fk" FOREIGN KEY ("neighborhood_id") REFERENCES "public"."neighborhoods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talukas" ADD CONSTRAINT "talukas_district_id_districts_id_fk" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tehsils" ADD CONSTRAINT "tehsils_taluka_id_talukas_id_fk" FOREIGN KEY ("taluka_id") REFERENCES "public"."talukas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");