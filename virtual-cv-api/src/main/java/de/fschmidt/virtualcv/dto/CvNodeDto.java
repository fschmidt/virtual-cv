package de.fschmidt.virtualcv.dto;

import de.fschmidt.virtualcv.domain.CvNode.NodeType;

import java.util.Map;

public record CvNodeDto(
        String id,
        NodeType type,
        String parentId,
        String label,
        String markdownContent,
        Map<String, Object> attributes,
        Integer positionX,
        Integer positionY
) {}
