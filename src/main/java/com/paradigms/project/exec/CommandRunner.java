package com.paradigms.project.exec;

import java.time.Duration;
import java.util.List;

/**
 * Abstraction over running external commands with stdin/stdout/stderr capture and a timeout.
 */
public interface CommandRunner {
    /**
     * Execute a command with given stdin and timeout.
     * @param command command and arguments (as separate tokens)
     * @param stdin text to pass to process stdin (nullable)
     * @param timeout maximum duration to wait for completion
     * @return result with exit code, stdout, stderr, and timeout flag
     */
    CommandResult run(List<String> command, String stdin, Duration timeout) throws Exception;
}
