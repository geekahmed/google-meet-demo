-- Create conversations table to store call data
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  agent_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries by agent_id
CREATE INDEX idx_conversations_agent_id ON conversations(agent_id);

-- Create index for queries by time range
CREATE INDEX idx_conversations_start_time ON conversations(start_time);
