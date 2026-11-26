import ky from 'ky';

/**
 * Shared HTTP client: timeout and retries (ky retries idempotent methods only). One instance per API:
 *
 *   const github = api.extend({ baseUrl: 'https://api.github.com/' });
 *   const repo = await github.get(`repos/${name}`).json(Repo); // Repo: zod schema → validated, typed result
 *
 * Errors: HTTPError / TimeoutError (ky), SchemaValidationError (response did not match the schema).
 */
export const api = ky.create({
  timeout: 15_000,
  retry: { limit: 2 },
});
