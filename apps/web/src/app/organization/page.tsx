"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { OrgTree, type TreeEmployee } from "@/components/OrgTree";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

export default function OrganizationPage() {
  const [tree, setTree] = useState<TreeEmployee[]>([]);

  useEffect(() => {
    apiFetch<{ tree: TreeEmployee[] }>("/organization/tree").then((payload) => setTree(payload.tree));
  }, []);

  return (
    <AppShell>
      <PageHeader title="Organization Tree" eyebrow="Reporting Structure" />
      <OrgTree nodes={tree} />
    </AppShell>
  );
}
