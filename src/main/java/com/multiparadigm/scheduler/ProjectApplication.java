package com.multiparadigm.scheduler;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot application entry point for the Scheduling project.
 * <p>
 * This service exposes REST endpoints to generate schedules via a Haskell-based
 * Genetic Algorithm and validate them using a Prolog validator. See README.md
 * for usage, architecture overview, and instructions on running the external tools.
 */
@SpringBootApplication
public class ProjectApplication {

    /**
     * Boots the Spring application.
     * @param args standard JVM args
     */
    public static void main(String[] args) {
        SpringApplication.run(ProjectApplication.class, args);
    }

}
