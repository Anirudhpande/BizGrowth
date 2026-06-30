import db from '../../config/db';
import { IBooking } from './bookings.model';

const BOOKINGS_TABLE = 'bookings';

export class BookingsService {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const columns = Object.keys(bookingData).join(', ');
      const placeholders = Object.keys(bookingData).map((_, i) => `$${i + 1}`).join(', ');
      const values = Object.values(bookingData);

      const res = await db.query(
        `INSERT INTO ${BOOKINGS_TABLE} (${columns}) VALUES (${placeholders}) RETURNING *`,
        values
      );
      return res.rows[0];
    } catch (error) {
      throw new Error(`Failed to create booking: ${error}`);
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string): Promise<IBooking | null> {
    try {
      const res = await db.query(`SELECT * FROM ${BOOKINGS_TABLE} WHERE id = $1`, [bookingId]);
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to fetch booking: ${error}`);
      return null;
    }
  }

  /**
   * Get all bookings for a consultant
   */
  async getConsultantBookings(
    consultantId: string,
    status?: string
  ): Promise<IBooking[]> {
    try {
      let queryStr = `SELECT * FROM ${BOOKINGS_TABLE} WHERE consultant_id = $1`;
      const values: any[] = [consultantId];

      if (status) {
        queryStr += ` AND status = $2`;
        values.push(status);
      }

      queryStr += ` ORDER BY scheduled_at DESC`;

      const res = await db.query(queryStr, values);
      return res.rows;
    } catch (error) {
      console.error(`Failed to fetch bookings: ${error}`);
      return [];
    }
  }

  /**
   * Get all bookings for a client
   */
  async getClientBookings(clientId: string, status?: string): Promise<IBooking[]> {
    try {
      let queryStr = `SELECT * FROM ${BOOKINGS_TABLE} WHERE client_id = $1`;
      const values: any[] = [clientId];

      if (status) {
        queryStr += ` AND status = $2`;
        values.push(status);
      }

      queryStr += ` ORDER BY scheduled_at DESC`;

      const res = await db.query(queryStr, values);
      return res.rows;
    } catch (error) {
      console.error(`Failed to fetch bookings: ${error}`);
      return [];
    }
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(
    bookingId: string,
    status: string
  ): Promise<IBooking | null> {
    try {
      const res = await db.query(
        `UPDATE ${BOOKINGS_TABLE} SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, bookingId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to update booking: ${error}`);
      return null;
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string): Promise<IBooking | null> {
    return this.updateBookingStatus(bookingId, 'cancelled');
  }

  /**
   * Check consultant availability
   */
  async checkAvailability(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    try {
      const endTime = new Date(
        scheduledAt.getTime() + durationMinutes * 60000
      ).toISOString();
      const startTime = scheduledAt.toISOString();

      const res = await db.query(
        `SELECT * FROM ${BOOKINGS_TABLE} WHERE consultant_id = $1 AND status IN ('pending', 'confirmed', 'completed') AND scheduled_at < $2 AND scheduled_at >= $3`,
        [consultantId, endTime, startTime]
      );
      
      return res.rows.length === 0;
    } catch (error) {
      console.error(`Failed to check availability: ${error}`);
      return false;
    }
  }

  /**
   * Get bookings in date range
   */
  async getBookingsInRange(
    consultantId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IBooking[]> {
    try {
      const res = await db.query(
        `SELECT * FROM ${BOOKINGS_TABLE} WHERE consultant_id = $1 AND scheduled_at >= $2 AND scheduled_at <= $3 AND status != 'cancelled'`,
        [consultantId, startDate.toISOString(), endDate.toISOString()]
      );
      return res.rows;
    } catch (error) {
      console.error(`Failed to fetch bookings in range: ${error}`);
      return [];
    }
  }

  /**
   * Delete booking
   */
  async deleteBooking(bookingId: string): Promise<boolean> {
    try {
      await db.query(`DELETE FROM ${BOOKINGS_TABLE} WHERE id = $1`, [bookingId]);
      return true;
    } catch (error) {
      console.error(`Failed to delete booking: ${error}`);
      return false;
    }
  }
}
