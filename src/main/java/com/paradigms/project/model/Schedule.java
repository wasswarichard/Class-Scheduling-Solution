package com.paradigms.project.model;

import java.util.List;

/**
 * A candidate schedule produced by the GA.
 * @param assignments list of lecture-to-room-time assignments
 * @param score optional GA fitness score; higher is better
 */
public record Schedule(
        List<Assignment> assignments,
        Double score // optional GA fitness score; higher is better
) {}
