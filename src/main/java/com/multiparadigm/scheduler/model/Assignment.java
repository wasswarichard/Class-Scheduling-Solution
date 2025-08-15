package com.multiparadigm.scheduler.model;

/**
 * A mapping assigning a lecture to a room and a time slot.
 * @param lectureId the lecture being scheduled
 * @param roomId the room where the lecture will take place
 * @param timeSlotId the time slot during which the lecture is scheduled
 */
public record Assignment(
        String lectureId,
        String roomId,
        String timeSlotId
) {}
