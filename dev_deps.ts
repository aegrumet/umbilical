import { assertEquals } from "jsr:@std/assert@^1.0.9";
export { assertEquals };

import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "jsr:@std/testing@^1.0.6/bdd";
export { afterAll, afterEach, beforeAll, beforeEach, describe, it };

// Upgrade to 1.0.x needs work
export { FakeTime } from "jsr:@std/testing@^0.225.3/time";

import {
  assertSpyCall,
  assertSpyCalls,
  returnsNext,
  spy,
  type Stub,
  stub,
} from "jsr:@std/testing@^1.0.6/mock";
export { assertSpyCall, assertSpyCalls, returnsNext, spy, type Stub, stub };

export { EventEmitter } from "https://deno.land/x/event@2.0.1/mod.ts";
export { expect } from "jsr:@std/expect@^1.0.10";

import * as mf from "https://deno.land/x/mock_fetch@0.3.0/mod.ts";
export { mf };
