package com.paradigms.project.model;

import java.util.List;

/**
 * Result of validating a schedule against hard constraints.
 * @param valid whether the schedule satisfies all constraints
 * @param violations list of violations (empty if valid)
 */
public record ValidationResult(
        boolean valid,
        List<Violation> violations
) {
    /** Convenience factory for a valid result with no violations. */
    public static ValidationResult ok() { return new ValidationResult(true, List.of()); }
    /** Creates a result from a list of violations; sets valid=false if non-empty. */
    public static ValidationResult from(List<Violation> violations) {
        return new ValidationResult(violations == null || violations.isEmpty(), violations == null ? List.of() : List.copyOf(violations));
    }
}
