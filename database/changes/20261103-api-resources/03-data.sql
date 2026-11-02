-- Bindings: next local revision, complete validated domains JSON.
-- Exact domains are stored in encrypted after-domains.json.enc.
INSERT INTO snapshots(revision,data) VALUES (?,?);
