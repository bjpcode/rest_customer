import Link from 'next/link';

const TableStatusCard = ({ tableNumber, isActive, startTime }) => {
  return (
    <Link href={`/admin/tables?table=${tableNumber}`}>
      <div 
        className={`p-3 rounded-lg shadow text-center ${
          isActive ? 'bg-green-50 border border-green-200' : 'bg-white'
        }`}
      >
        <div className="text-lg font-medium">Table {tableNumber}</div>
        <div className={`text-sm ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
        {isActive && startTime && (
          <div className="text-xs text-gray-500 mt-1">
            Since: {startTime}
          </div>
        )}
      </div>
    </Link>
  );
};

export default TableStatusCard;