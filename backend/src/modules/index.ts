// Phase 2 - Core Backend Modules
import bookingsRouter from './bookings/bookings.route';
import reviewsRouter from './reviews/reviews.route';
import categoriesRouter from './categories/categories.route';

export {
  bookingsRouter,
  reviewsRouter,
  categoriesRouter,
};
// Phase 3 - Monetization & Engagement Modules
import paymentsRouter from './payments/payments.route';
import notificationsRouter from './notifications/notifications.route';
import availabilityRouter from './availability/availability.route';

export {
  paymentsRouter,
  notificationsRouter,
  availabilityRouter,
};
