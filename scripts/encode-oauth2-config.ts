/***
 * deno task encode-oauth2-config mocks/oauth2-config.json
 *
 * Encodes oauth2 config json into a base64 string for populating the
 * OAUTH2_CONFIG environment variable.
 */
import { encodeBase64Url } from "../deps.ts";
import { existsSync } from "../server_deps.ts";

import { OauthConfig, OauthConfigSchema } from "../src/interfaces/oauth2.ts";

const file = Deno.args[0];

const pathFound = existsSync(file);

if (!pathFound) {
  console.error(`File not found: ${file}`);
  Deno.exit(1);
}

const json = Deno.readFileSync(file);
const decoder = new TextDecoder("utf-8");

// deno-lint-ignore no-explicit-any
let config: any;

try {
  config = JSON.parse(decoder.decode(json));
  // deno-lint-ignore no-explicit-any
} catch (err: any) {
  console.error(`Invalid JSON: ${err.message}`);
  Deno.exit(1);
}

let oauthConfig: OauthConfig;
try {
  oauthConfig = OauthConfigSchema.parse(config);
  // deno-lint-ignore no-explicit-any
} catch (err: any) {
  console.error(`Invalid server config: ${err.message}`);
  Deno.exit(1);
}

// Should be valid input to https://deno.land/x/oauth2@v0.2.6
console.log(encodeBase64Url(JSON.stringify(oauthConfig)));
