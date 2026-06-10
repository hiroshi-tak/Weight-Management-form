'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import AuthGuard from '@/components/AuthGuard';

export default function DiaryEditPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    const [weight, setWeight] = useState("");
    const [memo, setMemo] = useState("");
    const [recordDate, setRecordDate] = useState("");
    const [bodyFat, setBodyFat] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    // 既存データ取得
    const getDiary = async () => {
        try {

            const response = await api.get(
                `/api/diary/${id}/`
            );

            setWeight(String(response.data.weight));
            setBodyFat(
                response.data.body_fat !== null
                    ? String(response.data.body_fat)
                    : ""
            );
            setMemo(response.data.memo);
            setRecordDate(response.data.record_date);

        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (id) {
            getDiary();
        }
    }, [id]);

    // 更新処理
    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        setErrorMessage("");

        if (!weight) {
            alert("体重を入力してください");
            return;
        }

        try {
            await api.patch(
                `/api/diary/${id}/`,
                {
                    weight: Number(weight),
                    body_fat: bodyFat ? Number(bodyFat) : null,
                    memo: memo,
                    record_date: recordDate,
                }
            );

            alert("更新しました");

            router.push("/diary");

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

            <div className="mb-6">
                <Link
                    href="/diary"
                    className="text-blue-600 underline"
                >
                    体重一覧へ戻る
                </Link>
            </div>

            <h1 className="text-2xl font-bold mb-4">
                体重編集
            </h1>

            <form onSubmit={handleSubmit}>

                <div className="mb-4">
                    <input
                        type="number"
                        step="0.1"
                        placeholder="体重"
                        value={weight}
                        onChange={(e) =>
                            setWeight(e.target.value)
                        }
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
                        placeholder="メモ"
                        value={memo}
                        onChange={(e) =>
                            setMemo(e.target.value)
                        }
                        className="w-full border rounded p-2 h-40"
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="date"
                        value={recordDate}
                        onChange={(e) =>
                            setRecordDate(e.target.value)
                        }
                        className="border rounded p-2"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    更新
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