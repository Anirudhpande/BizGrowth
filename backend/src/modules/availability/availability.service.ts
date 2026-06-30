import db from '../../config/db';
import { IAvailability, IAvailabilitySlot } from './availability.model';

const AVAILABILITY_TABLE = 'availability';
const BOOKINGS_TABLE = 'bookings';

export class AvailabilityService {
  /**
   * Create availability schedule
   */
  async createAvailability(
    consultantId: string,
    slots: IAvailabilitySlot[],
    timezone: string = 'Asia/Kolkata',
    maxConsultationsPerDay: number = 10
  ): Promise<IAvailability> {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const insertAvailQuery = `
        INSERT INTO availability (consultant_id, timezone, max_consultations_per_day)
        VALUES ($1, $2, $3)
        RETURNING *
      `;
      const availRes = await client.query(insertAvailQuery, [consultantId, timezone, maxConsultationsPerDay]);
      const availabilityData = availRes.rows[0];

      if (slots && slots.length > 0) {
        for (const slot of slots) {
          const insertSlotQuery = `
            INSERT INTO availability_slots (availability_id, day_of_week, start_time, end_time, is_available)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertSlotQuery, [
            availabilityData.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available
          ]);
        }
      }
      await client.query('COMMIT');
      return { ...availabilityData, slots };
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Failed to create availability: ${error}`);
    } finally {
      client.release();
    }
  }

  /**
   * Get availability for consultant
   */
  async getAvailability(consultantId: string): Promise<IAvailability | null> {
    try {
      const availRes = await db.query(`SELECT * FROM availability WHERE consultant_id = $1`, [consultantId]);
      if (availRes.rows.length === 0) return null;
      const data = availRes.rows[0];

      const slotsRes = await db.query(`SELECT * FROM availability_slots WHERE availability_id = $1 ORDER BY day_of_week ASC`, [data.id]);
      const slots = slotsRes.rows.map((s: any) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time ? s.start_time.substring(0, 5) : '09:00',
        end_time: s.end_time ? s.end_time.substring(0, 5) : '17:00',
        is_available: !!s.is_available
      }));

      return { ...data, slots };
    } catch (error) {
      console.error(`Failed to fetch availability: ${error}`);
      return null;
    }
  }

  /**
   * Update availability slots
   */
  async updateAvailabilitySlots(
    consultantId: string,
    slots: IAvailabilitySlot[]
  ): Promise<IAvailability | null> {
    const client = await db.pool.connect();
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) {
        client.release();
        return null;
      }

      await client.query('BEGIN');
      await client.query(`DELETE FROM availability_slots WHERE availability_id = $1`, [availability.id]);

      if (slots && slots.length > 0) {
        for (const slot of slots) {
          const insertSlotQuery = `
            INSERT INTO availability_slots (availability_id, day_of_week, start_time, end_time, is_available)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(insertSlotQuery, [
            availability.id, slot.day_of_week, slot.start_time, slot.end_time, slot.is_available
          ]);
        }
      }

      await client.query(`UPDATE availability SET updated_at = NOW() WHERE id = $1`, [availability.id]);
      await client.query('COMMIT');
      return { ...availability, slots };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`Failed to update availability slots: ${error}`);
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Add blocked dates
   */
  async addBlockedDates(consultantId: string, dates: Date[]): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const blockedDates = Array.isArray(availability.blocked_dates)
        ? [...availability.blocked_dates, ...dates]
        : dates;

      const res = await db.query(
        `UPDATE availability SET blocked_dates = $1, updated_at = NOW() WHERE consultant_id = $2 RETURNING *`,
        [JSON.stringify(blockedDates), consultantId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to add blocked dates: ${error}`);
      return null;
    }
  }

  /**
   * Remove blocked dates
   */
  async removeBlockedDate(consultantId: string, date: Date): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const blockedDates = (availability.blocked_dates || []).filter(
        (bd: any) => new Date(bd).toDateString() !== new Date(date).toDateString()
      );

      const res = await db.query(
        `UPDATE availability SET blocked_dates = $1, updated_at = NOW() WHERE consultant_id = $2 RETURNING *`,
        [JSON.stringify(blockedDates), consultantId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to remove blocked date: ${error}`);
      return null;
    }
  }

  /**
   * Add break time
   */
  async addBreakTime(consultantId: string, startTime: string, endTime: string): Promise<IAvailability | null> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return null;

      const breakTimes = availability.break_times || [];
      breakTimes.push({ start_time: startTime, end_time: endTime });

      const res = await db.query(
        `UPDATE availability SET break_times = $1, updated_at = NOW() WHERE consultant_id = $2 RETURNING *`,
        [JSON.stringify(breakTimes), consultantId]
      );
      if (res.rows.length === 0) return null;
      return res.rows[0];
    } catch (error) {
      console.error(`Failed to add break time: ${error}`);
      return null;
    }
  }

  /**
   * Check if consultant is available
   */
  async isAvailable(consultantId: string, scheduledAt: Date, durationMinutes: number): Promise<boolean> {
    try {
      const availability = await this.getAvailability(consultantId);
      if (!availability) return false;

      const dateOnly = new Date(scheduledAt.getFullYear(), scheduledAt.getMonth(), scheduledAt.getDate());
      const isBlocked = availability.blocked_dates?.some(
        (bd: any) => new Date(bd).toDateString() === dateOnly.toDateString()
      );
      if (isBlocked) return false;

      const dayOfWeek = scheduledAt.getDay();
      const timeStr = `${String(scheduledAt.getHours()).padStart(2, '0')}:${String(scheduledAt.getMinutes()).padStart(2, '0')}`;
      
      const slot = availability.slots?.find((s: any) => s.day_of_week === dayOfWeek && s.is_available);
      if (!slot) return false;

      const isWithinSlot = timeStr >= slot.start_time && timeStr < slot.end_time;
      if (!isWithinSlot) return false;

      const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;

      const isInBreak = availability.break_times?.some(
        (bt: any) => timeStr < (bt.end_time || '') && endTimeStr > (bt.start_time || '')
      );
      if (isInBreak) return false;

      const dayStart = new Date(scheduledAt);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(scheduledAt);
      dayEnd.setHours(23, 59, 59, 999);

      const countRes = await db.query(
        `SELECT COUNT(*) FROM bookings WHERE consultant_id = $1 AND scheduled_at >= $2 AND scheduled_at <= $3 AND status IN ('pending', 'confirmed', 'completed')`,
        [consultantId, dayStart.toISOString(), dayEnd.toISOString()]
      );

      const count = parseInt(countRes.rows[0].count, 10) || 0;
      if (count >= (availability.max_consultations_per_day || 10)) {
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Failed to check availability: ${error}`);
      return false;
    }
  }

  /**
   * Get available time slots for a date range
   */
  async getAvailableSlots(consultantId: string, fromDate: Date, toDate: Date, durationMinutes: number = 60): Promise<Date[]> {
    try {
      const availability = await this.getAvailability(consultantId);
      const slots: Date[] = [];
      if (!availability) return slots;

      let currentDate = new Date(fromDate);
      while (currentDate <= toDate) {
        const dayOfWeek = currentDate.getDay();
        const availabilitySlot = availability.slots?.find((s: any) => s.day_of_week === dayOfWeek && s.is_available);

        if (availabilitySlot) {
          const [startHour, startMin] = availabilitySlot.start_time.split(':').map(Number);
          const [endHour, endMin] = availabilitySlot.end_time.split(':').map(Number);

          let slotTime = new Date(currentDate);
          slotTime.setHours(startHour, startMin, 0);

          const slotEndTime = new Date(currentDate);
          slotEndTime.setHours(endHour, endMin, 0);

          while (slotTime.getTime() + durationMinutes * 60000 <= slotEndTime.getTime()) {
            if (await this.isAvailable(consultantId, slotTime, durationMinutes)) {
              slots.push(new Date(slotTime));
            }
            slotTime = new Date(slotTime.getTime() + durationMinutes * 60000);
          }
        }
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
      }
      return slots;
    } catch (error) {
      console.error(`Failed to get available slots: ${error}`);
      return [];
    }
  }

  /**
   * Delete availability
   */
  async deleteAvailability(consultantId: string): Promise<boolean> {
    try {
      await db.query(`DELETE FROM availability WHERE consultant_id = $1`, [consultantId]);
      return true;
    } catch (error) {
      console.error(`Failed to delete availability: ${error}`);
      return false;
    }
  }
}
