'use client';

import Link from "next/link";
import AuthGuard from '@/components/AuthGuard';
import { useState } from "react";
import api from "@/lib/axios";


export default function DiaryListPage() {
    const [analysis, setAnalysis] =
        useState("");

    const getAnalysis = async () => {
        try {
            const res = await api.get(
                "/api/ai-analysis/"
            );

            setAnalysis(
                res.data.analysis
            );
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthGuard>
        <div className="max-w-md mx-auto flex flex-col gap-4">
            <h1>トップページ</h1>

            <Link href= "/height/create" className="text-blue-600 underline">
                身長登録
            </Link>

            <Link href= "/diary/create" className="text-blue-600 underline">
                体重登録
            </Link>

            <Link href="/diary" className="text-blue-600 underline">
                体重一覧(月)
            </Link>
                    
            <Link href="/diary/month" className="text-blue-600 underline">
                体重一覧(年)
            </Link>

            <button
                onClick={getAnalysis}
                className="
                    bg-blue-500
                    text-white
                    px-4
                    py-2
                    rounded
                    mb-4
                "
            >
                AI分析
            </button>
                
            {analysis && (
                <div
                    className="
                        border
                        rounded
                        p-4
                        bg-gray-50
                        mb-4
                        whitespace-pre-line
                    "
                >
                    {analysis}
                </div>
            )}
        </div>
        </AuthGuard>
    );
}