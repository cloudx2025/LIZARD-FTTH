import { createContext, useContext, useState, ReactNode } from 'react';

interface RouteDrawingContextType {
  isDrawing: boolean;
  currentRoute: [number, number][];
  startDrawing: () => void;
  stopDrawing: () => void;
  addPoint: (point: [number, number]) => void;
  removePoint: (index: number) => void;
  clearRoute: () => void;
}

const RouteDrawingContext = createContext<RouteDrawingContextType | undefined>(undefined);

export function RouteDrawingProvider({ children }: { children: ReactNode }) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<[number, number][]>([]);

  const startDrawing = () => {
    setIsDrawing(true);
    setCurrentRoute([]);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const addPoint = (point: [number, number]) => {
    setCurrentRoute(prev => [...prev, point]);
  };

  const removePoint = (index: number) => {
    setCurrentRoute(prev => prev.filter((_, i) => i !== index));
  };

  const clearRoute = () => {
    setCurrentRoute([]);
  };

  return (
    <RouteDrawingContext.Provider
      value={{
        isDrawing,
        currentRoute,
        startDrawing,
        stopDrawing,
        addPoint,
        removePoint,
        clearRoute,
      }}
    >
      {children}
    </RouteDrawingContext.Provider>
  );
}

export function useRouteDrawing() {
  const context = useContext(RouteDrawingContext);
  if (context === undefined) {
    throw new Error('useRouteDrawing must be used within a RouteDrawingProvider');
  }
  return context;
}
