package com.paradigms.project.exec;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.*;

/**
 * Default implementation of CommandRunner using Java ProcessBuilder.
 * Captures stdout/stderr asynchronously and enforces a hard timeout.
 */
public class DefaultCommandRunner implements CommandRunner {
    @Override
    public CommandResult run(List<String> command, String stdin, Duration timeout) throws Exception {
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        // Send stdin
        if (stdin != null) {
            try (OutputStreamWriter writer = new OutputStreamWriter(process.getOutputStream(), StandardCharsets.UTF_8)) {
                writer.write(stdin);
                writer.flush();
            }
        } else {
            process.getOutputStream().close();
        }

        ExecutorService pool = Executors.newFixedThreadPool(2);
        Future<String> outFuture = pool.submit(() -> readAll(process.getInputStream()));
        Future<String> errFuture = pool.submit(() -> readAll(process.getErrorStream()));

        boolean finished = process.waitFor(timeout.toMillis(), TimeUnit.MILLISECONDS);
        boolean timedOut = false;
        if (!finished) {
            timedOut = true;
            process.destroyForcibly();
        }
        int exit = finished ? process.exitValue() : -1;
        String stdout = safeGet(outFuture);
        String stderr = safeGet(errFuture);
        pool.shutdownNow();

        return new CommandResult(exit, stdout, stderr, timedOut);
    }

    private static String readAll(java.io.InputStream is) throws Exception {
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line).append('\n');
            }
            return sb.toString();
        }
    }

    private static String safeGet(Future<String> f) {
        try {
            return f.get(100, TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            return "";
        }
    }
}
