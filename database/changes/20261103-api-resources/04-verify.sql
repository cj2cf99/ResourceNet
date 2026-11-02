PRAGMA integrity_check;
PRAGMA foreign_key_check;
SELECT revision,data FROM snapshots ORDER BY revision DESC LIMIT 1;
-- Executor verifies exact content, all original elements and relations unchanged,
-- unchanged domain metadata, plus domain model and privacy validation.
