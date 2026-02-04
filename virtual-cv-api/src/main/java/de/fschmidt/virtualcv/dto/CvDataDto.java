package de.fschmidt.virtualcv.dto;

import java.util.List;

public record CvDataDto(
        List<CvNodeDto> nodes
) {}
