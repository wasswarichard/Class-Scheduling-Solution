package com.paradigms.project.web;

import com.paradigms.project.model.Schedule;
import com.paradigms.project.model.SchedulingProblem;
import com.paradigms.project.model.ValidationResult;
import com.paradigms.project.service.SchedulingService;
import com.paradigms.project.web.dto.GenerateAndValidateResponse;
import com.paradigms.project.web.dto.ValidateRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST endpoints for generating and validating schedules.
 */
@RestController
@RequestMapping(path = "/api/schedule", produces = { MediaType.APPLICATION_JSON_VALUE, "application/*+json" })
public class SchedulingController {

    private final SchedulingService service;

    public SchedulingController(SchedulingService service) {
        this.service = service;
    }

    /**
     * Generate a candidate schedule for the provided problem using the GA.
     */
    @PostMapping(path = "/generate", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/*+json" })
    public Schedule generate(@RequestBody SchedulingProblem problem) {
        return service.generate(problem);
    }

    /**
     * Validate a provided schedule against the problem using the Prolog validator.
     */
    @PostMapping(path = "/validate", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/*+json" })
    public ValidationResult validate(@RequestBody ValidateRequest request) {
        return service.validate(request.problem(), request.schedule());
    }

    /**
     * Generate a schedule and validate it in a single request.
     */
    @PostMapping(path = "/generate-and-validate", consumes = { MediaType.APPLICATION_JSON_VALUE, "application/*+json" })
    public GenerateAndValidateResponse generateAndValidate(@RequestBody SchedulingProblem problem) {
        SchedulingService.Result res = service.generateAndValidate(problem);
        return new GenerateAndValidateResponse(res.schedule(), res.validation());
    }
}
