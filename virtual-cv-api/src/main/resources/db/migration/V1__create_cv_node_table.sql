-- CV Node table with self-referencing parent
CREATE TABLE cv_node (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    parent_id VARCHAR(50) REFERENCES cv_node(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    attributes JSONB,
    position_x INTEGER,
    position_y INTEGER
);

-- Index for parent lookups (finding children)
CREATE INDEX idx_cv_node_parent_id ON cv_node(parent_id);

-- Index for type filtering
CREATE INDEX idx_cv_node_type ON cv_node(type);

-- GIN index for JSONB attributes
CREATE INDEX idx_cv_node_attributes ON cv_node USING GIN (attributes);
