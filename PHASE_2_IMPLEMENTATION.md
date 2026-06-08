# Phase 2 — Core Backend Gaps Implementation Guide

This document provides a comprehensive guide for implementing Phase 2 of the BizGrowth platform, focusing on three core backend modules: Bookings, Reviews, and Categories.

## 📋 Overview

Phase 2 introduces three essential features to the platform:

1. **Bookings Module** - Allow clients to book consultants
2. **Reviews Module** - Enable clients to rate and review consultants after sessions
3. **Categories Module** - Organize consultants by expertise/skills for better filtering

---

## 🏗️ Project Structure

```
src/modules/
├── bookings/
│   ├── bookings.controller.ts    # API endpoints
│   ├── bookings.service.ts       # Business logic
│   ├── bookings.model.ts         # Data model
│   └── bookings.route.ts         # Route definitions
├── reviews/
│   ├── reviews.controller.ts     # API endpoints
│   ├── reviews.service.ts        # Business logic
│   ├── reviews.model.ts          # Data model
│   └── reviews.route.ts          # Route definitions
├── categories/
│   ├── categories.controller.ts  # API endpoints
│   ├── categories.service.ts     # Business logic
│   ├── categories.model.ts       # Category data model
│   ├── consultant-categories.model.ts  # Mapping model
│   └── categories.route.ts       # Route definitions
└── index.ts                      # Module exports
```

---

## 🔧 Module Details

### 1. Bookings Module

**Purpose**: Enable clients to book consultants for sessions.

#### Key Features:
- Create bookings with availability checking
- View bookings by consultant or client
- Update booking status (pending → confirmed → completed)
- Cancel bookings
- Check consultant availability in real-time

#### API Endpoints:

| Method | Endpoint | Description |
|--------|----------|----------|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/:bookingId` | Get booking details |
| GET | `/api/bookings/consultant/:consultantId` | Get all bookings for a consultant |
| GET | `/api/bookings/client/:clientId` | Get all bookings for a client |
| PATCH | `/api/bookings/:bookingId/status` | Update booking status |
| DELETE | `/api/bookings/:bookingId` | Cancel/delete booking |
| GET | `/api/bookings/availability/check` | Check consultant availability |

#### Request Examples:

```bash
# Create booking
POST /api/bookings
{
  "consultantId": "consultant_123",
  "clientId": "client_456",
  "scheduledAt": "2026-06-15T10:00:00Z",
  "durationMinutes": 60,
  "notes": "Discuss growth strategy"
}

# Check availability
GET /api/bookings/availability/check?consultantId=consultant_123&scheduledAt=2026-06-15T10:00:00Z&durationMinutes=60

# Update booking status
PATCH /api/bookings/booking_123/status
{
  "status": "confirmed"
}
```

---

### 2. Reviews Module

**Purpose**: Allow clients to rate and review consultants after completed bookings.

#### Key Features:
- Create reviews with ratings (1-5 stars)
- View all reviews for a consultant
- Get average ratings and rating distribution
- Mark reviews as helpful
- Edit and delete reviews

#### API Endpoints:

| Method | Endpoint | Description |
|--------|----------|----------|
| POST | `/api/reviews` | Create a new review |
| GET | `/api/reviews/:reviewId` | Get review details |
| GET | `/api/reviews/consultant/:consultantId` | Get all reviews for a consultant |
| GET | `/api/reviews/consultant/:consultantId/stats` | Get consultant review statistics |
| GET | `/api/reviews/client/:clientId` | Get all reviews by a client |
| PATCH | `/api/reviews/:reviewId` | Update review |
| DELETE | `/api/reviews/:reviewId` | Delete review |
| POST | `/api/reviews/:reviewId/helpful` | Mark review as helpful |

#### Request Examples:

```bash
# Create review
POST /api/reviews
{
  "bookingId": "booking_123",
  "consultantId": "consultant_123",
  "clientId": "client_456",
  "rating": 5,
  "title": "Excellent guidance",
  "comment": "Very helpful and professional"
}

# Get consultant stats
GET /api/reviews/consultant/consultant_123/stats

# Response:
{
  "averageRating": 4.8,
  "totalReviews": 25,
  "distribution": {
    "1": 0,
    "2": 1,
    "3": 2,
    "4": 5,
    "5": 17
  }
}

# Mark helpful
POST /api/reviews/review_123/helpful
```

---

### 3. Categories Module

**Purpose**: Organize consultants by expertise areas for easy filtering and discovery.

#### Key Features:
- Create and manage expertise categories
- Assign consultants to multiple categories
- Search categories
- Get trending categories (most consultants)
- Filter consultants by category

#### API Endpoints:

| Method | Endpoint | Description |
|--------|----------|----------|
| POST | `/api/categories` | Create a new category |
| GET | `/api/categories` | Get all categories |
| GET | `/api/categories/trending` | Get trending categories |
| GET | `/api/categories/search` | Search categories |
| GET | `/api/categories/:categoryId` | Get category details |
| PATCH | `/api/categories/:categoryId` | Update category |
| DELETE | `/api/categories/:categoryId` | Delete category |
| POST | `/api/categories/:categoryId/consultants/:consultantId` | Add consultant to category |
| DELETE | `/api/categories/:categoryId/consultants/:consultantId` | Remove consultant from category |
| GET | `/api/categories/consultants/:consultantId` | Get all categories for a consultant |
| GET | `/api/categories/:categoryId/consultants` | Get all consultants in a category |
| POST | `/api/categories/consultants/:consultantId/bulk-assign` | Assign consultant to multiple categories |

#### Request Examples:

```bash
# Create category
POST /api/categories
{
  "name": "Business Strategy",
  "description": "Strategic planning and business development",
  "icon": "📊",
  "color": "#3B82F6"
}

# Add consultant to category
POST /api/categories/category_123/consultants/consultant_456

# Bulk assign consultant to multiple categories
POST /api/categories/consultants/consultant_456/bulk-assign
{
  "categoryIds": ["category_123", "category_456", "category_789"]
}

# Search categories
GET /api/categories/search?q=strategy

# Get trending categories
GET /api/categories/trending?limit=10
```

---

## 📊 Database Models

### Bookings Collection

```typescript
{
  _id: ObjectId,
  consultantId: String,      // Reference to consultant
  clientId: String,          // Reference to client
  scheduledAt: Date,         // Booking time
  durationMinutes: Number,   // Session duration (15-480 mins)
  status: String,            // pending | confirmed | completed | cancelled
  notes: String,             // Optional notes
  meetingLink: String,       // Optional video call link
  createdAt: Date,
  updatedAt: Date
}
```

### Reviews Collection

```typescript
{
  _id: ObjectId,
  bookingId: String,         // Reference to booking (unique)
  consultantId: String,      // Reference to consultant
  clientId: String,          // Reference to client
  rating: Number,            // 1-5 stars
  title: String,             // Optional review title
  comment: String,           // Review text
  helpful: Number,           // Count of helpful votes
  createdAt: Date,
  updatedAt: Date
}
```

### Categories Collection

```typescript
{
  _id: ObjectId,
  name: String,              // Category name (unique)
  description: String,       // Category description
  icon: String,              // Optional emoji/icon
  color: String,             // Hex color code
  consultantCount: Number,   // Number of consultants in this category
  createdAt: Date,
  updatedAt: Date
}
```

### Consultant-Categories Collection (Junction Table)

```typescript
{
  _id: ObjectId,
  consultantId: String,      // Reference to consultant
  categoryId: String,        // Reference to category
  createdAt: Date
  // Unique index on (consultantId, categoryId)
}
```

---

## 🚀 Integration Steps

### 1. Register Routes in Main App

Add to your main `server.ts` or `app.ts`:

```typescript
import { bookingsRouter, reviewsRouter, categoriesRouter } from './modules';

app.use('/api/bookings', bookingsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
```

### 2. Environment Setup

Ensure MongoDB is configured:

```env
MONGODB_URI=mongodb://localhost:27017/bizgrowth
```

### 3. Import Models in Database Connection

```typescript
import { Booking } from './modules/bookings/bookings.model';
import { Review } from './modules/reviews/reviews.model';
import { Category } from './modules/categories/categories.model';
import { ConsultantCategory } from './modules/categories/consultant-categories.model';
```

---

## 📋 Implementation Checklist

### Phase 2 Setup
- [ ] Create branch `feature/phase-2-core-backend`
- [ ] Set up database migrations/schemas
- [ ] Register all module routes

### Bookings Module
- [ ] Implement bookings model ✅
- [ ] Implement bookings service ✅
- [ ] Implement bookings controller ✅
- [ ] Implement bookings routes ✅
- [ ] Add availability checking logic ✅
- [ ] Write unit tests for bookings
- [ ] Add booking notifications (email/SMS)

### Reviews Module
- [ ] Implement reviews model ✅
- [ ] Implement reviews service ✅
- [ ] Implement reviews controller ✅
- [ ] Implement reviews routes ✅
- [ ] Add review statistics endpoints ✅
- [ ] Write unit tests for reviews
- [ ] Add review moderation (optional)

### Categories Module
- [ ] Implement categories model ✅
- [ ] Implement consultant-categories model ✅
- [ ] Implement categories service ✅
- [ ] Implement categories controller ✅
- [ ] Implement categories routes ✅
- [ ] Add search functionality ✅
- [ ] Write unit tests for categories

### Testing & Documentation
- [ ] Write API documentation
- [ ] Create Postman collection for testing
- [ ] Write integration tests
- [ ] Performance testing & optimization

---

## 🧪 Testing

### Sample Postman Collection

```json
{
  "info": {
    "name": "BizGrowth Phase 2 APIs",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Bookings",
      "item": [
        {
          "name": "Create Booking",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/api/bookings",
            "body": {
              "consultantId": "consultant_123",
              "clientId": "client_456",
              "scheduledAt": "2026-06-15T10:00:00Z",
              "durationMinutes": 60
            }
          }
        }
      ]
    }
  ]
}
```

---

## 🔒 Security Considerations

1. **Authentication**: Ensure all endpoints require authentication
2. **Authorization**: Clients can only view/modify their own bookings; consultants can only view their own bookings
3. **Input Validation**: Validate all inputs before processing
4. **Rate Limiting**: Implement rate limiting on booking/review creation
5. **Data Sanitization**: Sanitize user inputs in comments/notes

---

## 📈 Future Enhancements

1. **Payment Integration**: Add Stripe/Razorpay for booking payments
2. **Notifications**: Email/SMS/Push notifications for bookings
3. **Calendar Sync**: Sync bookings with Google Calendar/Outlook
4. **Recurring Bookings**: Support for recurring consultation sessions
5. **Analytics Dashboard**: Detailed analytics for consultants
6. **Review Moderation**: Admin approval for reviews
7. **Rating Badges**: Special badges for highly-rated consultants

---

## 📞 Support

For questions or issues during implementation, refer to:
- TypeScript Documentation: https://www.typescriptlang.org/docs/
- Express.js Guide: https://expressjs.com/
- Mongoose Documentation: https://mongoosejs.com/

---

**Branch**: `phase-2-core-backend`  
**Created**: 2026-06-08  
**Status**: Ready for Integration Testing