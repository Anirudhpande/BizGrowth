const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL must be defined');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = pool;
  try {
    console.log('Truncating tables...');
    await client.query(`
      TRUNCATE public.messages, public.conversations, public.event_reviews, public.event_registrations, public.events, public.reviews, public.bookings, public.payments, public.services, public.portfolio_items, public.consultant_profiles, public.consultant_categories, public.categories, public.availability_slots, public.availability, public.listings, public.global_trade_listings, public.india_trade_listings, public.product_listings, public.organizations, public.profiles, public.users CASCADE;
    `);

    console.log('Inserting categories...');
    const catNames = ['Technology', 'Manufacturing', 'Finance', 'Logistics', 'Healthcare', 'Consulting', 'Energy', 'Retail'];
    const catIds = [];
    for (const name of catNames) {
      const res = await client.query(
        `INSERT INTO public.categories (name, description) VALUES ($1, $2) RETURNING id`,
        [name, `Explore the top businesses and experts in the ${name} field.`]
      );
      catIds.push(res.rows[0].id);
    }

    console.log('Inserting users and profiles...');
    const pwdHash = '$2a$10$tM/6wT88z2QpL7N.6JbBWeY7/eP9g75Oq8t/U5fEwP5p8a2R8PjOm';
    const userIds = [];
    const consultantIds = [];
    const clientIds = [];
    const adminIds = [];

    // Seed 15 Consultants, 25 Clients, 10 Admins
    for (let i = 1; i <= 50; i++) {
      let role = 'client';
      if (i <= 15) role = 'consultant';
      else if (i > 40) role = 'admin';

      const email = `${role}${i}@bizgrowth.com`;
      const firstName = role.charAt(0).toUpperCase() + role.slice(1);
      const lastName = `User ${i}`;
      
      // 1. Insert into public.users (Auth table)
      const res = await client.query(
        `INSERT INTO public.users (email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [email, pwdHash, firstName, lastName, role]
      );
      const uid = res.rows[0].id;
      userIds.push(uid);

      if (role === 'consultant') consultantIds.push(uid);
      else if (role === 'client') clientIds.push(uid);
      else adminIds.push(uid);

      // 2. Insert into public.profiles (Profile details table with enum casting)
      await client.query(
        `INSERT INTO public.profiles (auth_user_id, email, first_name, last_name, role, status, phone, company_name, bio)
         VALUES ($1, $2, $3, $4, $5::user_role, 'active'::user_status, $6, $7, $8)`,
        [
          uid,
          email,
          firstName,
          lastName,
          role,
          `+919999999${10 + i}`,
          `Acme Partner Corp ${i}`,
          `Bio details for business stakeholder number ${i}. Experienced B2B player.`
        ]
      );
    }

    console.log('Inserting organizations...');
    const orgIds = [];
    for (let i = 0; i < 20; i++) {
      const ownerId = userIds[i];
      const name = `B2B Enterprise Ltd ${i}`;
      const res = await client.query(
        `INSERT INTO public.organizations (name, industry, description, website, user_id)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          name,
          i % 2 === 0 ? 'Manufacturing' : 'Technology',
          `Leading provider of custom industrial business solutions in category ${i}.`,
          `https://enterprise${i}.bizgrowth.com`,
          ownerId
        ]
      );
      orgIds.push(res.rows[0].id);
    }

    console.log('Inserting marketplace listings...');
    const listingTypes = ['sell', 'buy', 'partner', 'supplier', 'investor'];
    const listingIds = [];
    for (let i = 0; i < 45; i++) {
      const ownerId = clientIds[i % clientIds.length];
      const type = listingTypes[i % listingTypes.length];
      const title = `B2B Listing for ${type.toUpperCase()} - Requirement ${i}`;
      const res = await client.query(
        `INSERT INTO public.listings (title, description, type, industry, budget, currency, location, status, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8) RETURNING id`,
        [
          title,
          `Detailed description of our B2B marketplace listing request for ${type}. We require certified quality deliverables and strategic partnerships.`,
          type,
          i % 2 === 0 ? 'Manufacturing' : 'Technology',
          10000 + (i * 5000),
          i % 3 === 0 ? 'USD' : 'INR',
          'Mumbai, India',
          ownerId
        ]
      );
      listingIds.push(res.rows[0].id);
    }

    console.log('Inserting consultant profiles & availability...');
    const consultantProfileIds = [];
    for (let i = 0; i < consultantIds.length; i++) {
      const cId = consultantIds[i];
      const res = await client.query(
        `INSERT INTO public.consultant_profiles (user_id, tagline, expertise, hourly_rate, avg_rating, is_verified)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [
          cId,
          'Expert consultant specializing in enterprise scaling and financial optimization.',
          ['Strategy', 'Finance', 'Tech Adoption', 'Logistics'],
          1000 + (i * 200),
          4.5
        ]
      );
      const cpId = res.rows[0].id;
      consultantProfileIds.push(cpId);

      // Link consultant to category
      await client.query(
        `INSERT INTO public.consultant_categories (consultant_id, category_id) VALUES ($1, $2)`,
        [cId, catIds[i % catIds.length]]
      );

      // Create consultant availability
      const availRes = await client.query(
        `INSERT INTO public.availability (consultant_id, timezone, max_consultations_per_day)
         VALUES ($1, 'Asia/Kolkata', 4) RETURNING id`,
        [cId]
      );
      const availId = availRes.rows[0].id;

      // Add availability slots for Mon-Fri (1=Monday to 5=Friday)
      for (let d = 1; d <= 5; d++) {
        await client.query(
          `INSERT INTO public.availability_slots (availability_id, day_of_week, start_time, end_time)
           VALUES ($1, $2, '09:00:00', '13:00:00'), ($1, $2, '14:00:00', '17:00:00')`,
          [availId, d]
        );
      }

      // Add portfolio items
      await client.query(
        `INSERT INTO public.portfolio_items (consultant_id, title, description, project_url)
         VALUES ($1, $2, $3, $4)`,
        [
          cpId,
          `Enterprise Transformation Program ${i}`,
          `Successfully streamlined B2B supply chains and cut operational latency by 30%.`,
          `https://portfolio.consultant${i}.com`
        ]
      );
    }

    console.log('Inserting bookings, reviews & payments...');
    for (let i = 0; i < 30; i++) {
      const clientId = clientIds[i % clientIds.length];
      const consultantId = consultantIds[i % consultantIds.length];
      const date = new Date();
      date.setDate(date.getDate() + (i % 5) + 1);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = i % 2 === 0 ? '10:00:00' : '15:00:00';
      const scheduledAt = `${dateStr} ${timeStr}`;

      const status = i % 4 === 0 ? 'completed' : i % 4 === 1 ? 'confirmed' : i % 4 === 2 ? 'pending' : 'cancelled';

      const bookRes = await client.query(
        `INSERT INTO public.bookings (client_id, consultant_id, scheduled_at, status, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          clientId,
          consultantId,
          scheduledAt,
          status,
          `Consultation session notes for topic #${i}`
        ]
      );
      const bookingId = bookRes.rows[0].id;

      // If completed, add review
      if (status === 'completed') {
        await client.query(
          `INSERT INTO public.reviews (booking_id, client_id, consultant_id, rating, title, comment)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [bookingId, clientId, consultantId, (i % 2 === 0 ? 5 : 4), 'Excellent Consultation', `Excellent business guidance! The consultant was extremely knowledgeable.`]
        );
      }

      // Add payment
      await client.query(
        `INSERT INTO public.payments (booking_id, consultant_id, client_id, amount, currency, status, razorpay_order_id, razorpay_payment_id)
         VALUES ($1, $2, $3, $4, 'INR', 'completed', $5, $6)`,
        [
          bookingId,
          consultantId,
          clientId,
          1500,
          `order_${Math.random().toString(36).substring(7)}`,
          `pay_${Math.random().toString(36).substring(7)}`
        ]
      );
    }

    console.log('Inserting events & registrations...');
    for (let i = 1; i <= 10; i++) {
      const organizerId = adminIds[i % adminIds.length];
      const eventDate = new Date();
      if (i <= 5) eventDate.setDate(eventDate.getDate() - (i + 1)); // past events
      else eventDate.setDate(eventDate.getDate() + (i + 1)); // future events
      
      const eventType = 'conclave';
      const eventStatus = i <= 5 ? 'completed' : 'upcoming';

      const res = await client.query(
        `INSERT INTO public.events (title, description, type, status, event_date, location, capacity, registration_fee, currency, organizer_id)
         VALUES ($1, $2, $3::event_type, $4::event_status, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [
          `National MSME Conclave & Expo ${i}`,
          `Join industry leaders to discuss emerging B2B trends, policy frameworks, and strategic networking opportunities.`,
          eventType,
          eventStatus,
          eventDate.toISOString(),
          i % 2 === 0 ? 'Virtual Conclave Hall' : 'Taj Palace, New Delhi',
          100,
          i % 3 === 0 ? 0 : 250, // some free, some paid
          'INR',
          organizerId
        ]
      );
      const eventId = res.rows[0].id;

      // Register users to this event
      for (let j = 0; j < 5; j++) {
        const uId = clientIds[(i + j) % clientIds.length];
        await client.query(
          `INSERT INTO public.event_registrations (event_id, user_id, status)
           VALUES ($1, $2, 'confirmed'::registration_status) ON CONFLICT DO NOTHING`,
          [eventId, uId]
        );

        // If past event, add review
        if (i <= 5 && j < 3) {
          await client.query(
            `INSERT INTO public.event_reviews (event_id, user_id, rating, comment)
             VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING`,
            [eventId, uId, (j % 2 === 0 ? 5 : 4), `Fantastic event with great panel discussions and networking opportunities!`]
          );
        }
      }
    }

    console.log('Inserting content/articles...');
    for (let i = 1; i <= 15; i++) {
      const authorId = adminIds[i % adminIds.length];
      const contentType = i % 3 === 0 ? 'video' : i % 3 === 1 ? 'podcast' : 'article';
      const contentStatus = 'published';

      await client.query(
        `INSERT INTO public.content (title, type, status, summary, body, author_id, views)
         VALUES ($1, $2::content_type, $3::content_status, $4, $5, $6, $7)`,
        [
          `Strategic Expansion Guide for MSMEs - Part ${i}`,
          contentType,
          contentStatus,
          `An overview of strategic methods to expand business footprint locally and globally.`,
          `This detailed publication outlines core frameworks for business growth, focusing on logistics alignment, brand presence, and trade compliance.`,
          authorId,
          15 + i
        ]
      );
    }

    console.log('Inserting Global & India Trade Listings...');
    for (let i = 1; i <= 20; i++) {
      const ownerId = clientIds[i % clientIds.length];
      // Global to India
      await client.query(
        `INSERT INTO public.global_trade_listings 
          (company_name, country_of_origin, product_category, description, products, services, target_indian_markets, price_range, currency, user_id, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'USD', $9, true)`,
        [
          `Global Innovators Ltd ${i}`,
          i % 2 === 0 ? 'USA' : 'Germany',
          'Technology & Software',
          `Providing world-class technical integration and automation solutions.`,
          [`Software Suite ${i}`, 'IoT Sensors'],
          ['Consulting', 'Deployment'],
          ['Mumbai', 'Bangalore'],
          `$10k - $50k`,
          ownerId
        ]
      );

      // India to Global
      await client.query(
        `INSERT INTO public.india_trade_listings 
          (company_name, indian_state, city, product_category, description, products, services, target_global_markets, price_range, currency, user_id, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'INR', $10, true)`,
        [
          `Bharat Exports Corp ${i}`,
          i % 2 === 0 ? 'Maharashtra' : 'Karnataka',
          'Mumbai',
          'Manufacturing & Industrial',
          `Exporter of premium components, castings, and fabricated products.`,
          [`Precision Components ${i}`, 'Cast Iron parts'],
          ['Machining', 'Finishing'],
          ['USA', 'Germany', 'Japan'],
          `1 Lakh - 5 Lakhs`,
          ownerId
        ]
      );
    }

    console.log('Inserting product listings...');
    for (let i = 1; i <= 30; i++) {
      const ownerId = clientIds[i % clientIds.length];
      const targetMarket = i % 3 === 0 ? 'domestic' : i % 3 === 1 ? 'global' : 'both';
      await client.query(
        `INSERT INTO public.product_listings
          (name, description, price, currency, category, target_market, image_url, stock, status, user_id, views)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10)`,
        [
          `Enterprise Product Model ${i}`,
          `High-quality industrial offering designed for B2B procurement operations. Meets ISO standards.`,
          5000 + (i * 1000),
          i % 2 === 0 ? 'INR' : 'USD',
          i % 2 === 0 ? 'Electronics & Gadgets' : 'Industrial & Machinery',
          targetMarket,
          `https://picsum.photos/400/300?random=${i}`,
          10 + i,
          ownerId,
          5 + i
        ]
      );
    }

    console.log('Inserting chat messages...');
    for (let i = 0; i < 25; i++) {
      const p1 = clientIds[i % clientIds.length];
      const p2 = consultantIds[i % consultantIds.length];

      // Create conversation
      const convRes = await client.query(
        `INSERT INTO public.conversations (participant_one, participant_two)
         VALUES ($1, $2) ON CONFLICT (participant_one, participant_two) DO UPDATE SET created_at = NOW() RETURNING id`,
        [p1 < p2 ? p1 : p2, p1 < p2 ? p2 : p1]
      );
      const convId = convRes.rows[0].id;

      // Add messages
      await client.query(
        `INSERT INTO public.messages (conversation_id, sender_id, text_content, is_read)
         VALUES ($1, $2, 'Hello, I would like to negotiate the terms of our business listing partnership.', true),
                ($1, $3, 'Hello! I am happy to help. Let me review your organization details.', false)`,
        [convId, p1, p2]
      );
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    pool.end();
  }
}

seed();
