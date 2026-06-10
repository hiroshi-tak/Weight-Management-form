export type Diary = {
    record_date: string;
    weight: number;
};

type MonthlyMap = {
    [month: number]: {
        sum: number;
        count: number;
    };
};

export function getMonthlyAverages(
    data: Diary[],
    year: number
) {
    const map: MonthlyMap = {};

    data.forEach((item) => {
        const date = new Date(item.record_date);

        if (date.getFullYear() !== year) return;

        const month = date.getMonth() + 1;

        if (!map[month]) {
            map[month] = { sum: 0, count: 0 };
        }

        map[month].sum += Number(item.weight);
        map[month].count += 1;
    });

    return Array.from({ length: 12 }, (_, i) => {
        const m = i + 1;
        const v = map[m];

        return {
            month: `${m}月`,
            avg: v ? v.sum / v.count : 0,
        };
    });
}