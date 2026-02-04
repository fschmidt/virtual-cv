package de.fschmidt.virtualcv.repository;

import de.fschmidt.virtualcv.domain.CvNode;
import de.fschmidt.virtualcv.domain.CvNode.NodeType;
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
    void shouldDeleteNode() {
        // Given
        CvNode node = new CvNode("to-delete", NodeType.SKILL, "Java");
        repository.save(node);
        assertThat(repository.findById("to-delete")).isPresent();

        // When
        repository.deleteById("to-delete");

        // Then
        assertThat(repository.findById("to-delete")).isEmpty();
    }

    @Test
    void shouldSearchNodes() {
        // Given
        CvNode node1 = new CvNode("skill-java", NodeType.SKILL, "Java Programming");
        node1.setDescription("Backend development with Java");
        repository.save(node1);

        CvNode node2 = new CvNode("skill-react", NodeType.SKILL, "React");
        node2.setDescription("Frontend framework");
        repository.save(node2);

        // When
        List<CvNode> results = repository.search("java");

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo("skill-java");
    }

    @Test
    void shouldFindRootNodes() {
        // Given
        CvNode root = new CvNode("profile", NodeType.PROFILE, "Profile");
        repository.save(root);

        CvNode child = new CvNode("work", NodeType.CATEGORY, "Work");
        child.setParent(root);
        repository.save(child);

        // When
        List<CvNode> roots = repository.findByParentIsNull();

        // Then
        assertThat(roots).hasSize(1);
        assertThat(roots.get(0).getId()).isEqualTo("profile");
    }
}
