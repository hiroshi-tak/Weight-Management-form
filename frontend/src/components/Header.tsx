'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');

        router.push('/login');
    };

    return (
        <header className="bg-blue-500 text-white">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link
                    href="/diary"
                    className="text-xl font-bold"
                >
                    Weight Manager
                </Link>

                <nav className="flex gap-6 items-center">
                    <Link href="/">
                        トップページ
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="bg-white text-blue-500 px-3 py-1 rounded"
                    >
                        ログアウト
                    </button>
                </nav>
            </div>
        </header>
    );
}