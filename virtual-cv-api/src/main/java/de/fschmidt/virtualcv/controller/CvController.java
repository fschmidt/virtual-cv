package de.fschmidt.virtualcv.controller;

import de.fschmidt.virtualcv.command.*;
import de.fschmidt.virtualcv.dto.CvDataDto;
import de.fschmidt.virtualcv.dto.CvNodeDto;
import de.fschmidt.virtualcv.service.CvNodeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/cv")
public class CvController {

    private final CvNodeService service;

    public CvController(CvNodeService service) {
        this.service = service;
    }

    // Queries

    @GetMapping
    public CvDataDto getAllNodes() {
        return service.getAllNodes();
    }

    @GetMapping("/nodes/{id}")
    public ResponseEntity<CvNodeDto> getNode(@PathVariable String id) {
        return service.getNode(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nodes/{id}/children")
    public List<CvNodeDto> getChildren(@PathVariable String id) {
        return service.getChildren(id);
    }

    @GetMapping("/search")
    public List<CvNodeDto> search(@RequestParam String q) {
        return service.search(q);
    }

    // Commands - Create (type-specific endpoints)

    @PostMapping("/nodes/profile")
    public ResponseEntity<CvNodeDto> createProfile(@Valid @RequestBody CreateProfileCommand command) {
        CvNodeDto created = service.create(command);
        return ResponseEntity.created(URI.create("/cv/nodes/" + created.id())).body(created);
    }

    @PostMapping("/nodes/category")
    public ResponseEntity<CvNodeDto> createCategory(@Valid @RequestBody CreateCategoryCommand command) {
        CvNodeDto created = service.create(command);
        return ResponseEntity.created(URI.create("/cv/nodes/" + created.id())).body(created);
    }

    @PostMapping("/nodes/item")
    public ResponseEntity<CvNodeDto> createItem(@Valid @RequestBody CreateItemCommand command) {
        CvNodeDto created = service.create(command);
        return ResponseEntity.created(URI.create("/cv/nodes/" + created.id())).body(created);
    }

    @PostMapping("/nodes/skill-group")
    public ResponseEntity<CvNodeDto> createSkillGroup(@Valid @RequestBody CreateSkillGroupCommand command) {
        CvNodeDto created = service.create(command);
        return ResponseEntity.created(URI.create("/cv/nodes/" + created.id())).body(created);
    }

    @PostMapping("/nodes/skill")
    public ResponseEntity<CvNodeDto> createSkill(@Valid @RequestBody CreateSkillCommand command) {
        CvNodeDto created = service.create(command);
        return ResponseEntity.created(URI.create("/cv/nodes/" + created.id())).body(created);
    }

    // Commands - Update (generic)

    @PutMapping("/nodes/{id}")
    public ResponseEntity<CvNodeDto> updateNode(
            @PathVariable String id,
            @Valid @RequestBody UpdateNodeCommand command) {
        if (!id.equals(command.id())) {
            return ResponseEntity.badRequest().build();
        }
        return service.update(command)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Commands - Delete (hard delete with cascade to children)

    @DeleteMapping("/nodes/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable String id) {
        if (service.delete(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
