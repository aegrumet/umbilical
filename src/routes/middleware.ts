import { Context } from "../../deps.ts";
import { ENABLED_FEATURES_DEFAULT } from "../env-defaults.ts";
import UmbilicalContext from "../interfaces/umbilical-context.ts";
import verifyFromHttpRequest, {
  verifyFromWebsocketRequest,
} from "../verify.ts";

export function gateFeature(feature: string) {
  return async (c: Context, next: () => Promise<void>) => {
    if (
      !(c.env.ENABLED_FEATURES ?? ENABLED_FEATURES_DEFAULT).includes(feature)
    ) {
      c.status(501);
      return c.text("Not implemented.");
    }
    await next();
  };
}

export async function authenticate(c: Context, next: () => Promise<void>) {
  if (!verifyFromHttpRequest(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  await next();
}

export async function authenticateWebsocket(
  c: Context,
  next: () => Promise<void>
) {
  if (!verifyFromWebsocketRequest(c as UmbilicalContext)) {
    c.status(401);
    return c.text("Unauthorized.");
  }
  await next();
}
