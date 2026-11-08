--
-- PostgreSQL database dump
--

\restrict e8GJp4up9obY4DnExNlCKlB8gTZJr7OwAydKwEtsbuRCoZPrh0jCCld1fh0eMcx

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admins (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: admins_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admins_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admins_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admins_id_seq OWNED BY public.admins.id;


--
-- Name: communes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.communes (
    id integer NOT NULL,
    wilaya_id integer NOT NULL,
    name character varying(150) NOT NULL
);


--
-- Name: communes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.communes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: communes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.communes_id_seq OWNED BY public.communes.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    full_name character varying(150) NOT NULL,
    phone character varying(20) NOT NULL,
    wilaya_id integer NOT NULL,
    commune_id integer NOT NULL,
    model_image text NOT NULL,
    chest numeric(6,2) NOT NULL,
    hips numeric(6,2) NOT NULL,
    sleeve_length numeric(6,2) NOT NULL,
    garment_length numeric(6,2) NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_chest_check CHECK ((chest > (0)::numeric)),
    CONSTRAINT orders_garment_length_check CHECK ((garment_length > (0)::numeric)),
    CONSTRAINT orders_hips_check CHECK ((hips > (0)::numeric)),
    CONSTRAINT orders_sleeve_length_check CHECK ((sleeve_length > (0)::numeric)),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'contacted'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'cancelled'::character varying])::text[])))
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: wilayas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wilayas (
    id integer NOT NULL,
    code character varying(3),
    name character varying(100) NOT NULL
);


--
-- Name: wilayas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.wilayas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: wilayas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.wilayas_id_seq OWNED BY public.wilayas.id;


--
-- Name: admins id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins ALTER COLUMN id SET DEFAULT nextval('public.admins_id_seq'::regclass);


--
-- Name: communes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes ALTER COLUMN id SET DEFAULT nextval('public.communes_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: wilayas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wilayas ALTER COLUMN id SET DEFAULT nextval('public.wilayas_id_seq'::regclass);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: communes communes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: communes unique_commune_id_wilaya; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT unique_commune_id_wilaya UNIQUE (id, wilaya_id);


--
-- Name: communes unique_commune_per_wilaya; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT unique_commune_per_wilaya UNIQUE (wilaya_id, name);


--
-- Name: wilayas wilayas_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wilayas
    ADD CONSTRAINT wilayas_code_key UNIQUE (code);


--
-- Name: wilayas wilayas_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wilayas
    ADD CONSTRAINT wilayas_name_key UNIQUE (name);


--
-- Name: wilayas wilayas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wilayas
    ADD CONSTRAINT wilayas_pkey PRIMARY KEY (id);


--
-- Name: idx_communes_wilaya; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_communes_wilaya ON public.communes USING btree (wilaya_id);


--
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- Name: idx_orders_phone; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_phone ON public.orders USING btree (phone);


--
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_orders_status ON public.orders USING btree (status);


--
-- Name: communes fk_commune_wilaya; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT fk_commune_wilaya FOREIGN KEY (wilaya_id) REFERENCES public.wilayas(id) ON DELETE RESTRICT;


--
-- Name: orders fk_order_commune_wilaya; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_commune_wilaya FOREIGN KEY (commune_id, wilaya_id) REFERENCES public.communes(id, wilaya_id) ON DELETE RESTRICT;


--
-- Name: orders fk_order_wilaya; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk_order_wilaya FOREIGN KEY (wilaya_id) REFERENCES public.wilayas(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict e8GJp4up9obY4DnExNlCKlB8gTZJr7OwAydKwEtsbuRCoZPrh0jCCld1fh0eMcx

