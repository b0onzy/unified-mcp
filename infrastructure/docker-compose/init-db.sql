-- Initialize UCP database with pgvector extension and basic schema

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create schema for UCP
CREATE SCHEMA IF NOT EXISTS ucp;

-- Set search path
SET search_path TO ucp, public;

-- Create memory_entries table
CREATE TABLE IF NOT EXISTS memory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL,
    project VARCHAR(100) NOT NULL,
    task_id VARCHAR(100),
    branch VARCHAR(250) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536), -- OpenAI ada-002 dimension
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_memory_entries_project ON memory_entries(project);
CREATE INDEX IF NOT EXISTS idx_memory_entries_branch ON memory_entries(branch);
CREATE INDEX IF NOT EXISTS idx_memory_entries_type ON memory_entries(type);
CREATE INDEX IF NOT EXISTS idx_memory_entries_timestamp ON memory_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_memory_entries_status ON memory_entries(status);
CREATE INDEX IF NOT EXISTS idx_memory_entries_task_id ON memory_entries(task_id);

-- Create vector index for semantic search
CREATE INDEX IF NOT EXISTS idx_memory_entries_embedding ON memory_entries 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create GIN index for JSONB content
CREATE INDEX IF NOT EXISTS idx_memory_entries_content ON memory_entries USING GIN(content);
CREATE INDEX IF NOT EXISTS idx_memory_entries_metadata ON memory_entries USING GIN(metadata);

-- Create array index for tags
CREATE INDEX IF NOT EXISTS idx_memory_entries_tags ON memory_entries USING GIN(tags);

-- Create projects table for project metadata
CREATE TABLE IF NOT EXISTS projects (
    name VARCHAR(100) PRIMARY KEY,
    description TEXT,
    repository_url VARCHAR(500),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create branches table for branch metadata
CREATE TABLE IF NOT EXISTS branches (
    project VARCHAR(100) NOT NULL REFERENCES projects(name) ON DELETE CASCADE,
    name VARCHAR(250) NOT NULL,
    parent_branch VARCHAR(250),
    purpose TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project, name)
);

-- Create memory_stats table for analytics
CREATE TABLE IF NOT EXISTS memory_stats (
    id SERIAL PRIMARY KEY,
    project VARCHAR(100) NOT NULL,
    branch VARCHAR(250),
    entry_type VARCHAR(50),
    count INTEGER NOT NULL DEFAULT 0,
    total_size BIGINT NOT NULL DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project, branch, entry_type, date)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_memory_entries_updated_at 
    BEFORE UPDATE ON memory_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update memory stats
CREATE OR REPLACE FUNCTION update_memory_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily stats
    INSERT INTO memory_stats (project, branch, entry_type, count, total_size, date)
    VALUES (
        NEW.project, 
        NEW.branch, 
        NEW.type, 
        1, 
        pg_column_size(NEW.content),
        CURRENT_DATE
    )
    ON CONFLICT (project, branch, entry_type, date)
    DO UPDATE SET 
        count = memory_stats.count + 1,
        total_size = memory_stats.total_size + pg_column_size(NEW.content);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for memory stats
CREATE TRIGGER update_memory_stats_trigger
    AFTER INSERT ON memory_entries
    FOR EACH ROW EXECUTE FUNCTION update_memory_stats();

-- Create some initial data for development
INSERT INTO projects (name, description, repository_url) 
VALUES 
    ('ucp-dev', 'UCP Development Project', 'https://github.com/yourusername/unified-context-protocol')
ON CONFLICT (name) DO NOTHING;

INSERT INTO branches (project, name, purpose)
VALUES 
    ('ucp-dev', 'main', 'Main development branch'),
    ('ucp-dev', 'feature/memory-server', 'Memory server implementation'),
    ('ucp-dev', 'feature/mcp-integration', 'MCP protocol integration')
ON CONFLICT (project, name) DO NOTHING;

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON SCHEMA ucp TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ucp TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA ucp TO postgres;