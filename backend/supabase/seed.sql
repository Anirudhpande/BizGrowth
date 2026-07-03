-- Seeding script for BizGrowth Platform
-- This script generates rich test data to cover all modules and functionalities

-- Clear existing test data safely
TRUNCATE TABLE bookings, availability_slots, availability, consultant_profiles, product_listings, global_trade_listings, india_trade_listings, listings, organizations, profiles, users CASCADE;

-- 1. Seed Users (passwords are mock hashes, e.g. bcrypt for 'password123')
INSERT INTO public.users (id, email, password_hash, role, status) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'admin', 'active'),
('20000000-0000-0000-0000-000000000002', 'consultant.sharma@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'consultant', 'active'),
('30000000-0000-0000-0000-000000000003', 'consultant.patel@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'consultant', 'active'),
('40000000-0000-0000-0000-000000000004', 'client.kapoor@gmail.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'client', 'active'),
('50000000-0000-0000-0000-000000000005', 'client.singh@yahoo.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'client', 'active');

-- 2. Seed Profiles
INSERT INTO public.profiles (auth_user_id, email, first_name, last_name, company_name, phone, role, status) VALUES
('10000000-0000-0000-0000-000000000001', 'admin@bizgrowth.com', 'Admin', 'Supervisor', 'BizGrowth Inc.', '+919999999901', 'admin', 'active'),
('20000000-0000-0000-0000-000000000002', 'consultant.sharma@bizgrowth.com', 'Dr. Rajesh', 'Sharma', 'Sharma Financial Advisors', '+919999999902', 'consultant', 'active'),
('30000000-0000-0000-0000-000000000003', 'consultant.patel@bizgrowth.com', 'Priya', 'Patel', 'Patel Logistics Solutions', '+919999999903', 'consultant', 'active'),
('40000000-0000-0000-0000-000000000004', 'client.kapoor@gmail.com', 'Amit', 'Kapoor', 'Kapoor Textiles', '+919999999904', 'client', 'active'),
('50000000-0000-0000-0000-000000000005', 'client.singh@yahoo.com', 'Sandeep', 'Singh', 'Singh Organic Farms', '+919999999905', 'client', 'active');

-- 3. Seed B2B Organizations
INSERT INTO public.organizations (id, user_id, name, description, industry, city, country, website) VALUES
('11000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'Kapoor Textiles Ltd.', 'Premium cotton fabrics exporter based in Surat, Gujarat.', 'Textiles & Apparel', 'Surat', 'India', 'https://kapoortextiles.co.in'),
('22000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000005', 'Singh Organic Farms', 'Organic farming producer specializing in high-quality basmati rice.', 'Agriculture', 'Amritsar', 'India', 'https://singhorganics.com'),
('33000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'Patel Logistics Solutions', 'End-to-end global supply chain and cargo management provider.', 'Logistics', 'Mumbai', 'India', 'https://patellogistics.com');

-- 4. Seed Marketplace Opportunities (Buy, Sell, Partner, Barter)
INSERT INTO public.listings (id, user_id, title, description, type, status, tags, views) VALUES
('11100000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'Surplus Cotton Thread Inventory', 'We have 500kg of high-grade organic cotton thread looking to barter for solar panel installations or warehouse storage space.', 'partner', 'active', ARRAY['cotton', 'barter', 'materials'], 42),
('22200000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000005', 'Basmati Rice Distribution Partners Needed', 'Seeking export distribution partners in Germany and UK for organic rice products.', 'partner', 'active', ARRAY['rice', 'export', 'distributor'], 85),
('33300000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000004', 'Required: Bio-degradable Packaging Boxes', 'We wish to purchase 10,000 units of custom-printed eco-friendly packaging boxes.', 'buy', 'active', ARRAY['packaging', 'eco-friendly'], 18);

-- 5. Seed Consultant Profiles
INSERT INTO public.consultant_profiles (id, user_id, tagline, expertise, hourly_rate, avg_rating) VALUES
('21000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'MSME tax optimization and export grant advisory.', ARRAY['Financial Advisory', 'Export Grants', 'Taxation'], 2500.00, 4.90),
('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'Optimizing import-customs clearance and cargo rates.', ARRAY['Customs Clearances', 'Supply Chain', 'Logistics Optimization'], 1800.00, 4.80);

-- 6. Seed Consultant Availability
INSERT INTO public.availability (id, consultant_id, timezone, max_consultations_per_day) VALUES
('22100000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'Asia/Kolkata', 5),
('32100000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', 'Asia/Kolkata', 8);

-- 7. Seed Availability Slots (Monday=1, Tuesday=2, Wednesday=3, etc. ID auto-generated)
INSERT INTO public.availability_slots (availability_id, day_of_week, start_time, end_time, is_available) VALUES
('22100000-0000-0000-0000-000000000001', 1, '10:00:00', '12:00:00', true),
('22100000-0000-0000-0000-000000000001', 1, '14:00:00', '16:00:00', true),
('22100000-0000-0000-0000-000000000001', 3, '10:00:00', '12:00:00', true),
('32100000-0000-0000-0000-000000000002', 2, '09:00:00', '12:00:00', true),
('32100000-0000-0000-0000-000000000002', 4, '14:00:00', '17:00:00', true);

-- 8. Seed Global and India Trade Catalog Entries
INSERT INTO public.global_trade_listings (id, user_id, company_name, country_of_origin, product_category, description, contact_email, contact_phone, target_indian_markets) VALUES
('77000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Linen Master LLC', 'Belgium', 'Apparel Fabric', 'Exporting genuine Belgian flax linen fabrics. Looking to supply clothing brands in India.', 'sales@linenmaster.be', '+3229999999', ARRAY['All India']);

INSERT INTO public.india_trade_listings (id, user_id, company_name, indian_state, product_category, description, contact_email, contact_phone, target_global_markets) VALUES
('88000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'Kapoor Textiles Ltd.', 'Surat, Gujarat', 'Apparel Fabric', 'Surat-made silk fabrics exporter looking to target fashion houses in Paris and Milan.', 'exports@kapoortextiles.co.in', '+919999999904', ARRAY['Global']);

-- 9. Seed Trade Products Catalog
INSERT INTO public.product_listings (id, user_id, name, description, price, stock, category, target_market, views) VALUES
('99000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000004', 'Woven Organic Cotton Rolls', 'Pure 100% GOTS organic cotton textile rolls.', 4500.00, 150, 'Textile', 'Global', 134),
('99000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000005', 'Premium Long Grain Basmati', 'Aged 12 months for rich aroma and flavor.', 120.00, 5000, 'Agriculture', 'India', 98);

-- 10. Seed Events
INSERT INTO public.events (id, title, description, event_date, location, capacity, organizer_id) VALUES
('ee000000-0000-0000-0000-000000000001', 'Surat Textile Expo 2026', 'Networking event for textile suppliers, exporters, and clothing labels.', '2026-10-15 10:00:00+05:30', 'Exhibition Centre, Surat', 300, '10000000-0000-0000-0000-000000000001'),
('ee000000-0000-0000-0000-000000000002', 'B2B Global Trade Summit', 'Panel discussion with trade advisors and custom agents.', '2026-12-05 14:00:00+05:30', 'Virtual Zoom Event', 1000, '10000000-0000-0000-0000-000000000001');
