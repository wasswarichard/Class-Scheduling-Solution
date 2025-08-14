package com.paradigms.project.web.dto;

import com.paradigms.project.model.Schedule;
import com.paradigms.project.model.SchedulingProblem;

/**
 * Request body for validation endpoint containing both the problem and the schedule to validate.
 * This mirrors the JSON structure expected by the /api/schedule/validate endpoint.
 */
public record ValidateRequest(
        SchedulingProblem problem,
        Schedule schedule
) {}
