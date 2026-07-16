import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";
import { authorize } from "./auth.js";
import { HttpError } from "../utils/http.js";

describe("authorize", () => {
  it("allows matching roles", () => {
    const next = vi.fn();
    authorize("SUPER_ADMIN")({ user: { id: "1", email: "a@b.com", name: "A", role: "SUPER_ADMIN" } } as Request, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects non-matching roles", () => {
    const next = vi.fn();
    authorize("SUPER_ADMIN")({ user: { id: "1", email: "a@b.com", name: "A", role: "EMPLOYEE" } } as Request, {} as Response, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(HttpError);
    expect(next.mock.calls[0][0].status).toBe(403);
  });
});
