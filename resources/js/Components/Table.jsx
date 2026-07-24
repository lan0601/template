import React from 'react';

/**
 * A reusable table component.
 *
 * @param {Array} columns - Array of column definitions.
 *   - {string} key - A unique key for the column.
 *   - {string|React.ReactNode} header - The content for the table header.
 *   - {string} [accessor] - The key to access data from the row item (used if render is not provided).
 *   - {function} [render] - A function to render the cell content, receives the row item.
 *   - {string} [headerClassName] - Additional classes for the <th> element.
 *   - {string} [cellClassName] - Additional classes for the <td> element.
 * @param {Array} data - Array of data objects to display. Each object should have an `id`.
 * @param {string|React.ReactNode} [emptyState] - Content to display when data is empty.
 * @param {string} [rowClassName] - Additional classes for each <tr> element.
 * @param {function} [onRowClick] - Callback function when a row is clicked, receives the row item.
 */
export default function Table({ columns, data, emptyState, rowClassName, onRowClick }) {
    return (
        <div className="overflow-hidden bg-white shadow sm:rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    scope="col"
                                    className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${col.headerClassName || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-gray-500">
                                    {emptyState || 'No data found.'}
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className={`${rowClassName || 'hover:bg-gray-50'} ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick && onRowClick(item)}>
                                    {columns.map((col) => (
                                        <td key={col.key} className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${col.cellClassName || ''}`}>
                                            {col.render ? col.render(item) : item[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}