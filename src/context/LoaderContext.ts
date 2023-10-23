import { createContext } from 'react';

export const LoaderContext = createContext<{ isLoading: boolean, setIsLoading: any }>({ isLoading: false, setIsLoading: undefined });