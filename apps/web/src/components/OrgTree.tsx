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

export function OrgTree({ nodes }: { nodes: TreeEmployee[] }) {
  if (!nodes.length) return <p className="panel p-5 text-[var(--muted)]">No organization data yet.</p>;

  return (
    <ul className="grid gap-3">
      {nodes.map((node) => (
        <li key={node.id} className="panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-black">{node.name}</p>
              <p className="text-sm text-[var(--muted)]">
                {node.designation} · {node.department}
              </p>
            </div>
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold">{node.role.replaceAll("_", " ")}</span>
          </div>
          {node.children.length ? (
            <div className="ml-4 mt-3 border-l border-[var(--border)] pl-4">
              <OrgTree nodes={node.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
