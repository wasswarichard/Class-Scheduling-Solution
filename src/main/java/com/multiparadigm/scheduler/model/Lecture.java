package com.multiparadigm.scheduler.model;

/**
 * A single lecture instance belonging to a course.
 * @param id stable identifier of the lecture (e.g., "L1")
 * @param courseId the parent course identifier
 * @param title lecture title/topic
 * @param enrollment number of enrolled students
 */
public record Lecture(
        String id,
        String courseId,
        String title,
        int enrollment
) {}
