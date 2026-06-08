import { Booking, IBooking } from './bookings.model';

export class BookingsService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const booking = new Booking(bookingData);
      return await booking.save();
    } catch (error) {
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId);
  }

  /**
   * Get all bookings for a consultant
   */
  async getConsultantBookings(
    consultantId: string,
    status?: string
  ): Promise<IBooking[]> {
    const query: any = { consultantId };
    if (status) {
      query.status = status;
    }
    return await Booking.find(query).sort({ scheduledAt: -1 });
  }

  /**
   * Get all bookings for a client
   */
  async getClientBookings(clientId: string, status?: string): Promise<IBooking[]> {
    const query: any = { clientId };
    if (status) {
      query.status = status;
    }
    return await Booking.find(query).sort({ scheduledAt: -1 });
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    );
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );
  }

  /**
   * Check consultant availability
   */
  async checkAvailability(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    const conflict = await Booking.findOne({
      consultantId,
      status: { $in: ['pending', 'confirmed', 'completed'] },
      scheduledAt: { $lt: endTime },
      $expr: {
        $gt: [
          { $add: ['$scheduledAt', { $multiply: ['$durationMinutes', 60000] }] },
          scheduledAt,
        ],
      },
    });

    return !conflict;
  }

  /**
   * Get bookings in date range
   */
  async getBookingsInRange(
    consultantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking[]> {
    return await Booking.find({
      consultantId,
      scheduledAt: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    });
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    const result = await Booking.findByIdAndDelete(bookingId);
    return !!result;
  }
}