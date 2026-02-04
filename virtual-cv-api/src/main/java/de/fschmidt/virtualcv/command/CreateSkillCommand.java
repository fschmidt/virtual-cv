package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

public record CreateSkillCommand(
        @NotBlank String id,
        String parentId,
        @NotBlank String label,
        String description,
        Integer positionX,
        Integer positionY,
        // Skill-specific
        String proficiencyLevel,
        Integer yearsOfExperience
) implements CreateNodeCommand {}
