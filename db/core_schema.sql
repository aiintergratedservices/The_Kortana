-- KORTANA OMNIPRESENT REAL-TIME STATE MACHINE SCHEMA V1.0

-- Extensions (Required)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Standard Enumerations (Data Integrity)
CREATE TYPE task_status AS ENUM ('active', 'backlog', 'completed', 'abandoned');
CREATE TYPE focus_type AS ENUM ('coding', 'strategy', 'communications', 'administration', 'personal');
CREATE TYPE operational_platform AS ENUM ('desktop', 'mobile', 'iot_nest', 'system');
CREATE TYPE distraction_rating AS ENUM ('minimal', 'moderate', 'high', 'fracturing');

-- Unified Task Repository
CREATE TABLE IF NOT EXISTS unified_tasks (
    id SERIAL PRIMARY KEY,
    owner_user_id UUID DEFAULT uuid_generate_v4(), -- Prepares for multi-tenant, if needed
    title VARCHAR(255) NOT NULL,
    description TEXT,
    focus_category focus_type NOT NULL DEFAULT 'strategy',
    status task_status DEFAULT 'backlog',
    creation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_update_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completion_timestamp TIMESTAMP WITH TIME ZONE
);

-- Cross-Platform State Machine (The Nudge Engine)
CREATE TABLE IF NOT EXISTS user_focus_state (
    id SERIAL PRIMARY KEY,
    owner_user_id UUID DEFAULT uuid_generate_v4(),
    platform operational_platform NOT NULL,
    current_active_task_id INT REFERENCES unified_tasks(id), -- Null if drifting
    active_application_or_url VARCHAR(255),
    distraction_level distraction_rating DEFAULT 'minimal',
    focus_duration_minutes INT DEFAULT 0, -- Active focus time
    last_observed_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Brain Dump / Idea Validator Table (Where she vets your ideas)
CREATE TABLE IF NOT EXISTS project_pitches (
    id SERIAL PRIMARY KEY,
    owner_user_id UUID DEFAULT uuid_generate_v4(),
    raw_idea_text TEXT NOT NULL,
    kortana_verdict TEXT, -- Her critique and counter-proposal
    validation_status VARCHAR(50) DEFAULT 'under_review',
    creation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_focus_state_platform ON user_focus_state (platform);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON unified_tasks (status);
CREATE INDEX IF NOT EXISTS idx_user_state_activity ON user_focus_state (last_observed_activity);
