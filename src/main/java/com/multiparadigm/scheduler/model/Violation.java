package com.multiparadigm.scheduler.model;

/**
 * A single constraint violation reported by the validator.
 * @param code machine-readable violation code (e.g., "capacity_exceeded")
 * @param message human-readable description
 * @param lectureId related lecture identifier (if applicable)
 * @param roomId related room identifier (if applicable)
 * @param timeSlotId related time slot identifier (if applicable)
 */
public record Violation(
        String code,
        String message,
        String lectureId,
        String roomId,
        String timeSlotId
) {}
