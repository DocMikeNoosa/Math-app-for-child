// Which Claude endpoint the server uses:
//   AI_PROVIDER=anthropic (default) — Anthropic API (ANTHROPIC_API_KEY)
//   AI_PROVIDER=bedrock             — Claude on Amazon Bedrock in an EU region (AWS_REGION, e.g. eu-central-1 =
//                                     Frankfurt); data processed in the EU. Uses the standard AWS credentials.
import { AsyncLocalStorage } from 'node:async_hooks';
import Anthropic from '@anthropic-ai/sdk';
import { AnthropicBedrockMantle } from '@anthropic-ai/bedrock-sdk';

export const PROVIDER = process.env.AI_PROVIDER === 'bedrock' ? 'bedrock' : 'anthropic';
const BASE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
// Bedrock model ids carry an "anthropic." prefix.
export const MODEL = PROVIDER === 'bedrock' && !BASE_MODEL.startsWith('anthropic.') ? `anthropic.${BASE_MODEL}` : BASE_MODEL;
// Server-side refusal fallback and fast output mode exist only on the Anthropic API.
export const SUPPORTS_FALLBACKS = PROVIDER === 'anthropic' && process.env.CLAUDE_FALLBACKS !== '0';
export const SUPPORTS_FAST = PROVIDER === 'anthropic';

// Friend accounts: their requests run with their own Anthropic API key (and pay for themselves).
const scope = new AsyncLocalStorage();
export function withOwnKey(apiKey, fn) {
  return scope.run({ client: new Anthropic({ apiKey }), model: BASE_MODEL }, fn);
}
export const usingOwnKey = () => Boolean(scope.getStore()?.client);
export const currentModel = () => scope.getStore()?.model || MODEL;
export const supportsFallbacks = () => (usingOwnKey() ? process.env.CLAUDE_FALLBACKS !== '0' : SUPPORTS_FALLBACKS);
export const supportsFast = () => usingOwnKey() || SUPPORTS_FAST;

let client = null;
export function getClient() {
  const own = scope.getStore()?.client;
  if (own) return own;
  if (!client) client = PROVIDER === 'bedrock' ? new AnthropicBedrockMantle({ awsRegion: process.env.AWS_REGION || 'eu-central-1' }) : new Anthropic();
  return client;
}

export function aiConfigured() {
  if (PROVIDER === 'bedrock') return Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_WEB_IDENTITY_TOKEN_FILE || process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI);
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * What is wrong with a friend's own key, in plain Polish (null = not a key problem: busy, network, our side).
 * Anthropic answers 401 for a wrong / disabled / expired key, 400 for no credit or a key that needs a workspace,
 * 403 when the key's account may not use the API.
 */
export const BILLING_URL = 'https://platform.claude.com/settings/billing';
/** The friend's API account has no money left (a top-up fixes it). */
export function isCreditProblem(err) {
  const msg = String(err?.error?.error?.message || err?.message || '').toLowerCase();
  return err?.status === 400 && /credit|balance|billing/.test(msg);
}
export function ownKeyProblem(err) {
  const msg = String(err?.error?.error?.message || err?.message || '').toLowerCase();
  if (err?.status === 401) return 'Ten klucz nie działa — jest błędny, wyłączony albo wygasł. Utwórz nowy klucz (ważność: „Never”) i wklej go ponownie.';
  if (isCreditProblem(err)) return 'Skończyły się środki na Twoim koncie API. Doładuj je (jak telefon na kartę): platform.claude.com → Settings → Billing → Buy credits.';
  if (err?.status === 400 && /workspace/.test(msg)) return 'Ten klucz nie jest przypisany do jednego workspace. Utwórz nowy klucz i przy tworzeniu wybierz workspace „Default”.';
  if (err?.status === 403) return 'Konto API tego klucza nie ma uprawnień. Sprawdź konto na platform.claude.com albo utwórz klucz jako jego właściciel.';
  if (err?.status === 404 && /model/.test(msg)) return 'Konto API tego klucza nie ma dostępu do potrzebnego modelu AI. Sprawdź konto na platform.claude.com.';
  return null;
}

/** Try a friend's key with the smallest possible request (1 token, a fraction of a cent on their account). */
export async function checkOwnKey(apiKey) {
  try {
    await new Anthropic({ apiKey, maxRetries: 0, timeout: 20_000 }).messages.create({ model: BASE_MODEL, max_tokens: 1, messages: [{ role: 'user', content: 'OK' }] });
    return { ok: true };
  } catch (err) {
    const problem = ownKeyProblem(err);
    return problem ? { ok: false, problem, credit: isCreditProblem(err) } : { ok: true, unchecked: true };
  }
}
