function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        {children}
      </table>
    </div>
  )
}

function TableHead({ children }) {
  return (
    <thead className="bg-gray-50">
      <tr>{children}</tr>
    </thead>
  )
}

function TableHeader({ children, className = '' }) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${className}`}
    >
      {children}
    </th>
  )
}

function TableBody({ children }) {
  return (
    <tbody className="divide-y divide-gray-200 bg-white">
      {children}
    </tbody>
  )
}

function TableRow({ children, className = '', onClick }) {
  return (
    <tr
      className={`${onClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

function TableCell({ children, className = '' }) {
  return (
    <td className={`whitespace-nowrap px-6 py-4 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  )
}

Table.Head = TableHead
Table.Header = TableHeader
Table.Body = TableBody
Table.Row = TableRow
Table.Cell = TableCell

export default Table
