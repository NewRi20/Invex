-- Invex Database Schema
-- Generated based on existing Supabase structure

-- 1. Users Table (Extends Supabase auth.users)
CREATE TABLE public.user (
  id uuid NOT NULL,
  first_name character varying,
  last_name character varying,
  birthday date,
  home_address text,
  CONSTRAINT user_pkey PRIMARY KEY (id),
  CONSTRAINT user_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- 2. Item Categories Table
CREATE TABLE public.item_category (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  name character varying UNIQUE,
  normalized_name text DEFAULT normalize_text((name)::text),
  CONSTRAINT item_category_pkey PRIMARY KEY (id)
);

-- 3. Business Info Table
CREATE TABLE public.business_info (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  business_name character varying NOT NULL UNIQUE,
  business_address text NOT NULL UNIQUE,
  year_founded date NOT NULL,
  user_id uuid NOT NULL UNIQUE,
  CONSTRAINT business_info_pkey PRIMARY KEY (id),
  CONSTRAINT business_info_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id)
);

-- 4. Items Table
CREATE TABLE public.item (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  item_name character varying NOT NULL,
  user_id uuid NOT NULL,
  item_category bigint,
  quantity bigint NOT NULL,
  price double precision NOT NULL,
  cost double precision DEFAULT 0,
  damaged_quantity bigint DEFAULT 0,
  date_added date DEFAULT CURRENT_DATE,
  price_last_update timestamp with time zone NOT NULL,
  CONSTRAINT item_pkey PRIMARY KEY (id),
  CONSTRAINT item_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id),
  CONSTRAINT item_category_on_delete_null FOREIGN KEY (item_category) REFERENCES public.item_category(id)
);

-- 5. Sales Reports Table
CREATE TABLE public.sale_report (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  item_id bigint,
  unit_sold bigint NOT NULL DEFAULT 0,
  sale_date date DEFAULT CURRENT_DATE,
  CONSTRAINT sale_report_pkey PRIMARY KEY (id),
  CONSTRAINT sale_report_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user(id),
  CONSTRAINT sale_report_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(id)
);
