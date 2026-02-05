package de.fschmidt.virtualcv.repository;

import de.fschmidt.virtualcv.domain.CvNode;
import de.fschmidt.virtualcv.dto.CvNodeDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvNodeRepository extends JpaRepository<CvNode, String> {

    // Entity queries (for commands)
    List<CvNode> findByParentId(String parentId);

    List<CvNode> findByParentIsNull();

    List<CvNode> findByType(CvNode.NodeType type);

    // DTO queries (for reads)
    @Query("""
            SELECT new de.fschmidt.virtualcv.dto.CvNodeDto(
                n.id, n.type, n.parent.id, n.label, n.description,
                n.attributes, n.positionX, n.positionY
            )
            FROM CvNode n
            ORDER BY n.createdAt
            """)
    List<CvNodeDto> findAllAsDto();

    @Query("""
            SELECT new de.fschmidt.virtualcv.dto.CvNodeDto(
                n.id, n.type, n.parent.id, n.label, n.description,
                n.attributes, n.positionX, n.positionY
            )
            FROM CvNode n
            WHERE n.id = :id
            """)
    Optional<CvNodeDto> findByIdAsDto(String id);

    @Query("""
            SELECT new de.fschmidt.virtualcv.dto.CvNodeDto(
                n.id, n.type, n.parent.id, n.label, n.description,
                n.attributes, n.positionX, n.positionY
            )
            FROM CvNode n
            WHERE n.parent.id = :parentId
            ORDER BY n.createdAt
            """)
    List<CvNodeDto> findByParentIdAsDto(String parentId);

    @Query("""
            SELECT new de.fschmidt.virtualcv.dto.CvNodeDto(
                n.id, n.type, n.parent.id, n.label, n.description,
                n.attributes, n.positionX, n.positionY
            )
            FROM CvNode n
            WHERE LOWER(n.label) LIKE LOWER(CONCAT('%', :query, '%'))
               OR LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%'))
            """)
    List<CvNodeDto> search(String query);
}
