package com.multiparadigm.scheduler.model;

/**
 * Represents a time window on a particular day.
 * @param id stable identifier of the time slot (e.g., "T1")
 * @param day short day name (e.g., MON, TUE)
 * @param start start time in 24h format (e.g., 09:00)
 * @param end end time in 24h format (e.g., 10:30)
 */
public record TimeSlot(
        String id,
        String day,      // e.g., MON, TUE, ...
        String start,    // e.g., 09:00 (24h)
        String end       // e.g., 10:30
) {}
