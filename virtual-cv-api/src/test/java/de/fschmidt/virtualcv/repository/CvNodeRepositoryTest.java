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

    @Test
    void shouldCreateAndReadNode() {
        // Given
        CvNode node = new CvNode("test-profile", NodeType.PROFILE, "John Doe");
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
        Optional<CvNode> found = repository.findById("test-profile");
        assertThat(found).isPresent();
        assertThat(found.get().getLabel()).isEqualTo("John Doe");
        assertThat(found.get().getType()).isEqualTo(NodeType.PROFILE);
        assertThat(found.get().getAttributes()).containsEntry("email", "john@example.com");
    }

    @Test
    void shouldCreateNodeWithParent() {
        // Given
        CvNode parent = new CvNode("profile", NodeType.PROFILE, "Frank Schmidt");
        repository.save(parent);

        CvNode child = new CvNode("work", NodeType.CATEGORY, "Work Experience");
        child.setParent(parent);

        // When
        repository.save(child);

        // Then
        List<CvNode> children = repository.findByParentId("profile");
        assertThat(children).hasSize(1);
        assertThat(children.get(0).getLabel()).isEqualTo("Work Experience");
    }

    @Test
    void shouldSoftDeleteNode() {
        // Given
        CvNode node = new CvNode("to-delete", NodeType.SKILL, "Java");
        repository.save(node);
        assertThat(repository.findActiveById("to-delete")).isPresent();

        // When - soft delete
        node.setDeleted(true);
        repository.save(node);

        // Then - not found in active queries
        assertThat(repository.findActiveById("to-delete")).isEmpty();
        // But still exists in database
        assertThat(repository.findById("to-delete")).isPresent();
    }

    @Test
    void shouldSearchActiveNodes() {
        // Given
        CvNode node1 = new CvNode("skill-java", NodeType.SKILL, "Java Programming");
        node1.setDescription("Backend development with Java");
        repository.save(node1);

        CvNode node2 = new CvNode("skill-react", NodeType.SKILL, "React");
        node2.setDescription("Frontend framework");
        repository.save(node2);

        CvNode deletedNode = new CvNode("skill-deleted", NodeType.SKILL, "Java Legacy");
        deletedNode.setDeleted(true);
        repository.save(deletedNode);

        // When
        List<CvNodeDto> results = repository.searchActive("java");

        // Then - should only find non-deleted node
        assertThat(results).hasSize(1);
        assertThat(results.get(0).id()).isEqualTo("skill-java");
    }

    @Test
    void shouldFindAllActiveNodes() {
        // Given
        CvNode active = new CvNode("active", NodeType.PROFILE, "Active Node");
        repository.save(active);

        CvNode deleted = new CvNode("deleted", NodeType.PROFILE, "Deleted Node");
        deleted.setDeleted(true);
        repository.save(deleted);

        // When
        List<CvNodeDto> results = repository.findAllActive();

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).id()).isEqualTo("active");
    }

    @Test
    void shouldFindActiveChildren() {
        // Given
        CvNode parent = new CvNode("profile", NodeType.PROFILE, "Profile");
        repository.save(parent);

        CvNode activeChild = new CvNode("work", NodeType.CATEGORY, "Work");
        activeChild.setParent(parent);
        repository.save(activeChild);

        CvNode deletedChild = new CvNode("deleted-cat", NodeType.CATEGORY, "Deleted");
        deletedChild.setParent(parent);
        deletedChild.setDeleted(true);
        repository.save(deletedChild);

        // When
        List<CvNodeDto> children = repository.findActiveByParentId("profile");

        // Then
        assertThat(children).hasSize(1);
        assertThat(children.get(0).id()).isEqualTo("work");
    }
}
