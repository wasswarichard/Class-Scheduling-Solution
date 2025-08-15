package com.multiparadigm.scheduler.model;

import java.util.List;

/**
 * An input instance for the scheduling domain, listing all courses, lectures, rooms, and time slots
 * to be considered by the GA and validator.
 * @param courses available courses
 * @param lectures lectures to schedule
 * @param rooms available rooms
 * @param timeSlots available time slots
 */
public record SchedulingProblem(
        List<Course> courses,
        List<Lecture> lectures,
        List<Room> rooms,
        List<TimeSlot> timeSlots
) {}
