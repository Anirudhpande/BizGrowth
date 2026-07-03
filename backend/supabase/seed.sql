-- Seeding script for BizGrowth Platform
-- This script generates rich test data to cover all modules and functionalities

-- Clear existing test data safely
TRUNCATE TABLE bookings, availability_slots, availability, consultant_profiles, products, global_trade, india_trade, marketplace, organizations, profiles, users CASCADE;

-- 1. Seed Users (passwords are mock hashes, e.g. bcrypt for 'password123')
INSERT INTO public.users (id, email, password_hash, role, status) VALUES
('u1111111-1111-1111-1111-111111111111', 'admin@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'admin', 'active'),
('u2222222-2222-2222-2222-222222222222', 'consultant.sharma@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'consultant', 'active'),
('u3333333-3333-3333-3333-333333333333', 'consultant.patel@bizgrowth.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'consultant', 'active'),
('u4444444-4444-4444-4444-444444444444', 'client.kapoor@gmail.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'user', 'active'),
('u5555555-5555-5555-5555-555555555555', 'client.singh@yahoo.com', '$2b$10$EPfF3v66t5fK1Zk587Q3Qe7B5P0YfK7e58Yf7e28P1u2c3e4r5t6y', 'user', 'active');

-- 2. Seed Profiles
INSERT INTO public.profiles (auth_user_id, name, company_name, phone, role, status) VALUES
('u1111111-1111-1111-1111-111111111111', 'Admin Supervisor', 'BizGrowth Inc.', '+919999999901', 'admin', 'active'),
('u2222222-2222-2222-2222-222222222222', 'Dr. Rajesh Sharma', 'Sharma Financial Advisors', '+919999999902', 'consultant', 'active'),
('u3333333-3333-3333-3333-333333333333', 'Priya Patel', 'Patel Logistics Solutions', '+919999999903', 'consultant', 'active'),
('u4444444-4444-4444-4444-444444444444', 'Amit Kapoor', 'Kapoor Textiles', '+919999999904', 'user', 'active'),
('u5555555-5555-5555-5555-555555555555', 'Sandeep Singh', 'Singh Organic Farms', '+919999999905', 'user', 'active');

-- 3. Seed B2B Organizations
INSERT INTO public.organizations (id, user_id, name, description, industry, location, website) VALUES
('org11111-1111-1111-1111-111111111111', 'u4444444-4444-4444-4444-444444444444', 'Kapoor Textiles Ltd.', 'Premium cotton fabrics exporter based in Surat, Gujarat.', 'Textiles & Apparel', 'Surat, India', 'https://kapoortextiles.co.in'),
('org22222-2222-2222-2222-222222222222', 'u5555555-5555-5555-5555-555555555555', 'Singh Organic Farms', 'Organic farming producer specializing in high-quality basmati rice.', 'Agriculture', 'Amritsar, India', 'https://singhorganics.com'),
('org33333-3333-3333-3333-333333333333', 'u3333333-3333-3333-3333-333333333333', 'Patel Logistics Solutions', 'End-to-end global supply chain and cargo management provider.', 'Logistics', 'Mumbai, India', 'https://patellogistics.com');

-- 4. Seed Marketplace Opportunities (Buy, Sell, Partner, Barter)
INSERT INTO public.marketplace (id, user_id, title, description, type, status, tags, views) VALUES
('m1111111-1111-1111-1111-111111111111', 'u4444444-4444-4444-4444-444444444444', 'Surplus Cotton Thread Inventory', 'We have 500kg of high-grade organic cotton thread looking to barter for solar panel installations or warehouse storage space.', 'barter', 'active', '{"cotton", "barter", "materials"}', 42),
('m2222222-2222-2222-2222-222222222222', 'u5555555-5555-5555-5555-555555555555', 'Basmati Rice Distribution Partners Needed', 'Seeking export distribution partners in Germany and UK for organic rice products.', 'partner', 'active', '{"rice", "export", "distributor"}', 85),
('m3333333-3333-3333-3333-333333333333', 'u4444444-4444-4444-4444-444444444444', 'Required: Bio-degradable Packaging Boxes', 'We wish to purchase 10,000 units of custom-printed eco-friendly packaging boxes.', 'buy', 'active', '{"packaging", "eco-friendly"}', 18);

-- 5. Seed Consultant Profiles
INSERT INTO public.consultant_profiles (id, user_id, bio, expertise, hourly_rate, rating) VALUES
('c1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'Financial advisor with 15+ years of experience helping MSMEs optimize tax compliance and secure government export grants.', 'Financial Advisory, Export Grants, Taxation', 2500.00, 4.9),
('c2222222-2222-2222-2222-222222222222', 'u3333333-3333-3333-3333-333333333333', 'Supply chain professional specialized in optimizing import-customs clearance pathways and shipping rates.', 'Customs Clearances, Supply Chain, Logistics Optimization', 1800.00, 4.8);

-- 6. Seed Consultant Availability
INSERT INTO public.availability (id, consultant_id, timezone, max_consultations_per_day) VALUES
('a1111111-1111-1111-1111-111111111111', 'u2222222-2222-2222-2222-222222222222', 'Asia/Kolkata', 5),
('a2222222-2222-2222-2222-222222222222', 'u3333333-3333-3333-3333-333333333333', 'Asia/Kolkata', 8);

-- 7. Seed Availability Slots (Monday=1, Tuesday=2, Wednesday=3, etc.)
INSERT INTO public.availability_slots (id, availability_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 'a1111111-1111-1111-1111-111111111111', 1, '10:00:00', '12:00:00', true),
(2, 'a1111111-1111-1111-1111-111111111111', 1, '14:00:00', '16:00:00', true),
(3, 'a1111111-1111-1111-1111-111111111111', 3, '10:00:00', '12:00:00', true),
(4, 'a2222222-2222-2222-2222-222222222222', 2, '09:00:00', '12:00:00', true),
(5, 'a2222222-2222-2222-2222-222222222222', 4, '14:00:00', '17:00:00', true);

-- 8. Seed Global and India Trade Catalog Entries
INSERT INTO public.global_trade (id, user_id, company_name, country_of_origin, product_category, description, target_market, contact_info) VALUES
('gt11111-1111-1111-1111-111111111111', 'u1111111-1111-1111-1111-111111111111', 'Linen Master LLC', 'Belgium', 'Apparel Fabric', 'Exporting genuine Belgian flax linen fabrics. Looking to supply clothing brands in India.', 'India', 'sales@linenmaster.be');

INSERT INTO public.india_trade (id, user_id, company_name, indian_state, product_category, description, target_market, contact_info) VALUES
('it11111-1111-1111-1111-111111111111', 'u4444444-4444-4444-4444-444444444444', 'Kapoor Textiles Ltd.', 'Surat, Gujarat', 'Apparel Fabric', 'Surat-made silk fabrics exporter looking to target fashion houses in Paris and Milan.', 'Global', 'exports@kapoortextiles.co.in');

-- 9. Seed Trade Products Catalog
INSERT INTO public.products (id, user_id, name, description, price, stock, category, target_market, views) VALUES
('p1111111-1111-1111-1111-111111111111', 'u4444444-4444-4444-4444-444444444444', 'Woven Organic Cotton Rolls', 'Pure 100% GOTS organic cotton textile rolls.', 4500.00, 150, 'Textile', 'Global', 134),
('p2222222-2222-2222-2222-222222222222', 'u5555555-5555-5555-5555-555555555555', 'Premium Long Grain Basmati', 'Aged 12 months for rich aroma and flavor.', 120.00, 5000, 'Agriculture', 'India', 98);

-- 10. Seed Events
INSERT INTO public.events (id, title, description, date, location, registration_limit) VALUES
('e1111111-1111-1111-1111-111111111111', 'Surat Textile Expo 2026', 'Networking event for textile suppliers, exporters, and clothing labels.', '2026-10-15 10:00:00+05:30', 'Exhibition Centre, Surat', 300),
('e2222222-2222-2222-2222-222222222222', 'B2B Global Trade Summit', 'Panel discussion with trade advisors and custom agents.', '2026-12-05 14:00:00+05:30', 'Virtual Zoom Event', 1000);
