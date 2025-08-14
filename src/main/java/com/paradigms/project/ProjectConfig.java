package com.paradigms.project;

import com.paradigms.project.exec.CommandRunner;
import com.paradigms.project.exec.DefaultCommandRunner;
import com.paradigms.project.ga.HaskellGAClient;
import com.paradigms.project.validation.PrologValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Arrays;
import java.util.List;

@Configuration
public class ProjectConfig {

    @Bean
    public CommandRunner commandRunner() {
        return new DefaultCommandRunner();
    }

    @Bean
    public HaskellGAClient haskellGAClient(
            CommandRunner runner,
            @Value("${app.haskell.ga.command:haskell/ga-exec}") String haskellCommand,
            @Value("${app.process.timeout.seconds:10}") int timeoutSeconds
    ) {
        List<String> cmd = splitCommand(haskellCommand);
        return new HaskellGAClient(runner, cmd, Duration.ofSeconds(timeoutSeconds));
    }

    @Bean
    public PrologValidator prologValidator(
            CommandRunner runner,
            @Value("${app.prolog.validator.command:swipl -q -s prolog/validator.pl -t main}") String prologCommand,
            @Value("${app.process.timeout.seconds:10}") int timeoutSeconds
    ) {
        List<String> cmd = splitCommand(prologCommand);
        return new PrologValidator(runner, cmd, Duration.ofSeconds(timeoutSeconds));
    }

    private static List<String> splitCommand(String commandLine) {
        if (commandLine == null || commandLine.isBlank()) {
            return List.of();
        }
        // Simple whitespace split is sufficient for our configured commands
        String[] parts = commandLine.trim().split("\\s+");
        return Arrays.asList(parts);
    }
}
