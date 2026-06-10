'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import WeightChart from "@/components/WeightChart";
import api from "@/lib/axios";
import AuthGuard from '@/components/AuthGuard';

type WeightRecordType = {
    id: string;
    weight: number;
    body_fat: number;
    memo: string;
    record_date: string;
};

export default function WeightListPage() {
    const [weightRecords, setWeightRecords] = useState<WeightRecordType[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [targetWeight, setTargetWeight] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get(
                    `/api/diary/?year=${year}&month=${month}`
                );

                setWeightRecords(response.data);

            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [year, month]);

    const deleteWeightRecord = async (id: string) => {
        try {
            await api.delete(`/api/diary/${id}/`);

            setWeightRecords(
                weightRecords.filter(
                    (record) => record.id !== id
                )
            );
        } catch (error) {
            console.error(error);
        }
    };

    const prevMonth = () => {
        if (month === 1) {
            setYear(year - 1);
            setMonth(12);
        } else {
            setMonth(month - 1);
        }
    };

    const nextMonth = () => {
        if (month === 12) {
            setYear(year + 1);
            setMonth(1);
        } else {
            setMonth(month + 1);
        }
    };

    const chartData = weightRecords.map((item) => ({
        record_date: item.record_date,
        weight: Number(item.weight),
        body_fat: Number(item.body_fat),
    }));

    useEffect(() => {

        const fetchData = async () => {

            try {
                const response = await api.get(
                    "/api/height-monthly/latest/"
                );

                setTargetWeight(
                    response.data.target_weight
                );

                setHeight(
                    response.data.height_cm
                );

            } catch (error) {
                console.error(error);
            }
        };

        fetchData();

    }, []);

    const latestWeight =
        weightRecords.length > 0
            ? Number(weightRecords[0].weight)
            : null;

    const bmi =
        latestWeight && height
            ? (
                latestWeight /
                Math.pow(height / 100, 2)
            ).toFixed(1)
            : null;

    return (
        <AuthGuard>
        <div className="max-w-6xl mx-auto p-4">

            <h1 className="text-4xl font-bold mb-8">
                体重一覧
            </h1>

            {height !== null && (
                <div className="mb-4">
                    <div>身長: {height} cm</div>
                    <div>目標体重: {targetWeight}</div>
                    {bmi && <div>BMI: {bmi}</div>}
                </div>
            )}

            <div className="w-full">
                <WeightChart
                    data={chartData}
                    targetWeight={targetWeight}
                />
            </div>

            <div className="flex gap-4 mb-4">
                <button onClick={prevMonth}>
                    前月
                </button>

                <span className="font-bold text-lg">
                    {year}年{month}月
                </span>

                <button onClick={nextMonth}>
                    次月
                </button>
            </div>

            <table className="w-full border border-gray-300">
                <thead>
                <tr className="bg-gray-100">
                    <th className="border px-4 py-3 text-left">
                    体重(kg)
                    </th>

                    <th className="border px-4 py-3 text-left">
                    体脂肪率
                    </th>

                    <th className="border px-4 py-3 text-left">
                    日時
                    </th>

                    <th className="border px-4 py-3 text-left">
                    操作
                    </th>

                </tr>
                </thead>

                <tbody>
                {weightRecords.map((record) => (
                    <tr key={record.id}>
                        <td className="border px-4 py-3">
                            {record.weight}
                        </td>

                        <td className="border px-4 py-3">
                            {record.body_fat ?? "-"}
                        </td>

                        <td className="border px-4 py-3">
                            {record.record_date}
                        </td>

                        <td className="border px-4 py-3">
                            <div className="flex gap-4">

                            <Link
                                href={`/diary/${record.id}/edit`}
                                className="text-blue-600 underline"
                            >
                                編集
                            </Link>

                            <button
                                onClick={() => deleteWeightRecord(record.id)}
                                className="text-red-600"
                            >
                                削除
                            </button>

                            </div>
                        </td>

                    </tr>
                ))}
                </tbody>
            </table>
        </div>
        </AuthGuard>
    );
}

