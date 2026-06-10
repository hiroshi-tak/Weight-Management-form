'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

type Props = {
    children: React.ReactNode;
};

export default function AuthGuard({
    children,
}: Props) {
    const router = useRouter();

    const [isAuthenticated, setIsAuthenticated] =
        useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access');

            if (!token) {
                router.replace('/login');
                setIsAuthenticated(false);
                return;
            }

            try {
                await api.get('/api/me/');

                setIsAuthenticated(true);

            } catch {
                localStorage.removeItem('access');
                localStorage.removeItem('refresh');

                router.replace('/login');
            }
        };

        checkAuth();
    }, [router]);

    if (isAuthenticated === null) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}