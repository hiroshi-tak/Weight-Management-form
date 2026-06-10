'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import AuthGuard from '@/components/AuthGuard';

export default function Home() {
    const [weight, setWeight] = useState("");
    const [memo, setMemo] = useState("");
    const [currentDateTime, setCurrentDateTime] = useState("");
    const [bodyFat, setBodyFat] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const today = new Date();

    const recordDate =
    `${today.getFullYear()}-` +
    `${String(today.getMonth() + 1).padStart(2, "0")}-` +
    `${String(today.getDate()).padStart(2, "0")}`;

    // クライアント側で日時取得
    useEffect(() => {
        setCurrentDateTime(
            new Date().toLocaleString("ja-JP")
        );
    }, []);

    // 保存ボタン
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage("");

        if (!weight) {
            alert("体重を入力してください");
            return;
        }

        try {
            await api.post(
                `/api/diary/`,
                {
                    weight: weight,
                    body_fat: bodyFat ? Number(bodyFat) : null,
                    memo: memo,
                    record_date: recordDate,
                }
            );

            alert("保存しました");

            setWeight("");
            setBodyFat("");
            setMemo("");

        } catch (error: any) {
            console.error(error.response?.data);

            const data = error.response?.data;

            if (data) {
                const messages = Object.entries(data)
                    .map(([field, msgs]) => {
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
        }
    };

    return (
        <AuthGuard>
        <div className="max-w-2xl mx-auto p-4">

            <h1 className="text-2xl font-bold mb-4">体重を記載</h1>

            <p className="mb-6">{currentDateTime}</p>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="体重"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full border rounded p-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">
                        体脂肪率(%)
                    </label>

                    <input
                        type="number"
                        step="0.1"
                        value={bodyFat}
                        onChange={(e) => setBodyFat(e.target.value)}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <textarea
                        placeholder=""
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        className="w-full border rounded p-2 h-40"
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