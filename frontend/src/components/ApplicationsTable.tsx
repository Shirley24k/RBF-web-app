import React from "react";

export interface ApplicationsTableColumn {
  id: string;
  header: React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface ApplicationsTableProps<Row> {
  rows: Row[];
  keyFor: (row: Row, index: number) => string | number;
  // Desktop
  columns: ApplicationsTableColumn[];
  renderCell: (row: Row, columnId: string, index: number) => React.ReactNode;
  // Tablet 
  tabletColumns: ApplicationsTableColumn[];
  renderTabletCell: (row: Row, columnId: string, index: number) => React.ReactNode;
  // Mobile
  mobileColumns: ApplicationsTableColumn[];
  renderMobileCell: (row: Row, columnId: string, index: number) => React.ReactNode;
  // Empty state
  emptyState?: React.ReactNode;
}

export function ApplicationsTable<Row>(props: ApplicationsTableProps<Row>) {
  const {
    rows,
    keyFor,
    columns,
    renderCell,
    tabletColumns,
    renderTabletCell,
    mobileColumns,
    renderMobileCell,
    emptyState,
  } = props;

  const hasRows = Array.isArray(rows) && rows.length > 0;

  if (!hasRows && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.id)}
                  className={[
                    col.className || "",
                    col.align === "center"
                      ? "px-6 py-4 text-center"
                      : col.align === "right"
                      ? "px-6 py-4 text-right"
                      : "px-6 py-4 text-left",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr
                key={String(keyFor(row, index))}
                className="hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.id)}
                    className={[
                      col.align === "center"
                        ? "px-6 py-4 text-center"
                        : col.align === "right"
                        ? "px-6 py-4 text-right"
                        : "px-6 py-4",
                    ].join(" ")}
                  >
                    {renderCell(row, col.id, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet View */}
      <div className="hidden md:block lg:hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {tabletColumns.map((col) => (
                <th
                  key={String(col.id)}
                  className={[
                    col.className || "",
                    col.align === "center"
                      ? "px-4 py-3 text-center"
                      : col.align === "right"
                      ? "px-4 py-3 text-right"
                      : "px-4 py-3 text-left",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr
                key={String(keyFor(row, index))}
                className="hover:bg-gray-50"
              >
                {tabletColumns.map((col) => (
                  <td
                    key={String(col.id)}
                    className={[
                      col.align === "center"
                        ? "px-4 py-4 text-center"
                        : col.align === "right"
                        ? "px-4 py-4 text-right"
                        : "px-4 py-4",
                    ].join(" ")}
                  >
                    {renderTabletCell(row, col.id, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {mobileColumns.map((col) => (
                <th
                  key={String(col.id)}
                  className={[
                    col.className || "",
                    col.align === "center"
                      ? "px-4 py-3 text-center"
                      : col.align === "right"
                      ? "px-4 py-3 text-right"
                      : "px-4 py-3 text-left",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr
                key={String(keyFor(row, index))}
                className="hover:bg-gray-50"
              >
                {mobileColumns.map((col) => (
                  <td
                    key={String(col.id)}
                    className={[
                      col.align === "center"
                        ? "px-4 py-4 text-center"
                        : col.align === "right"
                        ? "px-4 py-4 text-right"
                        : "px-4 py-4",
                    ].join(" ")}
                  >
                    {renderMobileCell(row, col.id, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ApplicationsTable;


