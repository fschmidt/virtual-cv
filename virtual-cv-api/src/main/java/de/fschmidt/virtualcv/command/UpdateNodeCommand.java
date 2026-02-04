package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public record UpdateNodeCommand(
        @NotBlank String id,
        String parentId,
        String label,
        String description,
        Map<String, Object> attributes,
        Integer positionX,
        Integer positionY
) {}
