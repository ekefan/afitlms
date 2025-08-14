CREATE TABLE "users" (
  "id" bigserial PRIMARY KEY,
  "full_name" varchar NOT NULL,
  "roles" TEXT[],
  "card_uid" varchar NOT NULL,
  "enrolled" boolean NOT NULL DEFAULT false,
  "email" varchar UNIQUE NOT NULL,
  "sch_id" varchar UNIQUE NOT NULL,
  "hashed_password" varchar NOT NULL,
  "password_changed" boolean NOT NULL DEFAULT false,
  "updated_at" timestamp DEFAULT '0001-01-01 00:00:00Z',
  "created_at" timestamp NOT NULL DEFAULT (now())
);



