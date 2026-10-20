import React from "react";
import { Inbox } from "lucide-react";

export interface AdminTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right" | "center";
  width?: string;
  className?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface AdminTableProps<T> {
  columns: AdminTableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyState?: {
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  onRowClick?: (item: T) => void;
  className?: string;
  /**
   * Option pour afficher une vue liste simple sur mobile au lieu du tableau horizontal
   */
  mobileRenderer?: (item: T, index: number) => React.ReactNode;
}

export function AdminTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  onRowClick,
  className = "",
  mobileRenderer,
}: AdminTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className={`rounded-[8px] border border-[#23272d] bg-[#111315] p-10 text-center ${className}`}>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-[6px] border border-white/5 bg-white/[0.02] text-zinc-400">
          <Inbox size={18} strokeWidth={1.75} />
        </div>
        <h4 className="mt-3 text-sm font-medium text-[#f0f2f5]">
          {emptyState?.title || "Aucun élément"}
        </h4>
        {emptyState?.description && (
          <p className="mt-1 text-xs text-[#9aa1ad] max-w-sm mx-auto leading-relaxed">
            {emptyState.description}
          </p>
        )}
        {emptyState?.action && <div className="mt-4">{emptyState.action}</div>}
      </div>
    );
  }

  return (
    <div className={`rounded-[8px] border border-[#23272d] bg-[#111315] overflow-hidden ${className}`}>
      {/* Vue mobile optionnelle en liste propre */}
      {mobileRenderer ? (
        <div className="divide-y divide-[#1e2226] md:hidden">
          {data.map((item, index) => (
            <div
              key={keyExtractor(item, index)}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? "cursor-pointer transition-colors hover:bg-[#16191c]" : ""}
            >
              {mobileRenderer(item, index)}
            </div>
          ))}
        </div>
      ) : null}

      {/* Tableau standard avec défilement horizontal fluide */}
      <div className={`overflow-x-auto ${mobileRenderer ? "hidden md:block" : "block"}`}>
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[#23272d] bg-[#0c0d0f]/80 text-xs font-medium text-[#9aa1ad]">
              {columns.map((col) => {
                const alignClass =
                  col.align === "right"
                    ? "text-right"
                    : col.align === "center"
                    ? "text-center"
                    : "text-left";
                return (
                  <th
                    key={col.key}
                    scope="col"
                    style={{ width: col.width }}
                    className={`py-3 px-4 font-medium tracking-normal text-xs text-[#9aa1ad] ${alignClass} ${col.className || ""}`}
                  >
                    {col.header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2226] text-sm text-[#f0f2f5]">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                onClick={() => onRowClick?.(item)}
                className={`transition-colors hover:bg-[#16191c]/70 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === "right"
                      ? "text-right admin-tabular-nums"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left";
                  return (
                    <td
                      key={col.key}
                      className={`py-3.5 px-4 text-xs sm:text-sm text-[#f0f2f5] align-middle ${alignClass} ${col.className || ""}`}
                    >
                      {col.render
                        ? col.render(item, index)
                        : (item as Record<string, unknown>)[col.key] != null
                        ? String((item as Record<string, unknown>)[col.key])
                        : "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
