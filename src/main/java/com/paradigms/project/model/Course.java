package com.paradigms.project.model;

/**
 * A course offered by the institution.
 * @param id stable identifier of the course (e.g., "C1")
 * @param name human-readable name (e.g., "Algorithms")
 */
public record Course(
        String id,
        String name
) {}
