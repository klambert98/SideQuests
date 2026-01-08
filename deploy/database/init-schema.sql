-- ============================================================================
-- PERSONAL PORTFOLIO - DATABASE INITIALIZATION SCHEMA
-- ============================================================================
-- This script creates the base database schema for the portfolio application
-- Run this FIRST on a fresh database before applying migrations
-- ============================================================================

-- Ensure required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    name VARCHAR DEFAULT 'Admin',
    avatar VARCHAR,
    bio VARCHAR,
    role VARCHAR(20) DEFAULT 'user',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- ENTRIES TABLE (Blog Posts/Timeline Entries)
-- ============================================================================
CREATE TABLE IF NOT EXISTS entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    slug VARCHAR NOT NULL UNIQUE,
    status VARCHAR DEFAULT 'draft',
    "entryDate" DATE NOT NULL,
    summary VARCHAR,
    tags TEXT DEFAULT '',
    views INTEGER DEFAULT 0,
    "authorId" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("authorId") REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_entries_status_entryDate ON entries(status, "entryDate");
CREATE INDEX IF NOT EXISTS idx_entries_authorId_status ON entries("authorId", status);
CREATE INDEX IF NOT EXISTS idx_entries_entryDate ON entries("entryDate");
CREATE INDEX IF NOT EXISTS idx_entries_title ON entries(title);
CREATE INDEX IF NOT EXISTS idx_entries_slug ON entries(slug);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_authorId ON entries("authorId");

-- ============================================================================
-- MEDIA TABLE (Images, Videos, Documents)
-- ============================================================================
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR NOT NULL,
    "originalName" VARCHAR NOT NULL,
    mimetype VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    size INTEGER NOT NULL,
    url VARCHAR NOT NULL,
    "thumbnailUrl" VARCHAR,
    width INTEGER,
    height INTEGER,
    "entryId" UUID,
    "uploadedBy" UUID NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("entryId") REFERENCES entries(id) ON DELETE CASCADE,
    FOREIGN KEY ("uploadedBy") REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_media_entryId ON media("entryId");
CREATE INDEX IF NOT EXISTS idx_media_uploadedBy ON media("uploadedBy");
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);

-- ============================================================================
-- EMBEDS TABLE (YouTube, Instagram, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS embeds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR NOT NULL,
    url VARCHAR NOT NULL,
    "embedHtml" TEXT,
    "thumbnailUrl" VARCHAR,
    title VARCHAR,
    description TEXT,
    "entryId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("entryId") REFERENCES entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_embeds_entryId ON embeds("entryId");
CREATE INDEX IF NOT EXISTS idx_embeds_type ON embeds(type);

-- ============================================================================
-- LIKES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entryId" UUID NOT NULL,
    "sessionToken" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("entryId") REFERENCES entries(id) ON DELETE CASCADE,
    UNIQUE("entryId", "sessionToken")
);

CREATE INDEX IF NOT EXISTS idx_likes_entryId ON likes("entryId");
CREATE INDEX IF NOT EXISTS idx_likes_sessionToken ON likes("sessionToken");

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "entryId" UUID NOT NULL,
    name VARCHAR NOT NULL,
    content TEXT NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    "sessionToken" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("entryId") REFERENCES entries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_entryId ON comments("entryId");
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_sessionToken ON comments("sessionToken");

-- ============================================================================
-- BUCKET LIST ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS bucket_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    completed BOOLEAN DEFAULT FALSE,
    "parentId" UUID,
    "displayOrder" INTEGER DEFAULT 0,
    "timelineEntryId" UUID,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY ("parentId") REFERENCES bucket_list_items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bucket_list_items_userId ON bucket_list_items("userId");
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_userId_category ON bucket_list_items("userId", category);
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_userId_completed ON bucket_list_items("userId", completed);
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_parentId ON bucket_list_items("parentId");
CREATE INDEX IF NOT EXISTS idx_bucket_list_items_createdAt ON bucket_list_items("createdAt");

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
