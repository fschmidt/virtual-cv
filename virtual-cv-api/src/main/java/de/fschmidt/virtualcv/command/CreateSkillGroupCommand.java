package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

public record CreateSkillGroupCommand(
        @NotBlank String id,
        String parentId,
        @NotBlank String label,
        String description,
        Integer positionX,
        Integer positionY,
        // SkillGroup-specific
        String proficiencyLevel
) implements CreateNodeCommand {}
