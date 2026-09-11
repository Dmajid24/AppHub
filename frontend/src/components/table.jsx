import '../style/Table_Style.css';

function Table({
    title,
    columns = [],
    data = [],
    emptyMessage = 'Belum ada data.',
    className = 'app-table',
    onRowClick,
    rowKey = 'id',
    customBody,
    customHeader,
    rowClassName,
    wrapperClassName = 'table-card'
}) {
    return (
        <div className={wrapperClassName}>
            {title && <h2 className="table-title">{title}</h2>}

            <div className="table-wrapper">
                <table className={className}>
                    {customHeader ? (
                        customHeader
                    ) : (
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        className={col.headerClassName || ''}
                                        onClick={col.onClick ? () => col.onClick(col) : undefined}
                                        style={col.onClick ? { cursor: 'pointer' } : undefined}
                                        aria-sort={col.ariaSort}
                                    >
                                        {col.headerRender ? col.headerRender(col) : col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    )}
                    {customBody ? (
                        customBody
                    ) : (
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="table-empty">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, rowIndex) => (
                                    <tr
                                        key={row[rowKey] ?? rowIndex}
                                        className={rowClassName ? rowClassName(row, rowIndex) : ''}
                                        onClick={onRowClick ? () => onRowClick(row, rowIndex) : undefined}
                                        style={onRowClick ? { cursor: 'pointer' } : undefined}
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className={col.className || ''}>
                                                {col.render ? col.render(row, rowIndex) : row[col.key]}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    )}
                </table>
            </div>
        </div>
    );
}

export default Table;
