-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create locations table
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    latitude FLOAT,
    longitude FLOAT,
    tags TEXT[],
    rating FLOAT,
    notes TEXT,
    photos TEXT[],
    visit_history JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX locations_user_id_idx ON locations(user_id);
CREATE INDEX locations_created_at_idx ON locations(created_at);

-- Set up Row Level Security (RLS)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own locations
CREATE POLICY "Users can view their own locations"
ON locations
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own locations
CREATE POLICY "Users can insert their own locations"
ON locations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own locations
CREATE POLICY "Users can update their own locations"
ON locations
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own locations
CREATE POLICY "Users can delete their own locations"
ON locations
FOR DELETE
USING (auth.uid() = user_id);

