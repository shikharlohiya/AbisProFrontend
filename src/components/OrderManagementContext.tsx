'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface OrderManagementContextType {
  selectedOrderId: string;
  setSelectedOrderId: (orderId: string) => void;
  selectOrder: (orderId: string) => void;
  isOrderSelected: (orderId: string) => boolean;
}

const OrderManagementContext = createContext<OrderManagementContextType | undefined>(undefined);

export const useOrderManagement = () => {
  const context = useContext(OrderManagementContext);
  if (!context) {
    throw new Error('useOrderManagement must be used within OrderManagementProvider');
  }
  return context;
};

interface OrderManagementProviderProps {
  children: ReactNode;
}

export const OrderManagementProvider: React.FC<OrderManagementProviderProps> = ({ children }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-001');

  const selectOrder = useCallback((orderId: string) => {
    console.log('📋 OrderManagement: Selecting order:', orderId);
    setSelectedOrderId(orderId);

    // Auto-scroll functionality with modern practices
    requestAnimationFrame(() => {
      setTimeout(() => {
        const orderInfoElement = document.getElementById('order-info-component');
        if (orderInfoElement) {
          orderInfoElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start',
            inline: 'nearest'
          });
          console.log('📍 OrderManagement: Scrolled to OrderInfo');
        }
      }, 100);
    });
  }, []);

  const isOrderSelected = useCallback((orderId: string) => {
    return selectedOrderId === orderId;
  }, [selectedOrderId]);

  const value = {
    selectedOrderId,
    setSelectedOrderId,
    selectOrder,
    isOrderSelected
  };

  return (
    <OrderManagementContext.Provider value={value}>
      {children}
    </OrderManagementContext.Provider>
  );
};
