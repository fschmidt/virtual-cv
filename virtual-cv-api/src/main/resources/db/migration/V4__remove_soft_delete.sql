-- Remove soft delete - now using hard delete
DROP INDEX IF EXISTS idx_cv_node_deleted;
ALTER TABLE cv_node DROP COLUMN deleted;
