-- ============================================================
-- BOOKING WEBSITE — SUPABASE POSTGRESQL SCHEMA
-- ============================================================
-- Sections:
--   0. Extensions
--   1. Enums
--   2. Core Tables
--   3. Indexes
--   4. Row Level Security (RLS)
--   5. Helper Functions & Triggers
--   6. Notification / Edge Function Hooks
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. ENUMS
-- ============================================================

CREATE TYPE ticket_status AS ENUM (
    'pending',
    'confirmed',
    'cancelled',
    'refunded'
);

CREATE TYPE transaction_status AS ENUM (
    'pending',
    'success',
    'failed',
    'refunded'
);

CREATE TYPE notification_channel AS ENUM (
    'email',
    'sms',
    'in_app'
);

CREATE TYPE notification_status AS ENUM (
    'queued',
    'sent',
    'failed'
);

CREATE TYPE audit_action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);


-- ============================================================
-- 2. CORE TABLES
-- ============================================================

-- -----------------------------------------------------------
-- 2.1  PROFILES
--      Extends Supabase auth.users with personal details.
--      Email is pulled directly from auth.users — no duplication.
-- -----------------------------------------------------------
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name      TEXT NOT NULL,
    last_name       TEXT NOT NULL,
    contact_number  TEXT NOT NULL,                          -- e.g. +27821234567
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles                IS 'One-to-one extension of auth.users with personal details.';
COMMENT ON COLUMN public.profiles.id             IS 'Matches auth.users.id — the Supabase auth UID.';
COMMENT ON COLUMN public.profiles.contact_number IS 'International format recommended, e.g. +27821234567.';


-- -----------------------------------------------------------
-- 2.2  TICKET PLANS  (subscription / price tiers)
-- -----------------------------------------------------------
CREATE TABLE public.ticket_plans (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    name          TEXT        NOT NULL,                     -- e.g. "General Admission", "VIP"
    description   TEXT,
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    currency      CHAR(3)     NOT NULL DEFAULT 'ZAR',
    is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.ticket_plans IS 'Available ticket tiers / subscription prices.';


-- -----------------------------------------------------------
-- 2.3  TICKETS
-- -----------------------------------------------------------
CREATE TABLE public.tickets (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Owner
    user_id         UUID            NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,

    -- Plan
    plan_id         UUID            NOT NULL REFERENCES public.ticket_plans(id) ON DELETE RESTRICT,

    -- Human-readable unique code: 100001DDMMYYYY
    -- Format: 6-digit sequential number + DDMMYYYY
    unique_code     TEXT            NOT NULL UNIQUE,

    status          ticket_status   NOT NULL DEFAULT 'pending',

    booked_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    confirmed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.tickets             IS 'Each row is one purchased ticket.';
COMMENT ON COLUMN public.tickets.id          IS 'Ticket UUID — the primary reference used in URLs / QR codes.';
COMMENT ON COLUMN public.tickets.unique_code IS 'Human-readable code: 6-digit seq padded + DDMMYYYY of booking date.';


-- -----------------------------------------------------------
-- 2.4  TRANSACTIONS
-- -----------------------------------------------------------
CREATE TABLE public.transactions (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id           UUID                NOT NULL REFERENCES public.tickets(id) ON DELETE RESTRICT,
    user_id             UUID                NOT NULL REFERENCES auth.users(id)     ON DELETE RESTRICT,

    -- Payment gateway fields
    gateway             TEXT                NOT NULL,       -- e.g. 'stripe', 'payfast', 'yoco'
    gateway_reference   TEXT,                               -- Gateway's own transaction ID
    amount              NUMERIC(10,2)       NOT NULL CHECK (amount >= 0),
    currency            CHAR(3)             NOT NULL DEFAULT 'ZAR',
    status              transaction_status  NOT NULL DEFAULT 'pending',

    -- Raw gateway payload for audit / dispute resolution
    gateway_payload     JSONB,

    initiated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMPTZ,

    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.transactions                  IS 'One transaction per ticket purchase attempt.';
COMMENT ON COLUMN public.transactions.gateway_payload  IS 'Raw JSON from payment gateway — never expose to client.';


-- -----------------------------------------------------------
-- 2.5  NOTIFICATIONS
--      Records every notification dispatched (email / SMS / in-app).
--      Actual sending is handled by Supabase Edge Functions / pg_net.
-- -----------------------------------------------------------
CREATE TABLE public.notifications (
    id          UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticket_id   UUID                    REFERENCES public.tickets(id)      ON DELETE SET NULL,

    channel     notification_channel    NOT NULL,
    status      notification_status     NOT NULL DEFAULT 'queued',

    subject     TEXT,                                       -- Email subject line
    body        TEXT        NOT NULL,                       -- Message body

    sent_at     TIMESTAMPTZ,
    error       TEXT,                                       -- Error message if failed

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.notifications IS 'Log of every email / SMS / in-app notification.';


-- -----------------------------------------------------------
-- 2.6  AUDIT LOG
--      Immutable record of every change across key tables.
-- -----------------------------------------------------------
CREATE TABLE public.audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    table_name  TEXT        NOT NULL,
    record_id   TEXT        NOT NULL,           -- UUID of the affected row (cast to TEXT)
    action      audit_action NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    changed_by  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.audit_logs            IS 'Append-only audit trail. Rows must never be deleted.';
COMMENT ON COLUMN public.audit_logs.record_id  IS 'The primary key of the changed row, stored as text for flexibility.';


-- ============================================================
-- 3. INDEXES
-- ============================================================

-- Profiles
CREATE INDEX idx_profiles_contact      ON public.profiles(contact_number);

-- Tickets
CREATE INDEX idx_tickets_user          ON public.tickets(user_id);
CREATE INDEX idx_tickets_plan          ON public.tickets(plan_id);
CREATE INDEX idx_tickets_status        ON public.tickets(status);
CREATE INDEX idx_tickets_unique_code   ON public.tickets(unique_code);

-- Transactions
CREATE INDEX idx_transactions_ticket   ON public.transactions(ticket_id);
CREATE INDEX idx_transactions_user     ON public.transactions(user_id);
CREATE INDEX idx_transactions_status   ON public.transactions(status);
CREATE INDEX idx_transactions_gateway  ON public.transactions(gateway_reference);

-- Notifications
CREATE INDEX idx_notifications_user    ON public.notifications(user_id);
CREATE INDEX idx_notifications_ticket  ON public.notifications(ticket_id);
CREATE INDEX idx_notifications_status  ON public.notifications(status);

-- Audit
CREATE INDEX idx_audit_table_record    ON public.audit_logs(table_name, record_id);
CREATE INDEX idx_audit_changed_by      ON public.audit_logs(changed_by);
CREATE INDEX idx_audit_changed_at      ON public.audit_logs(changed_at DESC);


-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on every user-facing table
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_plans  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs    ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------
-- Helper: is the current user an admin?
-- Store the role in auth.users.raw_user_meta_data->>'role'
-- OR use a custom claims approach via Supabase custom claims.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT COALESCE(
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
        FALSE
    );
$$;


-- -----------------------------------------------------------
-- 4.1  PROFILES POLICIES
-- -----------------------------------------------------------
-- Users can read/write only their own profile.
CREATE POLICY "Users: own profile read"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users: own profile write"
    ON public.profiles FOR ALL
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can read all profiles.
CREATE POLICY "Admins: all profiles read"
    ON public.profiles FOR SELECT
    USING (public.is_admin());


-- -----------------------------------------------------------
-- 4.2  TICKET PLANS POLICIES
-- -----------------------------------------------------------
-- Everyone (authenticated) can view active plans.
CREATE POLICY "All users: read active plans"
    ON public.ticket_plans FOR SELECT
    USING (is_active = TRUE);

-- Admins can manage plans.
CREATE POLICY "Admins: manage plans"
    ON public.ticket_plans FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- -----------------------------------------------------------
-- 4.3  TICKETS POLICIES
-- -----------------------------------------------------------
CREATE POLICY "Users: own tickets read"
    ON public.tickets FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users: create ticket"
    ON public.tickets FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users cannot update or delete their own tickets directly;
-- all status changes go through server-side functions.

CREATE POLICY "Admins: all tickets"
    ON public.tickets FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- -----------------------------------------------------------
-- 4.4  TRANSACTIONS POLICIES
-- -----------------------------------------------------------
CREATE POLICY "Users: own transactions read"
    ON public.transactions FOR SELECT
    USING (user_id = auth.uid());

-- Only server-side (service_role) can insert/update transactions.
CREATE POLICY "Admins: all transactions"
    ON public.transactions FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- -----------------------------------------------------------
-- 4.5  NOTIFICATIONS POLICIES
-- -----------------------------------------------------------
CREATE POLICY "Users: own notifications"
    ON public.notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins: all notifications"
    ON public.notifications FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());


-- -----------------------------------------------------------
-- 4.6  AUDIT LOG POLICIES
-- -----------------------------------------------------------
-- Regular users cannot see audit logs.
CREATE POLICY "Admins: read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

-- Nobody can UPDATE or DELETE audit rows (append-only enforced by trigger).


-- ============================================================
-- 5. HELPER FUNCTIONS & TRIGGERS
-- ============================================================

-- -----------------------------------------------------------
-- 5.1  Auto-update updated_at
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ticket_plans_updated_at
    BEFORE UPDATE ON public.ticket_plans
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- -----------------------------------------------------------
-- 5.2  Auto-create profile row on auth.users INSERT
--      (fires after Supabase Auth registers the user)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, contact_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name',  ''),
        COALESCE(NEW.raw_user_meta_data->>'contact_number', '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- -----------------------------------------------------------
-- 5.3  Unique code generator  →  100001DDMMYYYY
--      Generates the next sequential 6-digit prefix + booking date.
-- -----------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.ticket_code_seq
    START WITH 100001
    INCREMENT BY 1
    NO MAXVALUE
    CACHE 1;

CREATE OR REPLACE FUNCTION public.generate_unique_code(booking_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
    seq_num     BIGINT;
    date_part   TEXT;
BEGIN
    seq_num   := NEXTVAL('public.ticket_code_seq');
    date_part := TO_CHAR(booking_date, 'DDMMYYYY');
    RETURN LPAD(seq_num::TEXT, 6, '0') || date_part;
END;
$$;

-- Trigger: populate unique_code before INSERT
CREATE OR REPLACE FUNCTION public.set_ticket_unique_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.unique_code IS NULL OR NEW.unique_code = '' THEN
        NEW.unique_code := public.generate_unique_code(CURRENT_DATE);
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_ticket_unique_code
    BEFORE INSERT ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_ticket_unique_code();


-- -----------------------------------------------------------
-- 5.4  Generic audit trigger (attach to each audited table)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', TO_JSONB(NEW), auth.uid());

    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', TO_JSONB(OLD), TO_JSONB(NEW), auth.uid());

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_logs (table_name, record_id, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', TO_JSONB(OLD), auth.uid());
    END IF;

    RETURN NULL;   -- AFTER trigger; return value ignored
END;
$$;

-- Attach audit trigger to key tables
CREATE TRIGGER trg_audit_profiles
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER trg_audit_tickets
    AFTER INSERT OR UPDATE OR DELETE ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER trg_audit_transactions
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER trg_audit_ticket_plans
    AFTER INSERT OR UPDATE OR DELETE ON public.ticket_plans
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();


-- -----------------------------------------------------------
-- 5.5  Queue notification on ticket confirmation
--      When a ticket's status flips to 'confirmed', insert
--      notification rows for email + sms.  The Edge Function
--      polls the notifications table and dispatches them.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION public.queue_booking_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_email     TEXT;
    v_name      TEXT;
    v_code      TEXT := NEW.unique_code;
BEGIN
    -- Only fire when status changes TO confirmed
    IF (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status = 'confirmed' THEN

        -- Fetch user email & name
        SELECT u.email,
               p.first_name || ' ' || p.last_name
        INTO   v_email, v_name
        FROM   auth.users u
        JOIN   public.profiles p ON p.id = u.id
        WHERE  u.id = NEW.user_id;

        -- Email notification
        INSERT INTO public.notifications (user_id, ticket_id, channel, subject, body)
        VALUES (
            NEW.user_id,
            NEW.id,
            'email',
            'Your booking is confirmed! 🎉',
            FORMAT(
                'Hi %s,%sYour ticket has been confirmed.%sTicket Code : %s%sTicket UUID : %s%sThank you for booking with us!',
                v_name, E'\n\n', E'\n',
                v_code,  E'\n',
                NEW.id,  E'\n\n'
            )
        );

        -- In-app notification
        INSERT INTO public.notifications (user_id, ticket_id, channel, subject, body)
        VALUES (
            NEW.user_id,
            NEW.id,
            'in_app',
            'Booking Confirmed',
            FORMAT('Your ticket (%s) has been confirmed.', v_code)
        );

    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_notifications
    AFTER UPDATE OF status ON public.tickets
    FOR EACH ROW EXECUTE FUNCTION public.queue_booking_notifications();


-- ============================================================
-- 6. CONVENIENCE VIEW FOR ADMINS
-- ============================================================

CREATE OR REPLACE VIEW public.admin_booking_view AS
SELECT
    t.id                AS ticket_uuid,
    t.unique_code,
    t.status            AS ticket_status,
    t.booked_at,
    t.confirmed_at,

    -- User details
    u.email,
    p.first_name,
    p.last_name,
    p.contact_number,

    -- Plan details
    tp.name             AS plan_name,
    tp.price,
    tp.currency,

    -- Latest transaction
    tx.gateway,
    tx.gateway_reference,
    tx.amount           AS paid_amount,
    tx.status           AS payment_status,
    tx.completed_at     AS payment_completed_at

FROM   public.tickets        t
JOIN   auth.users            u  ON u.id  = t.user_id
JOIN   public.profiles       p  ON p.id  = t.user_id
JOIN   public.ticket_plans   tp ON tp.id = t.plan_id
LEFT JOIN LATERAL (
    SELECT * FROM public.transactions
    WHERE  ticket_id = t.id
    ORDER  BY created_at DESC
    LIMIT  1
) tx ON TRUE;

-- Restrict view to admins only
ALTER VIEW public.admin_booking_view OWNER TO postgres;

COMMENT ON VIEW public.admin_booking_view IS
    'Admin-only view joining tickets, users, profiles, plans and latest transaction.';


-- ============================================================
-- END OF SCHEMA
-- ============================================================