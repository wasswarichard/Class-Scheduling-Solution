package com.paradigms.project.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * Small Jackson-based JSON utility for consistent serialization/deserialization across the project.
 */
public final class JsonUtil {
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .findAndRegisterModules()
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);

    private JsonUtil() {}

    /**
     * Shared ObjectMapper configured for the project (modules registered, stable date handling, etc.).
     */
    public static ObjectMapper mapper() { return MAPPER; }

    /**
     * Serialize the given value to JSON using the shared mapper.
     * @throws RuntimeException if Jackson fails to serialize
     */
    public static String toJson(Object value) {
        try {
            return MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize to JSON", e);
        }
    }

    /**
     * Deserialize the given JSON string to the target type using the shared mapper.
     * @param json UTF-8 JSON text
     * @param type target class
     * @param <T> generic type parameter
     * @throws RuntimeException if Jackson fails to deserialize
     */
    public static <T> T fromJson(String json, Class<T> type) {
        try {
            return MAPPER.readValue(json, type);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to deserialize JSON to " + type.getSimpleName(), e);
        }
    }
}
