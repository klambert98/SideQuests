const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

const sql = `
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS moderation_reason TEXT,
ADD COLUMN IF NOT EXISTS moderated_by UUID,
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_comments_moderation_status ON comments(moderation_status);

UPDATE comments SET moderation_status = 'approved' WHERE moderation_status IS NULL;
`;

client.connect()
  .then(() => {
    console.log('Connected to database');
    return client.query(sql);
  })
  .then(() => {
    console.log('Migration completed successfully');
    return client.end();
  })
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    client.end();
    process.exit(1);
  });
