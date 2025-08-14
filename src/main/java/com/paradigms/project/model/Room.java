package com.paradigms.project.model;

/**
 * A physical room where lectures can be scheduled.
 * @param id stable identifier of the room (e.g., "R1")
 * @param name human-readable room name
 * @param capacity maximum number of students the room can hold
 */
public record Room(
        String id,
        String name,
        int capacity
) {}
