package com.multiparadigm.scheduler;

import com.multiparadigm.scheduler.exec.CommandRunner;
import com.multiparadigm.scheduler.exec.DefaultCommandRunner;
import com.multiparadigm.scheduler.ga.HaskellGAClient;
import com.multiparadigm.scheduler.validation.PrologValidator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

    @Bean
    public WebMvcConfigurer corsConfigurer(@Value("${app.cors.allowed-origins:*}") String allowedOriginsProp) {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                String[] origins = Arrays.stream(allowedOriginsProp.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toArray(String[]::new);

                registry.addMapping("/**")
                        .allowedOrigins(origins)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(false)
                        .maxAge(3600);
            }
        };
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
