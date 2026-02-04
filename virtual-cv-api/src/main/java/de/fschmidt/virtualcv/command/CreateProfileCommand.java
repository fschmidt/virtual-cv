package de.fschmidt.virtualcv.command;

import jakarta.validation.constraints.NotBlank;

public record CreateProfileCommand(
        @NotBlank String id,
        String parentId,
        @NotBlank String label,
        String description,
        Integer positionX,
        Integer positionY,
        // Profile-specific
        @NotBlank String name,
        @NotBlank String title,
        String subtitle,
        String experience,
        String email,
        String location,
        String photoUrl
) implements CreateNodeCommand {}
