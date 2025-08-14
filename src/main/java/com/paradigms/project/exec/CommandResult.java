package com.paradigms.project.exec;

/**
 * Immutable result of an external command execution.
 * @param exitCode process exit code (undefined if timedOut=true)
 * @param stdout captured standard output (UTF-8)
 * @param stderr captured standard error (UTF-8)
 * @param timedOut true if the process was forcibly terminated due to timeout
 */
public record CommandResult(int exitCode, String stdout, String stderr, boolean timedOut) {}
