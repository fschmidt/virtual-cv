package de.fschmidt.virtualcv.service;

import de.fschmidt.virtualcv.command.*;
import de.fschmidt.virtualcv.domain.CvNode;
import de.fschmidt.virtualcv.domain.CvNode.NodeType;
import de.fschmidt.virtualcv.dto.CvDataDto;
import de.fschmidt.virtualcv.dto.CvNodeDto;
import de.fschmidt.virtualcv.repository.CvNodeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class CvNodeService {

    private final CvNodeRepository repository;

    public CvNodeService(CvNodeRepository repository) {
        this.repository = repository;
    }

    // Queries

    @Transactional(readOnly = true)
    public CvDataDto getAllNodes() {
        List<CvNodeDto> nodes = repository.findAllActive();
        return new CvDataDto(nodes);
    }

    @Transactional(readOnly = true)
    public Optional<CvNodeDto> getNode(String id) {
        return repository.findActiveById(id);
    }

    @Transactional(readOnly = true)
    public List<CvNodeDto> getChildren(String parentId) {
        return repository.findActiveByParentId(parentId);
    }

    @Transactional(readOnly = true)
    public List<CvNodeDto> search(String query) {
        return repository.searchActive(query);
    }

    // Commands

    public CvNodeDto create(CreateNodeCommand command) {
        CvNode node = new CvNode();
        node.setId(command.id());
        node.setLabel(command.label());
        node.setDescription(command.description());
        node.setPositionX(command.positionX());
        node.setPositionY(command.positionY());

        if (command.parentId() != null) {
            repository.findById(command.parentId())
                    .ifPresent(node::setParent);
        }

        // Set type and type-specific attributes
        Map<String, Object> attributes = new HashMap<>();

        switch (command) {
            case CreateProfileCommand c -> {
                node.setType(NodeType.PROFILE);
                putIfNotNull(attributes, "name", c.name());
                putIfNotNull(attributes, "title", c.title());
                putIfNotNull(attributes, "subtitle", c.subtitle());
                putIfNotNull(attributes, "experience", c.experience());
                putIfNotNull(attributes, "email", c.email());
                putIfNotNull(attributes, "location", c.location());
                putIfNotNull(attributes, "photoUrl", c.photoUrl());
            }
            case CreateCategoryCommand c -> {
                node.setType(NodeType.CATEGORY);
                putIfNotNull(attributes, "sectionId", c.sectionId());
            }
            case CreateItemCommand c -> {
                node.setType(NodeType.ITEM);
                putIfNotNull(attributes, "company", c.company());
                putIfNotNull(attributes, "dateRange", c.dateRange());
                putIfNotNull(attributes, "location", c.location());
                putIfNotNull(attributes, "highlights", c.highlights());
                putIfNotNull(attributes, "technologies", c.technologies());
            }
            case CreateSkillGroupCommand c -> {
                node.setType(NodeType.SKILL_GROUP);
                putIfNotNull(attributes, "proficiencyLevel", c.proficiencyLevel());
            }
            case CreateSkillCommand c -> {
                node.setType(NodeType.SKILL);
                putIfNotNull(attributes, "proficiencyLevel", c.proficiencyLevel());
                putIfNotNull(attributes, "yearsOfExperience", c.yearsOfExperience());
            }
        }

        if (!attributes.isEmpty()) {
            node.setAttributes(attributes);
        }

        CvNode saved = repository.save(node);
        return toDto(saved);
    }

    public Optional<CvNodeDto> update(UpdateNodeCommand command) {
        return repository.findById(command.id())
                .filter(node -> !node.isDeleted())
                .map(node -> {
                    if (command.label() != null) {
                        node.setLabel(command.label());
                    }
                    if (command.description() != null) {
                        node.setDescription(command.description());
                    }
                    if (command.attributes() != null) {
                        node.setAttributes(command.attributes());
                    }
                    if (command.positionX() != null) {
                        node.setPositionX(command.positionX());
                    }
                    if (command.positionY() != null) {
                        node.setPositionY(command.positionY());
                    }
                    if (command.parentId() != null) {
                        repository.findById(command.parentId())
                                .ifPresent(node::setParent);
                    }
                    return toDto(repository.save(node));
                });
    }

    public boolean delete(String id) {
        return repository.findById(id)
                .filter(node -> !node.isDeleted())
                .map(node -> {
                    node.setDeleted(true);
                    repository.save(node);
                    return true;
                })
                .orElse(false);
    }

    private CvNodeDto toDto(CvNode node) {
        return new CvNodeDto(
                node.getId(),
                node.getType(),
                node.getParent() != null ? node.getParent().getId() : null,
                node.getLabel(),
                node.getDescription(),
                node.getAttributes(),
                node.getPositionX(),
                node.getPositionY()
        );
    }

    private void putIfNotNull(Map<String, Object> map, String key, Object value) {
        if (value != null) {
            map.put(key, value);
        }
    }
}
