import Link from 'next/link';

const RecentOrdersList = ({ orders }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'served':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No recent orders
      </div>
    );
  }

  return (
    <div className="divide-y">
      {orders.map(order => (
        <Link 
          key={order.id} 
          href={`/admin/orders?order=${order.id}`}
          className="block py-3 hover:bg-gray-50"
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="font-medium">Table {order.table_number}</div>
              <div className="text-sm text-gray-500">
                {new Date(order.created_at).toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <div className="ml-4 text-lg font-medium">${order.total_amount.toFixed(2)}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default RecentOrdersList;