package de.fschmidt.virtualcv.repository;

import de.fschmidt.virtualcv.domain.CvNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CvNodeRepository extends JpaRepository<CvNode, String> {

    List<CvNode> findByParentId(String parentId);

    List<CvNode> findByParentIsNull();

    @Query("SELECT n FROM CvNode n WHERE LOWER(n.label) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(n.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<CvNode> search(String query);

    List<CvNode> findByType(CvNode.NodeType type);
}
