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
    void shouldSoftDeleteNode() {
        // Given
        String id = uniqueId();
        CvNode node = new CvNode(id, NodeType.SKILL, "To Delete");
        repository.save(node);
        assertThat(repository.findActiveById(id)).isPresent();

        // When - soft delete
        node.setDeleted(true);
        repository.save(node);

        // Then - not found in active queries
        assertThat(repository.findActiveById(id)).isEmpty();
        // But still exists in database
        assertThat(repository.findById(id)).isPresent();
    }

    @Test
    void shouldSearchActiveNodes() {
        // Given - use unique search term
        String uniqueTerm = "UniqueSearchTerm" + UUID.randomUUID().toString().substring(0, 4);

        CvNode node1 = new CvNode(uniqueId(), NodeType.SKILL, uniqueTerm + " Programming");
        node1.setDescription("Development with " + uniqueTerm);
        repository.save(node1);

        CvNode deletedNode = new CvNode(uniqueId(), NodeType.SKILL, uniqueTerm + " Legacy");
        deletedNode.setDeleted(true);
        repository.save(deletedNode);

        // When
        List<CvNodeDto> results = repository.searchActive(uniqueTerm);

        // Then - should only find non-deleted node
        assertThat(results).hasSize(1);
        assertThat(results.get(0).label()).contains(uniqueTerm);
    }

    @Test
    void shouldFindAllActiveNodes() {
        // Given - count before and after
        int countBefore = repository.findAllActive().size();

        CvNode active = new CvNode(uniqueId(), NodeType.PROFILE, "New Active Node");
        repository.save(active);

        CvNode deleted = new CvNode(uniqueId(), NodeType.PROFILE, "New Deleted Node");
        deleted.setDeleted(true);
        repository.save(deleted);

        // When
        List<CvNodeDto> results = repository.findAllActive();

        // Then - should have one more than before (the active one)
        assertThat(results).hasSize(countBefore + 1);
    }

    @Test
    void shouldFindActiveChildren() {
        // Given
        String parentId = uniqueId();
        CvNode parent = new CvNode(parentId, NodeType.PROFILE, "Test Profile");
        repository.save(parent);

        CvNode activeChild = new CvNode(uniqueId(), NodeType.CATEGORY, "Active Child");
        activeChild.setParent(parent);
        repository.save(activeChild);

        CvNode deletedChild = new CvNode(uniqueId(), NodeType.CATEGORY, "Deleted Child");
        deletedChild.setParent(parent);
        deletedChild.setDeleted(true);
        repository.save(deletedChild);

        // When
        List<CvNodeDto> children = repository.findActiveByParentId(parentId);

        // Then
        assertThat(children).hasSize(1);
        assertThat(children.get(0).label()).isEqualTo("Active Child");
    }

    @Test
    void shouldLoadSeedData() {
        // Verify seed data from V3 migration is loaded
        Optional<CvNodeDto> profile = repository.findActiveById("profile");
        assertThat(profile).isPresent();
        assertThat(profile.get().label()).isEqualTo("Frank Schmidt");
        assertThat(profile.get().type()).isEqualTo(NodeType.PROFILE);

        // Verify categories exist
        List<CvNodeDto> categories = repository.findActiveByParentId("profile");
        assertThat(categories).hasSizeGreaterThanOrEqualTo(4);

        // Verify skills exist
        List<CvNodeDto> backendSkills = repository.findActiveByParentId("skill-backend");
        assertThat(backendSkills).hasSizeGreaterThanOrEqualTo(4);
    }
}
