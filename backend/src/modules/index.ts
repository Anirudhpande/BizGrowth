// Phase 2 - Core Backend Modules
import globalTradeRouter from './global-trade/global_trade.routes';
import indiaTradeRouter from './india-trade/india_trade.routes';
import productRouter from './products/product.routes';
import bookingsRouter from './bookings/bookings.route';
import reviewsRouter from './reviews/reviews.route';
import categoriesRouter from './categories/categories.route';
import eventReviewsRouter from './event_reviews/event_reviews.routes';
import paymentsRouter from './payments/payments.route';
import notificationsRouter from './notifications/notifications.route';
import availabilityRouter from './availability/availability.route';
import messagesRouter from './messages/messages.routes';
import portfolioRouter from './portfolio/portfolio.routes';
import analyticsRouter from './analytics/analytics.routes';

export {
  bookingsRouter,
  reviewsRouter,
  categoriesRouter,
  eventReviewsRouter,
  paymentsRouter,
  notificationsRouter,
  availabilityRouter,
  messagesRouter,
  portfolioRouter,
  analyticsRouter,
  // Phase 4 - Cross-Border Trade Modules
  globalTradeRouter,
  indiaTradeRouter,
  productRouter,
};


