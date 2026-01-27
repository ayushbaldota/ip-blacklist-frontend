import Table from '../common/Table'
import IPRow from './IPRow'
import Loading from '../common/Loading'

function IPTable({ ips, isLoading, onDelete }) {
  if (isLoading) {
    return <Loading text="Loading IPs..." />
  }

  if (!ips || ips.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No IP addresses found</p>
        <p className="text-sm text-gray-400 mt-1">Add some IPs to start monitoring</p>
      </div>
    )
  }

  return (
    <Table>
      <Table.Head>
        <Table.Header>IP Address</Table.Header>
        <Table.Header>Status</Table.Header>
        <Table.Header>Description</Table.Header>
        <Table.Header>Last Checked</Table.Header>
        <Table.Header>Listings</Table.Header>
        <Table.Header className="w-24">Actions</Table.Header>
      </Table.Head>
      <Table.Body>
        {ips.map((ip) => (
          <IPRow key={ip.id} ip={ip} onDelete={onDelete} />
        ))}
      </Table.Body>
    </Table>
  )
}

export default IPTable
