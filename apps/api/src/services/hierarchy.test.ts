import { describe, expect, it } from "vitest";
import { buildTree } from "./hierarchy.js";

describe("buildTree", () => {
  it("groups employees under reporting managers", () => {
    const tree = buildTree([
      { id: "1", employeeId: "E1", name: "Admin", designation: "CEO", department: "Exec", role: "SUPER_ADMIN", reportingManagerId: null },
      { id: "2", employeeId: "E2", name: "HR", designation: "HR", department: "People", role: "HR_MANAGER", reportingManagerId: "1" },
      { id: "3", employeeId: "E3", name: "Dev", designation: "Dev", department: "Eng", role: "EMPLOYEE", reportingManagerId: "2" }
    ]);

    expect(tree).toHaveLength(1);
    expect(tree[0].children[0].children[0].name).toBe("Dev");
  });
});
