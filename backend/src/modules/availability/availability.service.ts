import { Availability, IAvailability, IAvailabilitySlot } from './availability.model';
import { Booking } from '../bookings/bookings.model';

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
    try {
      const availability = new Availability({
        consultantId,
        slots,
        timezone,
        maxConsultationsPerDay,
      });

      return await availability.save();
    } catch (error) {
      throw new Error(`Failed to create availability: ${error}`);
    }
  }

  /**
   * Get availability for consultant
   */
  async getAvailability(consultantId: string): Promise<IAvailability | null> {
    return await Availability.findOne({ consultantId });
  }

  /**
   * Update availability slots
   */
  async updateAvailabilitySlots(
    consultantId: string,
    slots: IAvailabilitySlot[]
  ): Promise<IAvailability | null> {
    return await Availability.findOneAndUpdate(
      { consultantId },
      { slots },
      { new: true }
    );
  }

  /**
   * Add blocked dates
   */
  async addBlockedDates(
    consultantId: string,
    dates: Date[]
  ): Promise<IAvailability | null> {
    return await Availability.findOneAndUpdate(
      { consultantId },
      { $addToSet: { blockedDates: { $each: dates } } },
      { new: true }
    );
  }

  /**
   * Remove blocked dates
   */
  async removeBlockedDate(
    consultantId: string,
    date: Date
  ): Promise<IAvailability | null> {
    return await Availability.findOneAndUpdate(
      { consultantId },
      { $pull: { blockedDates: date } },
      { new: true }
    );
  }

  /**
   * Add break time
   */
  async addBreakTime(
    consultantId: string,
    startTime: string,
    endTime: string
  ): Promise<IAvailability | null> {
    return await Availability.findOneAndUpdate(
      { consultantId },
      {
        $push: {
          breakTimes: { startTime, endTime },
        },
      },
      { new: true }
    );
  }

  /**
   * Check if consultant is available
   */
  async isAvailable(
    consultantId: string,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    const availability = await this.getAvailability(consultantId);

    if (!availability) {
      return false;
    }

    // Check if date is blocked
    const dateOnly = new Date(scheduledAt.getFullYear(), scheduledAt.getMonth(), scheduledAt.getDate());
    const isBlocked = availability.blockedDates?.some(
      (bd) => new Date(bd).getTime() === dateOnly.getTime()
    );

    if (isBlocked) {
      return false;
    }

    // Check day of week and time slots
    const dayOfWeek = scheduledAt.getDay();
    const timeStr = `${String(scheduledAt.getHours()).padStart(2, '0')}:${String(
      scheduledAt.getMinutes()
    ).padStart(2, '0')}`;

    const slot = availability.slots?.find(
      (s) => s.dayOfWeek === dayOfWeek && s.isAvailable
    );

    if (!slot) {
      return false;
    }

    // Check if time is within slot
    const isWithinSlot =
      timeStr >= slot.startTime &&
      timeStr < slot.endTime;

    if (!isWithinSlot) {
      return false;
    }

    // Check break times
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);
    const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(
      endTime.getMinutes()
    ).padStart(2, '0')}`;

    const isInBreak = availability.breakTimes?.some(
      (bt) => timeStr < bt.endTime && endTimeStr > bt.startTime
    );

    if (isInBreak) {
      return false;
    }

    // Check max consultations per day
    const dayStart = new Date(scheduledAt);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(scheduledAt);
    dayEnd.setHours(23, 59, 59, 999);

    const consultationCount = await Booking.countDocuments({
      consultantId,
      scheduledAt: { $gte: dayStart, $lte: dayEnd },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    });

    if (consultationCount >= availability.maxConsultationsPerDay) {
      return false;
    }

    return true;
  }

  /**
   * Get available time slots for a date range
   */
  async getAvailableSlots(
    consultantId: string,
    fromDate: Date,
    toDate: Date,
    durationMinutes: number = 60
  ): Promise<Date[]> {
    const availability = await this.getAvailability(consultantId);
    const slots: Date[] = [];

    if (!availability) {
      return slots;
    }

    let currentDate = new Date(fromDate);

    while (currentDate <= toDate) {
      const dayOfWeek = currentDate.getDay();
      const availabilitySlot = availability.slots?.find(
        (s) => s.dayOfWeek === dayOfWeek && s.isAvailable
      );

      if (availabilitySlot) {
        const [startHour, startMin] = availabilitySlot.startTime.split(':').map(Number);
        const [endHour, endMin] = availabilitySlot.endTime.split(':').map(Number);

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
  }

  /**
   * Delete availability
   */
  async deleteAvailability(consultantId: string): Promise<boolean> {
    const result = await Availability.findOneAndDelete({ consultantId });
    return !!result;
  }
}