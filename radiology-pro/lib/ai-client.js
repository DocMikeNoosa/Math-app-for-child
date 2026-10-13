// Which Claude endpoint the server uses:
//   AI_PROVIDER=anthropic (default) — Anthropic API (ANTHROPIC_API_KEY)
//   AI_PROVIDER=bedrock             — Claude on Amazon Bedrock in an EU region (AWS_REGION, e.g. eu-central-1 =
//                                     Frankfurt); data processed in the EU. Uses the standard AWS credentials.
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk';

export const PROVIDER = process.env.AI_PROVIDER === 'bedrock' ? 'bedrock' : 'anthropic';
const BASE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
// Bedrock model ids carry an "anthropic." prefix.
export const MODEL = PROVIDER === 'bedrock' && !BASE_MODEL.startsWith('anthropic.') ? `anthropic.${BASE_MODEL}` : BASE_MODEL;
// Server-side refusal fallback and fast output mode exist only on the Anthropic API.
export const SUPPORTS_FALLBACKS = PROVIDER === 'anthropic' && process.env.CLAUDE_FALLBACKS !== '0';
export const SUPPORTS_FAST = PROVIDER === 'anthropic';

let client = null;
export function getClient() {
  if (!client) client = PROVIDER === 'bedrock' ? new AnthropicBedrockMantle({ awsRegion: process.env.AWS_REGION || 'eu-central-1' }) : new Anthropic();
  return client;
}

export function aiConfigured() {
  if (PROVIDER === 'bedrock') return Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_WEB_IDENTITY_TOKEN_FILE || process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI);
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}
