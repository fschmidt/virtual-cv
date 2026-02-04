package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

public record CreateCategoryCommand(
        @NotBlank String id,
        String parentId,
        @NotBlank String label,
        String description,
        Integer positionX,
        Integer positionY,
        // Category-specific
        @NotBlank String sectionId
) implements CreateNodeCommand {}
