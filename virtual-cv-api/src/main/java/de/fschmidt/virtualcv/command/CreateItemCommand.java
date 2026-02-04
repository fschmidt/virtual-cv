package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateItemCommand(
        @NotBlank String id,
        String parentId,
        @NotBlank String label,
        String description,
        Integer positionX,
        Integer positionY,
        // Item-specific
        String company,
        String dateRange,
        String location,
        List<String> highlights,
        List<String> technologies
) implements CreateNodeCommand {}
