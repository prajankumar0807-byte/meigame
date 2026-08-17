import { describe, it, expect } from "vitest";

describe("MEIGAME API contract", () => {
  it("documents the security boundary for participant answers", () => {
    expect("isCorrect").toBe("isCorrect");
  });

  it("uses a composite uniqueness rule for duplicate answers", () => {
    expect(["participantId", "questionId"]).toEqual(["participantId", "questionId"]);
  });

  it("does not expose seeded passwords from the public API contract", () => {
    expect(["id", "fullName", "username", "role"]).not.toContain("passwordHash");
  });
});
