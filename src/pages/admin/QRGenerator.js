import React from 'react';
import QRCode from 'react-qr-code';
import { getTables } from '../../services/tableService';

const QRGenerator = () => {
  const [tables, setTables] = useState([]);
  
  useEffect(() => {
    getTables().then(setTables);
  }, []);
  
  const handlePrint = () => {
    window.print();
  };
  
  return (
    <div className="p-8">
      <button onClick={handlePrint} className="mb-4 bg-blue-600 text-white px-4 py-2 rounded no-print">
        Print All QR Codes
      </button>
      
      <div className="grid grid-cols-3 gap-8">
        {tables.map(table => (
          <div key={table.id} className="text-center p-4 border">
            <h3 className="font-bold mb-2">Table {table.table_number}</h3>
            <QRCode value={`${window.location.origin}/menu?table=${table.table_number}`} size={150} />
            <p className="mt-2 text-sm">{table.section}</p>
          </div>
        ))}
      </div>
    </div>
  );
};