import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

type AppContextType = {
  roles: string[];
};

// Giá trị mặc định
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [roles] = useState(JSON.parse(localStorage.getItem('permissions')! ?? '["TEST"]'));

  return <AppContext.Provider value={{ roles }}>{children}</AppContext.Provider>;
};

// Hook để dùng context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
