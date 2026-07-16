import type { Role } from "@ems/shared";

export function canDeleteEmployee(role: Role) {
  return role === "SUPER_ADMIN";
}

export function canCreateEmployee(role: Role) {
  return role === "SUPER_ADMIN" || role === "HR_MANAGER";
}

export function canAssignRole(actorRole: Role, targetRole: Role) {
  if (actorRole === "SUPER_ADMIN") return true;
  return actorRole === "HR_MANAGER" && targetRole !== "SUPER_ADMIN";
}

export function canEditEmployee(actorRole: Role, actorId: string, employeeId: string) {
  return actorRole !== "EMPLOYEE" || actorId === employeeId;
}
