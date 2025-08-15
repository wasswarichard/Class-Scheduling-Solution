package com.multiparadigm.scheduler.web.dto;

import com.multiparadigm.scheduler.model.Schedule;
import com.multiparadigm.scheduler.model.ValidationResult;

/**
 * Response body for the generate-and-validate endpoint, returning
 * the produced schedule and its validation result.
 */
public record GenerateAndValidateResponse(
        Schedule schedule,
        ValidationResult validation
) {}
