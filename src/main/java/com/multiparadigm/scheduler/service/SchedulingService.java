package com.multiparadigm.scheduler.service;

import com.multiparadigm.scheduler.ga.HaskellGAClient;
import com.multiparadigm.scheduler.model.Schedule;
import com.multiparadigm.scheduler.model.SchedulingProblem;
import com.multiparadigm.scheduler.model.ValidationResult;
import com.multiparadigm.scheduler.validation.PrologValidator;
import org.springframework.stereotype.Service;

/**
 * Application service orchestrating GA generation and Prolog validation.
 */
@Service
public class SchedulingService {
    private final HaskellGAClient gaClient;
    private final PrologValidator validator;

    public SchedulingService(HaskellGAClient gaClient, PrologValidator validator) {
        this.gaClient = gaClient;
        this.validator = validator;
    }

    /**
     * Generate a candidate schedule for the given problem using the Haskell GA.
     */
    public Schedule generate(SchedulingProblem problem) {
        return gaClient.generate(problem);
    }

    /**
     * Validate the given schedule against the problem using the Prolog validator.
     */
    public ValidationResult validate(SchedulingProblem problem, Schedule schedule) {
        return validator.validate(problem, schedule);
    }

    /**
     * Convenience method that generates a schedule and validates it in one call.
     */
    public Result generateAndValidate(SchedulingProblem problem) {
        Schedule schedule = generate(problem);
        ValidationResult validation = validate(problem, schedule);
        return new Result(schedule, validation);
    }

    /**
     * Tuple result carrying both the generated schedule and its validation result.
     */
    public record Result(Schedule schedule, ValidationResult validation) {}
}
