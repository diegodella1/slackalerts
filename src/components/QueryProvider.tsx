'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

// Price fetching context
interface PriceContextType {
  currentPrice: number | null
  isAutoFetching: boolean
  toggleAutoFetch: () => void
  lastUpdate: Date | null
  error: string | null
  startAutoFetch: () => void
  stopAutoFetch: () => void
}

const PriceContext = createContext<PriceContextType | undefined>(undefined)

export function usePriceContext() {
  const context = useContext(PriceContext)
  if (context === undefined) {
    throw new Error('usePriceContext must be used within a PriceProvider')
  }
  return context
}

function PriceProvider({ children }: { children: ReactNode }) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [isAutoFetching, setIsAutoFetching] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null)

  const startAutoFetch = useCallback(() => {
    if (isAutoFetching) return;
    
    setIsAutoFetching(true);
    localStorage.setItem('autoFetchEnabled', 'true');
    
    // Start the interval
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/fetch-price');
        if (response.ok) {
          const data = await response.json();
          setCurrentPrice(data.price);
          setLastUpdate(new Date());
          setError(null);
        } else {
          setError('Failed to fetch price');
        }
      } catch {
        setError('Network error');
      }
    }, 30000); // 30 seconds
    
    setIntervalId(interval);
  }, [isAutoFetching]);

  const stopAutoFetch = useCallback(() => {
    setIsAutoFetching(false);
    localStorage.setItem('autoFetchEnabled', 'false');
    
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  const toggleAutoFetch = useCallback(() => {
    if (isAutoFetching) {
      stopAutoFetch();
    } else {
      startAutoFetch();
    }
  }, [isAutoFetching, startAutoFetch, stopAutoFetch]);

  // Initialize auto-fetch on mount
  useEffect(() => {
    const savedState = localStorage.getItem('autoFetchEnabled');
    if (savedState === 'true') {
      startAutoFetch();
    }
  }, [startAutoFetch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
  }, [intervalId])

  // Handle page visibility changes to pause/resume when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📱 Page hidden - continuing auto-fetch in background')
      } else {
        console.log('📱 Page visible - auto-fetch active')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const value: PriceContextType = {
    currentPrice,
    isAutoFetching,
    toggleAutoFetch,
    lastUpdate,
    error,
    startAutoFetch,
    stopAutoFetch,
  }

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  )
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PriceProvider>
        {children}
      </PriceProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
} 