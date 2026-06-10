'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(
                'http://localhost:8000/api/token/',
                {
                    username,
                    password,
                }
            );

            localStorage.setItem(
                'access',
                response.data.access
            );

            localStorage.setItem(
                'refresh',
                response.data.refresh
            );

            //alert('ログイン成功');
            router.push('/');
        } catch (err) {
            console.error(err);
            setError('ユーザー名またはパスワードが違います');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6">
                ログイン
            </h1>

            <form
                onSubmit={handleLogin}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="username"
                        className="block mb-1"
                    >
                        ユーザー名
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        className="w-full border p-2"
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block mb-1"
                    >
                        パスワード
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) =>
                            setPassword(e.target.value)
                        }
                        className="w-full border p-2"
                    />
                </div>

                {error && (
                    <p className="text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2"
                >
                    ログイン
                </button>
            </form>
        </div>
    );
}