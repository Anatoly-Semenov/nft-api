import * as dotenv from 'dotenv';
import DbConfig from './db.config';

dotenv.config();

const {
  TWITTER_BOT_TOKEN = '',
  TWITTER_BOT_API_KEY = '',
  TWITTER_BOT_API_KEY_SECRET = '',
  TELEGRAM_API_ID = '',
  TELEGRAM_API_HASH = '',
} = process.env;

if (!TWITTER_BOT_TOKEN) {
  throw new Error('TWITTER_BOT_TOKEN is undefined.');
}

if (!TWITTER_BOT_API_KEY) {
  throw new Error('TWITTER_BOT_API_KEY is undefined.');
}

if (!TWITTER_BOT_API_KEY_SECRET) {
  throw new Error('TWITTER_BOT_API_KEY_SECRET is undefined.');
}

if (!TELEGRAM_API_ID) {
  throw new Error('TELEGRAM_API_ID is undefined.');
}

if (!TELEGRAM_API_HASH) {
  throw new Error('TELEGRAM_API_HASH is undefined.');
}

// @todo: Should be deep frozen.
export default () => ({
  port: parseInt(process.env.PORT) || 3000,
  mode: process.env.MODE || 'PROD',
  isCronJobsEnabled: !!parseInt(process.env.ENABLE_CRON_JOBS) || false,
  isParserCronJobsEnabled:
    !!parseInt(process.env.ENABLE_PARSER_CRON_JOBS) || false,
  isParserSolanaCronJobsEnabled:
    !!parseInt(process.env.ENABLE_PARSER_SOLANA_CRON_JOBS) || false,
  airdropMaticNetwork: process.env.AIRDROP_MATIC_NETWORK,
  infuraApiKey: process.env.INFURA_API_KEY,
  database: {
    ...DbConfig(),
  },
  socials: {
    twitter: {
      bearerToken: TWITTER_BOT_TOKEN,
      apiKey: TWITTER_BOT_API_KEY,
      apiKeySecret: TWITTER_BOT_API_KEY_SECRET,
    },
    telegram: {
      apiId: +TELEGRAM_API_ID,
      apiHash: TELEGRAM_API_HASH,
      session: '',
    },
  },
});
