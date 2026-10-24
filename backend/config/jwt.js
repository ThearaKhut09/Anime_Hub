// Central JWT configuration.
// The secret must come from the environment; the development fallback exists
// only so the app boots without a .env file and must never be used in production.
const envSecret = process.env.JWT_SECRET;

if (!envSecret) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"');
    }
    console.warn('⚠️  JWT_SECRET is not set - falling back to an insecure development-only secret. Never run in production without JWT_SECRET.');
}

const JWT_SECRET = envSecret || 'anime_hub_dev_only_insecure_secret_do_not_use_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

module.exports = { JWT_SECRET, JWT_EXPIRES_IN };
