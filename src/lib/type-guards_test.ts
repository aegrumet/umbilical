import {
  validRegisterPutInput,
  invalidRegisterPutInput,
  validPushSubscription,
  invalidPushSubscription,
} from "../../mocks/push-subscription.ts";
import {
  isPushSubscription,
  isRegisterDeleteInput,
  isRegisterPutInput,
} from "./type-guards.ts";
import { describe, it, expect } from "../../dev_deps.ts";

describe("Type Guards", () => {
  it("should validate a valid pushSubscription", () => {
    const result = isPushSubscription(validPushSubscription);
    expect(result).toEqual(true);
  });
  it("should invalidate a invalid pushSubscription", () => {
    const result = isPushSubscription(invalidPushSubscription);
    expect(result).toEqual(false);
  });
  it("should validate a valid registerPutInput", () => {
    const result = isRegisterPutInput(validRegisterPutInput);
    expect(result).toEqual(true);
  });
  it("should invalidate a invalid registerPutInput", () => {
    const result = isRegisterPutInput(invalidRegisterPutInput);
    expect(result).toEqual(false);
  });
  it("should validate a valid registerDeleteInput", () => {
    const result = isRegisterDeleteInput(validRegisterPutInput);
    expect(result).toEqual(true);
  });
  it("should invalidate a invalid registerDeleteInput", () => {
    const result = isRegisterDeleteInput(invalidRegisterPutInput);
    expect(result).toEqual(false);
  });
});
