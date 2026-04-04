import { describe, expect, it } from "vitest";

import { authDatabaseConfig } from "./auth-config";

describe("authDatabaseConfig", () => {
  it("maps Better Auth verification storage to the Prisma verification model", () => {
    expect(authDatabaseConfig.provider).toBe("postgresql");
    expect(authDatabaseConfig.verification?.modelName).toBe("verification");
    expect("usePlural" in authDatabaseConfig).toBe(false);
  });
});
