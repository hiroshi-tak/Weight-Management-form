'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import AuthGuard from '@/components/AuthGuard';
import axios from "axios";

export default function HeightCreatePage() {
    const router = useRouter();

    const [year, setYear] = useState(
        new Date().getFullYear()
    );

    const [month, setMonth] = useState(
        new Date().getMonth() + 1
    );

    const [heightCm, setHeightCm] =
        useState("");
    
    const [weightTarget, setWeightTarget] =
        useState("");

    const [errorMessage, setErrorMessage] = useState("");

    // 保存ボタン
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!heightCm) {
            alert("身長を入力してください");
            return;
        }

        if (!weightTarget) {
            alert("目標体重を入力してください");
            return;
        }

        try {
            await api.post("/api/height-monthly/", {
                year,
                month,
                height_cm: Number(heightCm),
                target_weight: Number(weightTarget),
            });

            alert("保存しました");
            router.push("/");

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const data = error.response?.data;

                if (data) {
                    const messages = Object.entries(data)
                        .map(([, msgs]) => {
                            if (Array.isArray(msgs)) {
                                return msgs.join("\n");
                            }
                            return String(msgs);
                        })
                        .join("\n");

                    setErrorMessage(messages);
                } else {
                    setErrorMessage("更新に失敗しました");
                }
            } else {
                setErrorMessage("更新に失敗しました");
            }
        }
    };

    return (
        <AuthGuard>
        <div className="max-w-2xl mx-auto p-4">

            <h1 className="text-2xl font-bold mb-4">身長を記載</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label>年</label>

                    <input
                        type="number"
                        value={year}
                        onChange={(e) =>
                            setYear(Number(e.target.value))
                        }
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="mb-4">
                    <label>月</label>

                    <input
                        type="number"
                        min={1}
                        max={12}
                        value={month}
                        onChange={(e) =>
                            setMonth(Number(e.target.value))
                        }
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="身長"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>
                    
                <div className="mb-4">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="目標体重"
                        value={weightTarget}
                        onChange={(e) => setWeightTarget(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    保存
                </button>

                {errorMessage && (
                <div className="mb-4 text-red-500 whitespace-pre-line">
                    {errorMessage}
                </div>
                )}

            </form>
        </div>
        </AuthGuard>
    );
}