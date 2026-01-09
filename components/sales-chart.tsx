'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface SalesChartProps {
    data: { date: string; amount: number }[]
}

export function SalesChart({ data }: SalesChartProps) {
    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}€`}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-popover border rounded-lg shadow-lg p-2">
                                        <p className="text-sm font-medium">{payload[0].payload.date}</p>
                                        <p className="text-sm text-primary font-bold">
                                            {Number(payload[0].value).toFixed(2)} €
                                        </p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#colorAmount)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

interface TransactionTypePieProps {
    sales: number
    gifts: number
}

const COLORS = ['hsl(var(--primary))', 'hsl(142.1 76.2% 36.3%)']

export function TransactionTypePie({ sales, gifts }: TransactionTypePieProps) {
    const data = [
        { name: 'Ventes', value: sales },
        { name: 'Dons', value: gifts }
    ]

    return (
        <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="bg-popover border rounded-lg shadow-lg p-2">
                                        <p className="text-sm">{payload[0].name}: {payload[0].value}</p>
                                    </div>
                                )
                            }
                            return null
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
