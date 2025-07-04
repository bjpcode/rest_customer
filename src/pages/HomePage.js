import React from 'react';
import { useSession } from '../context/SessionContext';
import TableSelection from '../components/TableSelection';
import MenuList from '../components/menu/MenuList';

const HomePage = () => {
  const { isActive } = useSession();

  return (
    <div className="min-h-screen flex flex-col">
      {!isActive ? (
        <TableSelection />
      ) : (
        <MenuList />
      )}
    </div>
  );
};

export default HomePage;