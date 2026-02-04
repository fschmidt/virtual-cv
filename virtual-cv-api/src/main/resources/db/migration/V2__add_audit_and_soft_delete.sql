-- Add soft delete and audit columns
ALTER TABLE cv_node ADD COLUMN deleted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE cv_node ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE cv_node ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW();

-- Index for filtering out deleted nodes
CREATE INDEX idx_cv_node_deleted ON cv_node(deleted) WHERE deleted = false;
