import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSession } from '../../context/SessionContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import LanguageSelector from './LanguageSelector';

const Header = () => {
  const { tableNumber, isSessionActive } = useSession();
  const { items } = useCart();
  const { t } = useTranslation();
  
  // Calculate total items in cart
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary">
          {t('restaurantName')}
        </Link>
        
        <div className="flex items-center space-x-4">
          <LanguageSelector />
          
          {/* Always show cart button if there are items */}
          {(isSessionActive || cartItemCount > 0) && (
            <Link to="/cart" className="relative">
              <ShoppingCartIcon className="h-6 w-6 text-secondary" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}
          
          {isSessionActive && (
            <div className="text-sm">
              {t('tableNumber')} #{tableNumber}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;