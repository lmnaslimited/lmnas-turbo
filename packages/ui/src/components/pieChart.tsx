"use client"
import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Sector } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@repo/ui/components/ui/chart"

// Updated chart data based on your new percentages and categories
const chartData = [
    { question: "I have the skills, but where do I start?", value: 40, fill: "var(--chart-5)" },
    { question: `Can I switch fields and be valued?`, value: 25, fill: "var(--chart-4)" },
    { question: "How do I restart my career?", value: 15, fill: "var(--chart-3)" },
    { question: "Where's my next big opportunity?", value: 20, fill: "var(--chart-2)" },
]

// Updated chart config for labels and colors
const chartConfig = {
    value: {
        label: "Percentage",
    },
    start: {
        label: "Where to start",
        color: "var(--chart-5)",
    },
    switch: {
        label: "Switching fields",
        color: "var(--chart-4)",
    },
    restart: {
        label: "Restarting career",
        color: "var(--chart-3)",
    },
    opportunity: {
        label: "Finding opportunities",
        color: "var(--chart-2)",
    },
} satisfies ChartConfig

export function CarrerChart() {
    return (
        <Card className="flex flex-col bg-accent shadow-none border-none">
            <CardContent className="flex-1 pb-0">
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelKey="question"
                                    indicator="line"
                                />
                            }
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="question"
                            innerRadius={60}
                            strokeWidth={5}
                            activeIndex={0}
                            activeShape={({ outerRadius = 0, ...props }: any) => (
                                <Sector {...props} outerRadius={outerRadius + 10} />
                            )}
                        />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex flex-col gap-2 text-sm">
                {/* Legend */}
                <div className="grid grid-cols-2 gap-4">
                    {chartData.map(({ question, fill }) => (
                        <div key={question} className="flex items-center gap-2">
                            <span
                                className="block w-4 h-4 rounded-full"
                                style={{ backgroundColor: fill }}
                            />
                            <span>{question}</span>
                        </div>
                    ))}
                </div>
            </CardFooter>
        </Card>
    )
}