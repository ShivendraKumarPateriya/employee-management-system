import { describe, expect, it } from "vitest";
import { canAssignRole, canCreateEmployee, canDeleteEmployee } from "./permissions";

describe("permissions", () => {
  it("restricts destructive actions to super admins", () => {
    expect(canDeleteEmployee("SUPER_ADMIN")).toBe(true);
    expect(canDeleteEmployee("HR_MANAGER")).toBe(false);
  });

  it("prevents HR from assigning super admin", () => {
    expect(canCreateEmployee("HR_MANAGER")).toBe(true);
    expect(canAssignRole("HR_MANAGER", "SUPER_ADMIN")).toBe(false);
    expect(canAssignRole("SUPER_ADMIN", "SUPER_ADMIN")).toBe(true);
  });
});
