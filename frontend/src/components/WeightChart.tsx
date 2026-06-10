'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

type Diary = {
    record_date: string;
    weight: number;
};

type Props = {
    data: Diary[];
    targetWeight: number;
};

export default function WeightChart({ data, targetWeight }: Props) {
    const weights = data.map(item => item.weight);

    const minValue =
        weights.length > 0
            ? Math.min(...weights, targetWeight)
            : targetWeight;

    const maxValue =
        weights.length > 0
            ? Math.max(...weights, targetWeight)
            : targetWeight;

    return (
        <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
            {/* 補助線（縦横グリッド） */}
            <CartesianGrid strokeDasharray="3 3" />

            {/* 横軸：月日表示 */}
            <XAxis
                dataKey="record_date"
                tickFormatter={(value: string | number) => {
                    const d = new Date(value);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
            />

            <YAxis
                domain={[
                    Math.floor(minValue - 2),
                    Math.ceil(maxValue + 2),
                ]}
            />

            <Tooltip
                labelFormatter={(label: string | number) => {
                    const d = new Date(label);
                    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                }}
            />

            {/* 実線 */}
            <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"   // 青系
                strokeWidth={2}
                dot={false}        // プロットなし（点消す）
                activeDot={{ r: 5 }}
            />

            {/* 目標体重ライン */}
            <ReferenceLine
                y={targetWeight}
                label="目標体重"
                stroke="green"
                strokeDasharray="4 4"
            />
            </LineChart>
        </ResponsiveContainer>
        </div>
    );
}