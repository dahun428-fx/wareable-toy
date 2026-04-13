CREATE TYPE device_platform AS ENUM ('ios_healthkit', 'android_health_connect', 'samsung_health');

CREATE TABLE devices (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform        device_platform NOT NULL,
    device_name     VARCHAR(255),
    device_model    VARCHAR(255),
    last_synced_at  TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, platform, device_name)
);

CREATE INDEX idx_devices_user_id ON devices(user_id);
