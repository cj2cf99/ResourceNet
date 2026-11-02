PRAGMA integrity_check;
PRAGMA foreign_key_check;
SELECT revision,data FROM snapshots ORDER BY revision DESC LIMIT 1;
-- Executor must compare revision and content hash with the backed-up manifest.
