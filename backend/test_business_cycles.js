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

const results = [];
const bugs = [];

function logTest(name, passed, details = '', errorObj = null) {
  results.push({ name, passed, details });
  if (!passed) {
    bugs.push({ testName: name, details, error: errorObj ? errorObj.message || errorObj : 'Unknown error' });
    console.error(`❌ TEST FAILED: ${name} - ${details}`);
    if (errorObj) console.error(errorObj);
  } else {
    console.log(`✅ TEST PASSED: ${name} ${details ? `(${details})` : ''}`);
  }
}

async function runTests() {
  const client = await pool.connect();
  console.log('🚀 Starting Functional Business Cycle Tests...');

  try {
    // -------------------------------------------------------------
    // Cycle 1: Auth & Profile Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 1: Auth & Profile Cycle ---');
    try {
      // 1.1 Duplicate user constraint check
      await client.query(
        `INSERT INTO public.users (email, password_hash, first_name, last_name, role)
         VALUES ('client16@bizgrowth.com', 'pwd_hash', 'Dup', 'User', 'client')`
      );
      logTest('Duplicate Email Validation', false, 'Successfully inserted duplicate email when it should fail constraints.');
    } catch (err) {
      if (err.code === '23505') { // Unique violation
        logTest('Duplicate Email Validation', true, 'Duplicate email correctly failed with unique constraint.');
      } else {
        logTest('Duplicate Email Validation', false, 'Duplicate email failed with unexpected error code: ' + err.code, err);
      }
    }

    let testUser = null;
    try {
      // 1.2 Read profile details
      const userRes = await client.query(`SELECT * FROM public.users WHERE email = 'consultant1@bizgrowth.com' LIMIT 1`);
      if (userRes.rows.length > 0) {
        testUser = userRes.rows[0];
        const profileRes = await client.query(`SELECT * FROM public.profiles WHERE auth_user_id = $1 LIMIT 1`, [testUser.id]);
        if (profileRes.rows.length > 0) {
          logTest('Read Profile Details', true, `Found user and profile details for: ${profileRes.rows[0].first_name} ${profileRes.rows[0].last_name}`);
        } else {
          logTest('Read Profile Details', false, 'Found user but corresponding profile details record was missing.');
        }
      } else {
        logTest('Read Profile Details', false, 'Seeded user consultant1@bizgrowth.com not found.');
      }
    } catch (err) {
      logTest('Read Profile Details', false, 'Failed to read profile details', err);
    }

    // -------------------------------------------------------------
    // Cycle 2: Marketplace Deal Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 2: Marketplace Deal Cycle ---');
    let testListingId = null;
    try {
      // 2.1 Create Listing
      const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
      if (clientRes.rows.length > 0) {
        const clientId = clientRes.rows[0].id;
        const res = await client.query(
          `INSERT INTO public.listings (title, description, type, industry, budget, currency, location, status, user_id)
           VALUES ('Test Partnership Deal', 'B2B collaboration test', 'partner', 'Manufacturing', 50000, 'INR', 'Delhi', 'active', $1)
           RETURNING id`,
          [clientId]
        );
        testListingId = res.rows[0].id;
        logTest('Create Marketplace Listing', true, `Listing created with ID: ${testListingId}`);
      } else {
        logTest('Create Marketplace Listing', false, 'No client user found to create listing.');
      }
    } catch (err) {
      logTest('Create Marketplace Listing', false, 'Failed to create marketplace listing', err);
    }

    try {
      // 2.2 Search Listing
      if (testListingId) {
        const res = await client.query(`SELECT * FROM public.listings WHERE title ILIKE '%Test Partnership Deal%'`);
        if (res.rows.length > 0) {
          logTest('Search Marketplace Listings', true, `Successfully discovered deal in listings search.`);
        } else {
          logTest('Search Marketplace Listings', false, 'Created deal listing was not found in database search.');
        }
      } else {
        logTest('Search Marketplace Listings', false, 'Skipped search listing test due to creation failure.');
      }
    } catch (err) {
      logTest('Search Marketplace Listings', false, 'Failed to search listings', err);
    }

    // -------------------------------------------------------------
    // Cycle 3: Consulting Engagement Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 3: Consulting Engagement Cycle ---');
    let testBookingId = null;
    try {
      // 3.1 Fetch consultant availability slots
      const consultantRes = await client.query(`SELECT id FROM public.users WHERE role = 'consultant' LIMIT 1`);
      if (consultantRes.rows.length > 0) {
        const consultantId = consultantRes.rows[0].id;
        const slotsRes = await client.query(
          `SELECT s.* FROM public.availability_slots s
           JOIN public.availability a ON s.availability_id = a.id
           WHERE a.consultant_id = $1 LIMIT 1`,
          [consultantId]
        );
        if (slotsRes.rows.length > 0) {
          logTest('Retrieve Consultant Availability', true, `Successfully retrieved availability slots.`);
        } else {
          logTest('Retrieve Consultant Availability', false, 'No availability slots found for consultant.');
        }

        // 3.2 Book a consultation session
        const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
        if (clientRes.rows.length > 0) {
          const clientId = clientRes.rows[0].id;
          const bookRes = await client.query(
            `INSERT INTO public.bookings (client_id, consultant_id, scheduled_at, status, notes)
             VALUES ($1, $2, NOW() + INTERVAL '1 day', 'pending', 'Need urgent financial strategy consultation.')
             RETURNING id`,
            [clientId, consultantId]
          );
          testBookingId = bookRes.rows[0].id;
          logTest('Book Consultation Session', true, `Booking created with ID: ${testBookingId}`);

          // 3.3 Process Booking Payment
          const payRes = await client.query(
            `INSERT INTO public.payments (booking_id, consultant_id, client_id, amount, currency, status, razorpay_order_id, razorpay_payment_id)
             VALUES ($1, $2, $3, 2000, 'INR', 'completed', $4, $5)
             RETURNING id`,
            [testBookingId, consultantId, clientId, `order_test_${Math.random().toString(36).substring(7)}`, `pay_test_${Math.random().toString(36).substring(7)}`]
          );
          logTest('Process Booking Payment', true, `Payment processed with ID: ${payRes.rows[0].id}`);
        } else {
          logTest('Book Consultation Session', false, 'No client found to book session.');
        }
      } else {
        logTest('Retrieve Consultant Availability', false, 'No consultant found to test booking.');
      }
    } catch (err) {
      logTest('Consulting Engagement Cycle', false, 'Failed during consulting cycle execution', err);
    }

    // -------------------------------------------------------------
    // Cycle 4: Events & Knowledge Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 4: Events & Knowledge Cycle ---');
    let testEventId = null;
    try {
      // 4.1 Admin creates event
      const adminRes = await client.query(`SELECT id FROM public.users WHERE role = 'admin' LIMIT 1`);
      if (adminRes.rows.length > 0) {
        const adminId = adminRes.rows[0].id;
        const res = await client.query(
          `INSERT INTO public.events (title, description, type, status, event_date, location, capacity, registration_fee, organizer_id)
           VALUES ('Global Trade Seminar', 'B2B Trade Conclave', 'conclave'::event_type, 'upcoming'::event_status, NOW() + INTERVAL '5 days', 'Virtual', 100, 0, $1)
           RETURNING id`,
          [adminId]
        );
        testEventId = res.rows[0].id;
        logTest('Admin Create Event', true, `Event created with ID: ${testEventId}`);
      } else {
        logTest('Admin Create Event', false, 'No admin found to create event.');
      }
    } catch (err) {
      logTest('Admin Create Event', false, 'Failed to create event', err);
    }

    try {
      // 4.2 Client registers for event
      if (testEventId) {
        const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
        if (clientRes.rows.length > 0) {
          const clientId = clientRes.rows[0].id;
          await client.query(
            `INSERT INTO public.event_registrations (event_id, user_id, status)
             VALUES ($1, $2, 'confirmed'::registration_status)`,
            [testEventId, clientId]
          );
          logTest('Register for Event', true, `Client successfully registered for event.`);
        } else {
          logTest('Register for Event', false, 'No client found to register for event.');
        }
      } else {
        logTest('Register for Event', false, 'Skipped registration test due to event creation failure.');
      }
    } catch (err) {
      logTest('Register for Event', false, 'Failed to register for event', err);
    }

    // -------------------------------------------------------------
    // Cycle 5: International Trade Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 5: International Trade Cycle ---');
    try {
      // 5.1 Insert & Filter Global/India Trade listing
      const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
      if (clientRes.rows.length > 0) {
        const clientId = clientRes.rows[0].id;
        const tradeRes = await client.query(
          `INSERT INTO public.global_trade_listings 
            (company_name, country_of_origin, product_category, description, products, services, target_indian_markets, price_range, currency, user_id, is_verified)
           VALUES ('Trade Test GmbH', 'Germany', 'Automotive parts', 'German supplier test description', '{"Piston Rings"}', '{"Export"}', '{"Pune"}', '€5k-€20k', 'EUR', $1, true)
           RETURNING id`,
          [clientId]
        );
        logTest('Create Global Trade Listing', true, `Global trade listing created: ${tradeRes.rows[0].id}`);

        const filterRes = await client.query(
          `SELECT * FROM public.global_trade_listings WHERE country_of_origin = 'Germany'`
        );
        if (filterRes.rows.length > 0) {
          logTest('Filter Global Trade Listings', true, `German exporter found: ${filterRes.rows[0].company_name}`);
        } else {
          logTest('Filter Global Trade Listings', false, 'No listings found for Germany.');
        }
      } else {
        logTest('Create Global Trade Listing', false, 'No client found to test trade listing.');
      }
    } catch (err) {
      logTest('International Trade Cycle', false, 'Failed during trade cycle execution', err);
    }

    // -------------------------------------------------------------
    // Cycle 6: Product Sales Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 6: Product Sales Cycle ---');
    let testProductId = null;
    try {
      // 6.1 List Product
      const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
      if (clientRes.rows.length > 0) {
        const clientId = clientRes.rows[0].id;
        const res = await client.query(
          `INSERT INTO public.product_listings
            (name, description, price, currency, category, target_market, image_url, stock, status, user_id, views)
           VALUES ('Industrial Gearbox X', 'Heavy machinery gearbox', 12500, 'INR', 'Industrial & Machinery', 'both', 'https://picsum.photos/200', 50, 'active', $1, 10)
           RETURNING id`,
          [clientId]
        );
        testProductId = res.rows[0].id;
        logTest('List Product in Catalog', true, `Product listed with ID: ${testProductId}`);
      } else {
        logTest('List Product in Catalog', false, 'No client found to list product.');
      }
    } catch (err) {
      logTest('List Product in Catalog', false, 'Failed to list product', err);
    }

    try {
      // 6.2 Buy Product (Razorpay payment + Decrement Stock check)
      if (testProductId) {
        const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
        if (clientRes.rows.length > 0) {
          const buyerId = clientRes.rows[0].id;
          
          // Start Transaction
          await client.query('BEGIN');
          
          // Read current stock and owner (seller) of the product
          const prodRes = await client.query(`SELECT stock, user_id FROM public.product_listings WHERE id = $1 FOR UPDATE`, [testProductId]);
          const currentStock = prodRes.rows[0].stock;
          const sellerId = prodRes.rows[0].user_id;
          
          if (currentStock > 0) {
            // Decrement Stock
            await client.query(`UPDATE public.product_listings SET stock = stock - 1 WHERE id = $1`, [testProductId]);
            
            // Record checkout transaction log (in payments table with listing_id reference, booking_id = null)
            await client.query(
              `INSERT INTO public.payments (booking_id, consultant_id, client_id, amount, currency, status, razorpay_order_id, razorpay_payment_id)
               VALUES ($1, $2, $3, 12500, 'INR', 'completed', $4, $5)`,
              [null, sellerId, buyerId, `order_prod_${Math.random().toString(36).substring(7)}`, `pay_prod_${Math.random().toString(36).substring(7)}`]
            );
            
            await client.query('COMMIT');

            // Verify Stock Decremented
            const verifyRes = await client.query(`SELECT stock FROM public.product_listings WHERE id = $1`, [testProductId]);
            if (verifyRes.rows[0].stock === currentStock - 1) {
              logTest('Product Checkout & Stock Decrement', true, `Stock decremented from ${currentStock} to ${verifyRes.rows[0].stock}`);
            } else {
              logTest('Product Checkout & Stock Decrement', false, `Stock decrement check mismatch. Expected ${currentStock - 1}, got ${verifyRes.rows[0].stock}`);
            }
          } else {
            await client.query('ROLLBACK');
            logTest('Product Checkout & Stock Decrement', false, 'Product out of stock during test execution.');
          }
        }
      }
    } catch (err) {
      await client.query('ROLLBACK');
      logTest('Product Checkout & Stock Decrement', false, 'Checkout failed with transaction rollback', err);
    }

    // -------------------------------------------------------------
    // Cycle 7: Messaging Cycle
    // -------------------------------------------------------------
    console.log('\n--- Cycle 7: Messaging Cycle ---');
    try {
      // 7.1 Send message
      const clientRes = await client.query(`SELECT id FROM public.users WHERE role = 'client' LIMIT 1`);
      const consultantRes = await client.query(`SELECT id FROM public.users WHERE role = 'consultant' LIMIT 1`);
      
      if (clientRes.rows.length > 0 && consultantRes.rows.length > 0) {
        const p1 = clientRes.rows[0].id;
        const p2 = consultantRes.rows[0].id;

        const convRes = await client.query(
          `INSERT INTO public.conversations (participant_one, participant_two)
           VALUES ($1, $2) ON CONFLICT (participant_one, participant_two) DO UPDATE SET created_at = NOW() RETURNING id`,
          [p1 < p2 ? p1 : p2, p1 < p2 ? p2 : p1]
        );
        const convId = convRes.rows[0].id;

        await client.query(
          `INSERT INTO public.messages (conversation_id, sender_id, text_content, is_read)
           VALUES ($1, $2, 'Simulation cycle message text content', false)`,
          [convId, p1]
        );
        logTest('Send Negotiation Message', true, `Successfully sent message in conversation: ${convId}`);
      } else {
        logTest('Send Negotiation Message', false, 'Client or Consultant not found to initiate negotiation.');
      }
    } catch (err) {
      logTest('Send Negotiation Message', false, 'Failed during negotiation messaging', err);
    }

    console.log('\n======================================================');
    console.log(`📊 BUSINESS CYCLE SIMULATION SUMMARY:`);
    console.log(`Passed: ${results.filter(r => r.passed).length} / ${results.length}`);
    console.log(`Failed: ${results.filter(r => !r.passed).length}`);
    console.log('======================================================');

  } catch (err) {
    console.error('Fatal test runner crash:', err);
  } finally {
    client.release();
    pool.end();
  }
}

runTests();
