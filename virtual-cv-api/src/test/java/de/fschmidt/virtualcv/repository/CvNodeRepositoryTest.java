package de.fschmidt.virtualcv.repository;

import de.fschmidt.virtualcv.domain.CvNode;
import de.fschmidt.virtualcv.domain.CvNode.NodeType;
import de.fschmidt.virtualcv.dto.CvNodeDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class CvNodeRepositoryTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private CvNodeRepository repository;

    private String uniqueId() {
        return "test-" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Test
    void shouldCreateAndReadNode() {
        // Given
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.PROFILE, "John Doe");
        node.setDescription("Software Developer");
        node.setAttributes(Map.of(
            "email", "john@example.com",
            "location", "Berlin"
        ));
        node.setPositionX(400);
        node.setPositionY(300);

        // When
        repository.save(node);

        // Then
        Optional<CvNode> found = repository.findById(id);
        assertThat(found).isPresent();
        assertThat(found.get().getLabel()).isEqualTo("John Doe");
        assertThat(found.get().getType()).isEqualTo(NodeType.PROFILE);
        assertThat(found.get().getAttributes()).containsEntry("email", "john@example.com");
    }

    @Test
    void shouldCreateNodeWithParent() {
        // Given
        String parentId = uniqueId();
        String childId = uniqueId();

        CvNode parent = new CvNode(parentId, NodeType.PROFILE, "Test Parent");
        repository.save(parent);

        CvNode child = new CvNode(childId, NodeType.CATEGORY, "Test Child");
        child.setParent(parent);

        // When
        repository.save(child);

        // Then
        List<CvNode> children = repository.findByParentId(parentId);
        assertThat(children).hasSize(1);
        assertThat(children.get(0).getLabel()).isEqualTo("Test Child");
    }

    @Test
    void shouldHardDeleteNode() {
        // Given
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.SKILL, "To Delete");
        repository.save(node);
        assertThat(repository.findById(id)).isPresent();

        // When - hard delete
        repository.delete(node);

        // Then - completely gone from database
        assertThat(repository.findById(id)).isEmpty();
        assertThat(repository.findByIdAsDto(id)).isEmpty();
    }

    @Test
    void shouldSearchNodes() {
        // Given - use unique search term
        String uniqueTerm = "UniqueSearchTerm" + UUID.randomUUID().toString().substring(0, 4);

        CvNode node1 = new CvNode(uniqueId(), NodeType.SKILL, uniqueTerm + " Programming");
        node1.setDescription("Development with " + uniqueTerm);
        repository.save(node1);

        CvNode node2 = new CvNode(uniqueId(), NodeType.SKILL, "Unrelated Node");
        repository.save(node2);

        // When
        List<CvNodeDto> results = repository.search(uniqueTerm);

        // Then - should find the matching node
        assertThat(results).hasSize(1);
        assertThat(results.get(0).label()).contains(uniqueTerm);
    }

    @Test
    void shouldFindAllNodes() {
        // Given - count before and after
        int countBefore = repository.findAllAsDto().size();

        CvNode node1 = new CvNode(uniqueId(), NodeType.PROFILE, "New Node 1");
        repository.save(node1);

        CvNode node2 = new CvNode(uniqueId(), NodeType.PROFILE, "New Node 2");
        repository.save(node2);

        // When
        List<CvNodeDto> results = repository.findAllAsDto();

        // Then - should have two more than before
        assertThat(results).hasSize(countBefore + 2);
    }

    @Test
    void shouldFindChildren() {
        // Given
        String parentId = uniqueId();
        CvNode parent = new CvNode(parentId, NodeType.PROFILE, "Test Profile");
        repository.save(parent);

        CvNode child1 = new CvNode(uniqueId(), NodeType.CATEGORY, "Child 1");
        child1.setParent(parent);
        repository.save(child1);

        CvNode child2 = new CvNode(uniqueId(), NodeType.CATEGORY, "Child 2");
        child2.setParent(parent);
        repository.save(child2);

        // When
        List<CvNodeDto> children = repository.findByParentIdAsDto(parentId);

        // Then
        assertThat(children).hasSize(2);
    }

    @Test
    void shouldLoadSeedData() {
        // Verify seed data from V3 migration is loaded
        Optional<CvNodeDto> profile = repository.findByIdAsDto("profile");
        assertThat(profile).isPresent();
        assertThat(profile.get().label()).isEqualTo("Frank Schmidt");
        assertThat(profile.get().type()).isEqualTo(NodeType.PROFILE);

        // Verify categories exist
        List<CvNodeDto> categories = repository.findByParentIdAsDto("profile");
        assertThat(categories).hasSizeGreaterThanOrEqualTo(4);

        // Verify skills exist
        List<CvNodeDto> backendSkills = repository.findByParentIdAsDto("skill-backend");
        assertThat(backendSkills).hasSizeGreaterThanOrEqualTo(4);
    }

    // ============================================================
    // Draft Mode Tests
    // ============================================================

    @Test
    void shouldStoreIsDraftInAttributes() {
        // Given
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.ITEM, "Draft Item");
        node.setAttributes(Map.of(
            "isDraft", true,
            "company", "Test Company"
        ));

        // When
        repository.save(node);

        // Then
        Optional<CvNode> found = repository.findById(id);
        assertThat(found).isPresent();
        assertThat(found.get().getAttributes()).containsEntry("isDraft", true);
        assertThat(found.get().getAttributes()).containsEntry("company", "Test Company");
    }

    @Test
    void shouldPublishNodeBySettingIsDraftFalse() {
        // Given - create a draft node
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.ITEM, "Draft Item");
        node.setAttributes(Map.of(
            "isDraft", true,
            "company", "Test Company",
            "dateRange", "2020-2024"
        ));
        repository.save(node);

        // When - publish by merging isDraft: false
        CvNode saved = repository.findById(id).orElseThrow();
        Map<String, Object> updatedAttrs = new java.util.HashMap<>(saved.getAttributes());
        updatedAttrs.put("isDraft", false);
        saved.setAttributes(updatedAttrs);
        repository.save(saved);

        // Then - isDraft is false but other attributes are preserved
        CvNode published = repository.findById(id).orElseThrow();
        assertThat(published.getAttributes()).containsEntry("isDraft", false);
        assertThat(published.getAttributes()).containsEntry("company", "Test Company");
        assertThat(published.getAttributes()).containsEntry("dateRange", "2020-2024");
    }

    @Test
    void shouldReturnDraftNodesInAllQueries() {
        // Given - draft nodes are stored like any other node
        String id = uniqueId();
        CvNode draftNode = new CvNode(id, NodeType.SKILL, "Draft Skill");
        draftNode.setAttributes(Map.of("isDraft", true));
        repository.save(draftNode);

        // Then - draft nodes are returned in all queries (filtering happens in frontend)
        assertThat(repository.findById(id)).isPresent();
        assertThat(repository.findByIdAsDto(id)).isPresent();

        // Search should also find draft nodes
        List<CvNodeDto> searchResults = repository.search("Draft Skill");
        assertThat(searchResults).anyMatch(dto -> dto.id().equals(id));
    }

    @Test
    void shouldPreserveAttributesWhenUpdatingDraftStatus() {
        // Given - a node with multiple attributes
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.ITEM, "Job Title");
        node.setAttributes(Map.of(
            "company", "Acme Corp",
            "dateRange", "2020-Present",
            "location", "Berlin",
            "isDraft", true
        ));
        repository.save(node);

        // When - update only isDraft (simulating publish)
        CvNode existing = repository.findById(id).orElseThrow();
        Map<String, Object> attrs = new java.util.HashMap<>(existing.getAttributes());
        attrs.put("isDraft", false);
        existing.setAttributes(attrs);
        repository.save(existing);

        // Then - all other attributes are preserved
        CvNode updated = repository.findById(id).orElseThrow();
        Map<String, Object> updatedAttrs = updated.getAttributes();
        assertThat(updatedAttrs).containsEntry("company", "Acme Corp");
        assertThat(updatedAttrs).containsEntry("dateRange", "2020-Present");
        assertThat(updatedAttrs).containsEntry("location", "Berlin");
        assertThat(updatedAttrs).containsEntry("isDraft", false);
    }
}
