import { describe, expect, it } from "vitest";

import { authDatabaseConfig } from "./auth-config";

describe("authDatabaseConfig", () => {
  it("maps Better Auth verification storage to the Prisma verificationToken model", () => {
    expect(authDatabaseConfig.provider).toBe("postgresql");
    expect(authDatabaseConfig.verification?.modelName).toBe("verificationToken");
    expect("usePlural" in authDatabaseConfig).toBe(false);
  });
});
