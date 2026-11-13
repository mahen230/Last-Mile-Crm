// Browser-safe PostgreSQL schema reference string for documentation & copy-to-clipboard UI
export const POSTAL_AUTH_DATABASE_SCHEMA_SQL = `
-- 1. Dual-Tier Staff Authentication & Security Schema
CREATE TABLE staff_credentials (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL UNIQUE,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(15) NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- bcrypt (cost 12) or Argon2id
    password_salt VARCHAR(64) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'POSTMAN', -- 'POSTMAN' | 'GDS' | 'PA' | 'SPM' | 'ADMIN' | 'MASTER_ADMIN'
    assigned_beat VARCHAR(32) NOT NULL, -- e.g. 'Beat 2', 'Beat 5', 'All Beats'
    assigned_office VARCHAR(64) NOT NULL DEFAULT 'Dadabari S.O. (324009)',
    division VARCHAR(64) NOT NULL DEFAULT 'Kota Division',
    can_view_all_records BOOLEAN NOT NULL DEFAULT FALSE,
    permissions_json JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Security & Account Lockout Attributes
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE NULL,
    password_last_changed TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Two-Factor / OTP Attributes
    two_factor_secret VARCHAR(64) NULL,
    is_two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Single-Browser Active Session & Device Fingerprint Binding Table
CREATE TABLE user_sessions (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES staff_credentials(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_fingerprint_hash VARCHAR(255) NOT NULL,
    browser_profile_id VARCHAR(128) NOT NULL,
    user_agent TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_reason VARCHAR(64) NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Guarantees strictly ONE non-revoked active session per user_id across all browsers/devices
CREATE UNIQUE INDEX idx_single_active_session_per_user
  ON user_sessions(user_id)
  WHERE is_revoked = FALSE;

-- 3. Customer / Citizen Accounts Table (Tier-1 Public)
CREATE TABLE customer_citizens (
    id VARCHAR(64) PRIMARY KEY,
    mobile VARCHAR(15) UNIQUE NULL,
    email VARCHAR(255) UNIQUE NULL,
    full_name VARCHAR(128) NOT NULL,
    auth_provider VARCHAR(32) NOT NULL, -- 'GOOGLE' | 'MOBILE_OTP'
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 4. Cryptographically Secure Password Reset Tokens (Single-Use, 10-Minute TTL)
CREATE TABLE password_reset_tokens (
    id VARCHAR(64) PRIMARY KEY,
    staff_id VARCHAR(64) NOT NULL REFERENCES staff_credentials(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 5. Immutable Security Audit Log Table
CREATE TABLE security_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    event_type VARCHAR(64) NOT NULL, -- 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOCKED_OUT', 'SESSION_SUPERSEDED', 'UNAUTHORIZED_ACCESS_BLOCKED'
    employee_id VARCHAR(32) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    status_code INT NOT NULL,
    metadata JSONB NULL
);

CREATE INDEX idx_staff_emp_id ON staff_credentials(employee_id);
CREATE INDEX idx_customer_mobile ON customer_citizens(mobile);
CREATE INDEX idx_reset_token ON password_reset_tokens(token_hash);
CREATE INDEX idx_audit_time ON security_audit_logs(timestamp DESC);

-- 6. Master Admin Profile Upsert (Ekta Meena)
INSERT INTO staff_credentials (
    id, employee_id, full_name, email, mobile, password_hash, password_salt,
    role, assigned_beat, assigned_office, division, can_view_all_records, permissions_json
) VALUES (
    'STAFF-MASTER-EKTA', 'MASTER-ADMIN-01', 'Ekta Meena', 'Ektamahenmeena@gmail.com', '8279275805',
    '$argon2id$v=19$m=65536,t=3,p=4$REPLACE_WITH_PRODUCTION_HASH', 'REPLACE_WITH_SALT',
    'MASTER_ADMIN', 'All Beats', 'All Divisions / Kota Division (324009)', 'All Divisions', TRUE,
    '{"unrestricted": true, "allDivisions": true, "allBeats": true}'::jsonb
) ON CONFLICT (email) DO UPDATE SET
    full_name = 'Ekta Meena',
    mobile = '8279275805',
    role = 'MASTER_ADMIN',
    assigned_beat = 'All Beats',
    division = 'All Divisions',
    can_view_all_records = TRUE,
    permissions_json = '{"unrestricted": true, "allDivisions": true, "allBeats": true}'::jsonb,
    updated_at = NOW();

-- 7. Staff Role Refinement (Mahendra Kumar Meena strictly scoped to Beat 2 Delivery Execution)
UPDATE staff_credentials
SET
    role = 'POSTMAN',
    assigned_beat = 'Beat 2',
    assigned_office = 'Dadabari S.O. (324009)',
    division = 'Kota Division',
    can_view_all_records = FALSE,
    permissions_json = '{"scope": "BEAT_ONLY", "beat": "Beat 2", "adminAccess": false, "crossBeatAccess": false}'::jsonb,
    updated_at = NOW()
WHERE employee_id = '50457421' OR LOWER(email) = 'mahen.comtech@gmail.com';
`;
