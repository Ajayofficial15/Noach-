-- ============================================================================
-- NOACH Transport Services — Supabase / PostgreSQL Database Schema
-- Provides secure table structure, Row-Level Security (RLS) policies,
-- audit triggers, and automatic human-readable Request ID generation.
-- ============================================================================

-- 1. Create Custom Enumerations
CREATE TYPE vehicle_type_enum AS ENUM (
  'Open Truck',
  'Container Truck',
  'Mini Truck',
  'Other / Need Assistance'
);

CREATE TYPE request_status_enum AS ENUM (
  'New',
  'Contacted',
  'Quotation Sent',
  'Confirmed',
  'Completed',
  'Cancelled'
);

-- 2. Customer Vehicle Requests Table
CREATE TABLE IF NOT EXISTS vehicle_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_code VARCHAR(32) NOT NULL UNIQUE, -- e.g., 'NOACH-2026-92817'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  
  -- Customer Information
  customer_name VARCHAR(128) NOT NULL,
  mobile_number VARCHAR(32) NOT NULL,
  company_name VARCHAR(160),
  
  -- Route Details
  pickup_location TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  
  -- Vehicle & Scheduling
  vehicle_type vehicle_type_enum NOT NULL,
  transport_date DATE NOT NULL,
  
  -- Cargo Specifications
  goods_type VARCHAR(160),
  load_weight VARCHAR(100),
  additional_requirements TEXT,
  
  -- Operational Status
  status request_status_enum NOT NULL DEFAULT 'New'
);

-- 3. Staff Internal Notes & Audit Trail Table
CREATE TABLE IF NOT EXISTS request_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES vehicle_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  author VARCHAR(100) NOT NULL DEFAULT 'Operations Staff',
  note TEXT NOT NULL
);

-- 4. Function: Generate Unique Sequential Human-Readable Request ID
CREATE OR REPLACE FUNCTION generate_noach_request_code()
RETURNS TRIGGER AS $$
DECLARE
  current_yr TEXT;
  rand_num INT;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.request_code IS NULL OR NEW.request_code = '' THEN
    current_yr := TO_CHAR(NOW(), 'YYYY');
    LOOP
      rand_num := FLOOR(10000 + RANDOM() * 90000)::INT;
      new_code := 'NOACH-' || current_yr || '-' || rand_num;
      SELECT EXISTS (SELECT 1 FROM vehicle_requests WHERE request_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.request_code := new_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate request_code prior to insertion
CREATE TRIGGER trg_set_noach_request_code
BEFORE INSERT ON vehicle_requests
FOR EACH ROW
EXECUTE FUNCTION generate_noach_request_code();

-- Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_vehicle_requests_updated_at
BEFORE UPDATE ON vehicle_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Row-Level Security (RLS) Configuration
-- Safeguards customer contact information from public exposure.
-- ============================================================================

ALTER TABLE vehicle_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_notes ENABLE ROW LEVEL SECURITY;

-- Rule 1: Anyone (anonymous website visitors) can INSERT a vehicle request.
CREATE POLICY "Public visitors can submit vehicle requests"
ON vehicle_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Rule 2: Only Authenticated Staff can VIEW customer vehicle requests.
CREATE POLICY "Only authenticated staff can view requests"
ON vehicle_requests
FOR SELECT
TO authenticated
USING (true);

-- Rule 3: Only Authenticated Staff can UPDATE request status.
CREATE POLICY "Only authenticated staff can update request status"
ON vehicle_requests
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Rule 4: Notes policies (Staff only)
CREATE POLICY "Only authenticated staff can view notes"
ON request_notes
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only authenticated staff can add notes"
ON request_notes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 6. Initial Seed Data
INSERT INTO vehicle_requests (
  request_code, customer_name, mobile_number, company_name,
  pickup_location, delivery_location, vehicle_type, transport_date,
  goods_type, load_weight, additional_requirements, status
) VALUES 
(
  'NOACH-2026-88412', 'Rajesh Sharma', '+91 98201 44520', 'Sharma Agro Logistics',
  'Bhiwandi Central Warehouse Sector 4, Mumbai', 'Kalyan Wholesale APMC Market Yard',
  'Open Truck', '2026-10-28', 'Agricultural Produce (Onions & Potatoes)', '8.5 Metric Tons',
  'Requires waterproof tarpaulin cover and early morning unloading dock access.', 'New'
),
(
  'NOACH-2026-88390', 'Vikram Malhotra', '+91 97110 33819', 'Apex Retail Distribution Ltd',
  'Taloja MIDC Industrial Hub, Navi Mumbai', 'Pune Bhosari Distribution Center',
  'Container Truck', '2026-10-29', 'FMCG Packaged Goods & Consumer Electronics', '14 Tons (18 Pallets)',
  'GPS-locked closed container required. Hydraulic tailgate preferred.', 'Contacted'
);
