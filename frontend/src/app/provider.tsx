import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ErrorBoundary } from 'react-error-boundary';
import { MainErrorFallback } from "../components/errors/main";
import { queryConfig } from "../lib/react-query";
import { AuthProvider } from "@/lib/auth";
import { ToastContainer } from 'react-toastify';
import { CheckCircleIcon, AlertCircleIcon } from "@/components/ui/icons";

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: queryConfig,
    }));

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorBoundary fallback={<MainErrorFallback />}>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                    <ToastContainer 
                            position="bottom-right" 
                            autoClose={2000} 
                            hideProgressBar={true}
                            icon={({ type }) => {
                            switch (type) {
                                case 'success':
                                return <CheckCircleIcon className='w-6 h-6 text-brand-500' />;
                                case 'error':
                                return <AlertCircleIcon className='w-6 h-6 text-error-500' />;
                                default:
                                return null;
                            }
                            }}
                        />
                        {children}
                    </AuthProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        </Suspense>
    )
}