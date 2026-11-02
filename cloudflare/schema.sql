-- MyNet module only; do not execute against production before backup/approval gates.
CREATE TABLE IF NOT EXISTS mynet_state (
  id INTEGER PRIMARY KEY CHECK(id=1),
  revision INTEGER NOT NULL CHECK(revision>=0),
  data TEXT,
  updated_at TEXT NOT NULL,
  CHECK((revision=0 AND data IS NULL) OR (revision>0 AND data IS NOT NULL AND json_valid(data)=1))
);
CREATE TABLE IF NOT EXISTS mynet_snapshots (
  revision INTEGER PRIMARY KEY CHECK(revision>0),
  data TEXT NOT NULL CHECK(json_valid(data)),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mynet_requests (
  id TEXT PRIMARY KEY,
  digest TEXT NOT NULL,
  revision INTEGER NOT NULL CHECK(revision>0)
);
INSERT OR IGNORE INTO mynet_state(id,revision,data,updated_at) VALUES(1,0,NULL,strftime('%Y-%m-%dT%H:%M:%fZ','now'));
