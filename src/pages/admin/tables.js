import React, { useState, useEffect } from 'react';
import { getTables, addTable, deleteTable, updateTableStatus } from '../../services/tableService';
import { toast } from 'react-hot-toast';
import TableSessionPopup from '../../components/admin/TableSessionPopup';

const TablesManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('4');
  const [showAddForm, setShowAddForm] = useState(false);
  const [sections, setSections] = useState(['Main Floor', 'Bar Area', 'Patio', 'Private Dining']);
  const [selectedSection, setSelectedSection] = useState('All');
  const [newTableSection, setNewTableSection] = useState('Main Floor');
  const [selectedTable, setSelectedTable] = useState(null);
  const [showSessionPopup, setShowSessionPopup] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTables();
      setTables(data);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Failed to load tables: ' + (err.message || 'Unknown error'));
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    
    const tableNum = parseInt(newTableNumber);
    const capacity = parseInt(newTableCapacity);
    
    if (!newTableNumber || isNaN(tableNum) || tableNum <= 0) {
      toast.error('Please enter a valid table number');
      return;
    }
    
    if (isNaN(capacity) || capacity <= 0) {
      toast.error('Please enter a valid capacity');
      return;
    }
    
    try {
      await addTable({ 
        table_number: tableNum,
        section: newTableSection,
        capacity: capacity,
        status: 'Available'
      });
      setNewTableNumber('');
      setNewTableCapacity('4');
      setShowAddForm(false);
      toast.success(`Table ${tableNum} added successfully`);
      fetchTables();
    } catch (err) {
      console.error('Error adding table:', err);
      toast.error(err.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (tableId, tableNumber) => {
    if (window.confirm(`Are you sure you want to delete Table ${tableNumber}?`)) {
      try {
        await deleteTable(tableId);
        toast.success(`Table ${tableNumber} deleted successfully`);
        fetchTables();
      } catch (err) {
        console.error('Error deleting table:', err);
        toast.error(err.message || 'Failed to delete table');
      }
    }
  };

  // Filter tables by section
  const filteredTables = selectedSection === 'All' 
    ? tables 
    : tables.filter(table => table.section === selectedSection);

  // Get status color
  const getStatusColor = (status) => {
    return status === 'Available' ? 'text-green-600' : 'text-red-600';
  };

  const getTableBgColor = (status) => {
    return status === 'Available' 
      ? 'bg-white hover:shadow-lg cursor-pointer' 
      : 'bg-gray-100 cursor-not-allowed';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Table Management</h1>
      
      {/* Section filter and Add Table button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${selectedSection === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedSection('All')}
          >
            All
          </button>
          {sections.map(section => (
            <button
              key={section}
              className={`px-4 py-2 rounded-md ${selectedSection === section ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setSelectedSection(section)}
            >
              {section}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Add Table
        </button>
      </div>
      
      {/* Add Table Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Add New Table</h2>
          
          <form onSubmit={handleAddTable} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="tableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number
                </label>
                <input
                  type="number"
                  id="tableNumber"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  min="1"
                  max="20"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">
                  Section
                </label>
                <select
                  id="section"
                  className="w-full px-4 py-2 border border-gray border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value)}
                >
                  {sections.map(section => (
                    <option key={section} value={section}>{section}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Add Table
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-200 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      {error && (
        <div className="mb-6 text-red-600 p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      {/* Tables Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tables found. Add some tables to get started.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map(table => (
            <div 
              key={table.id}
              onClick={() => {
                setSelectedTable(table);
                setShowSessionPopup(true);
              }}
              className={`rounded-lg shadow-md p-6 flex flex-col items-center justify-center transition-all ${getTableBgColor(table.status)}`}
            >
              <div className="text-2xl font-bold mb-1">Table {table.table_number}</div>
              <div className="text-sm text-gray-500 mb-1">{table.section}</div>
              <div className="text-xs text-gray-400 mb-2">Capacity: {table.capacity}</div>
              
              {/* Status indicator */}
              <div className={`text-sm font-semibold mb-3 ${getStatusColor(table.status)}`}>
                {table.status}
              </div>
              
              {/* Status indicator dot */}
              <div className={`w-3 h-3 rounded-full mb-3 ${
                table.status === 'Available' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent opening session
                  handleDeleteTable(table.id, table.table_number);
                }}
                className="text-xs text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      <TableSessionPopup
        isOpen={showSessionPopup}
        onClose={() => setShowSessionPopup(false)}
        table={selectedTable}
        onSessionStart={fetchTables}
        onSessionEnd={fetchTables}
      />
    </div>
  );
};

export default TablesManagement;