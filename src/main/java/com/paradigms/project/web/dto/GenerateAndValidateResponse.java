package com.paradigms.project.web.dto;

import com.paradigms.project.model.Schedule;
import com.paradigms.project.model.ValidationResult;

/**
 * Response body for the generate-and-validate endpoint, returning
 * the produced schedule and its validation result.
 */
public record GenerateAndValidateResponse(
        Schedule schedule,
        ValidationResult validation
) {}
