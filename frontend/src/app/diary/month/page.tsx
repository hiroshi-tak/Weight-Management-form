'use client';

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import AuthGuard from '@/components/AuthGuard';

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

type MonthlyDataType = {
    month: number;
    avg: number;
};

export default function WeightListPage() {
    const [year, setYear] = useState(
        new Date().getFullYear()
    );

    const [monthlyData, setMonthlyData] = useState<MonthlyDataType[]>([]);

    useEffect(() => {
        if (!year) return;

        const fetchData = async () => {
            try {
                const res = await api.get(
                    `/api/diary/monthly-averages/?year=${year}`
                );

                setMonthlyData(res.data);

            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [year]);

    const prevYear = () => {
        setYear((prev) => prev - 1);
    };

    const nextYear = () => {
        setYear((prev) => prev + 1);
    };

    return (
        <AuthGuard>
        <div className="max-w-6xl mx-auto p-4">

            <h1 className="text-4xl font-bold mb-8">
                体重一覧
            </h1>

            <div className="w-full">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="avg" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mb-4">
                <button onClick={prevYear}>
                    前年
                </button>

                <span className="font-bold text-lg">
                    {year}年
                </span>

                <button onClick={nextYear}>
                    次年
                </button>
            </div>

            <table className="w-full mt-4 table-fixed border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="w-1/2 text-center py-2">月</th>
                        <th className="w-1/2 text-center py-2">平均体重</th>
                    </tr>
                </thead>

                <tbody>
                    {monthlyData.map((item) => (
                        <tr key={item.month} className="border-t">
                            <td className="text-center py-2">{item.month}</td>
                            <td className="text-center py-2">
                                {(item.avg ?? 0).toFixed(1)} kg
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        </AuthGuard>
    );
}

