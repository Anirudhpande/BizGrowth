import { Request, Response } from 'express';
import { BookingsService } from './bookings.service';

const bookingsService = new BookingsService();

export class BookingsController {
  /**
   * POST /api/bookings
   * Create a new booking
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId, clientId, scheduledAt, durationMinutes, notes } = req.body;

      // Validate required fields
      if (!consultantId || !clientId || !scheduledAt) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Check availability
      const isAvailable = await bookingsService.checkAvailability(
        consultantId,
        new Date(scheduledAt),
        durationMinutes || 60
      );

      if (!isAvailable) {
        res.status(409).json({ error: 'Consultant not available at this time' });
        return;
      }

      const booking = await bookingsService.createBooking({
        consultantId,
        clientId,
        scheduledAt: new Date(scheduledAt),
        durationMinutes: durationMinutes || 60,
        notes,
        status: 'pending',
      });

      res.status(201).json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to create booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/:bookingId
   * Get booking by ID
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const booking = await bookingsService.getBookingById(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/consultant/:consultantId
   * Get all bookings for a consultant
   */
  async getConsultantBookings(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId } = req.params;
      const { status } = req.query;

      const bookings = await bookingsService.getConsultantBookings(
        consultantId,
        status as string
      );

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch bookings: ${error}` });
    }
  }

  /**
   * GET /api/bookings/client/:clientId
   * Get all bookings for a client
   */
  async getClientBookings(req: Request, res: Response): Promise<void> {
    try {
      const { clientId } = req.params;
      const { status } = req.query;

      const bookings = await bookingsService.getClientBookings(
        clientId,
        status as string
      );

      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch bookings: ${error}` });
    }
  }

  /**
   * PATCH /api/bookings/:bookingId/status
   * Update booking status
   */
  async updateBookingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'Status is required' });
        return;
      }

      const booking = await bookingsService.updateBookingStatus(bookingId, status);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: `Failed to update booking: ${error}` });
    }
  }

  /**
   * DELETE /api/bookings/:bookingId
   * Cancel/delete booking
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const booking = await bookingsService.cancelBooking(bookingId);

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
      res.status(500).json({ error: `Failed to cancel booking: ${error}` });
    }
  }

  /**
   * GET /api/bookings/availability/check
   * Check consultant availability
   */
  async checkAvailability(req: Request, res: Response): Promise<void> {
    try {
      const { consultantId, scheduledAt, durationMinutes } = req.query;

      if (!consultantId || !scheduledAt) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
      }

      const isAvailable = await bookingsService.checkAvailability(
        consultantId as string,
        new Date(scheduledAt as string),
        parseInt(durationMinutes as string) || 60
      );

      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ error: `Failed to check availability: ${error}` });
    }
  }
}