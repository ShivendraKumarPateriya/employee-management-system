import { query } from "../db/pool.js";
import { HttpError } from "../utils/http.js";

export async function assertValidManagerAssignment(employeeId: string, managerId: string | null) {
  if (!managerId) return;
  if (employeeId === managerId) throw new HttpError(400, "Employee cannot report to themself");

  const manager = await query<{ id: string }>(
    "SELECT id FROM employees WHERE id = $1 AND deleted_at IS NULL",
    [managerId]
  );
  if (!manager.rows[0]) throw new HttpError(400, "Reporting manager does not exist");
  if (employeeId === "new") return;

  const cycle = await query<{ id: string }>(
    `
      WITH RECURSIVE manager_chain AS (
        SELECT id, reporting_manager_id
        FROM employees
        WHERE id = $1 AND deleted_at IS NULL
        UNION ALL
        SELECT e.id, e.reporting_manager_id
        FROM employees e
        INNER JOIN manager_chain mc ON e.id = mc.reporting_manager_id
        WHERE e.deleted_at IS NULL
      )
      SELECT id FROM manager_chain WHERE id = $2
    `,
    [managerId, employeeId]
  );

  if (cycle.rows.length > 0) {
    throw new HttpError(400, "Circular reporting relationship is not allowed");
  }
}

export interface TreeEmployee {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  role: string;
  reportingManagerId: string | null;
  children: TreeEmployee[];
}

export function buildTree(rows: Omit<TreeEmployee, "children">[]) {
  const byId = new Map<string, TreeEmployee>();
  const roots: TreeEmployee[] = [];

  for (const row of rows) byId.set(row.id, { ...row, children: [] });

  for (const node of byId.values()) {
    if (node.reportingManagerId && byId.has(node.reportingManagerId)) {
      byId.get(node.reportingManagerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
