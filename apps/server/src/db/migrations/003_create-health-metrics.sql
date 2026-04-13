CREATE TYPE metric_type AS ENUM ('heart_rate', 'steps', 'sleep', 'calories', 'exercise');

CREATE TABLE health_metrics (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    device_id               UUID REFERENCES devices(id) ON DELETE SET NULL,
    metric_type             metric_type NOT NULL,
    numeric_value           DOUBLE PRECISION,
    encrypted_data          TEXT,
    encryption_key_version  INTEGER DEFAULT 1,
    recorded_at             TIMESTAMPTZ NOT NULL,
    synced_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata                JSONB DEFAULT '{}'::jsonb,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_metrics_user_type_time ON health_metrics(user_id, metric_type, recorded_at DESC);
CREATE INDEX idx_health_metrics_recorded_at ON health_metrics(recorded_at DESC);
CREATE UNIQUE INDEX idx_health_metrics_dedup ON health_metrics(user_id, device_id, metric_type, recorded_at);
