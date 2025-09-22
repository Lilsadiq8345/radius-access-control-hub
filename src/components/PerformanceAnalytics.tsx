import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Clock, Users, Server, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PerformanceMetrics {
    timestamp: Date;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
    requestsPerSecond: number;
    successRate: number;
    averageResponseTime: number;
}

interface TrendData {
    label: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
}

const PerformanceAnalytics = () => {
    const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
    const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
    const [trends, setTrends] = useState<TrendData[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        generateMockData();
        const interval = setInterval(generateMockData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [timeRange]);

    const generateMockData = () => {
        const now = new Date();
        const dataPoints = timeRange === '1h' ? 60 : timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30;
        const interval = timeRange === '1h' ? 60000 : timeRange === '24h' ? 3600000 : timeRange === '7d' ? 86400000 : 86400000;

        const newMetrics: PerformanceMetrics[] = [];
        for (let i = dataPoints - 1; i >= 0; i--) {
            newMetrics.push({
                timestamp: new Date(now.getTime() - i * interval),
                cpuUsage: Math.random() * 30 + 20,
                memoryUsage: Math.random() * 20 + 60,
                diskUsage: Math.random() * 10 + 45,
                activeConnections: Math.floor(Math.random() * 50 + 10),
                requestsPerSecond: Math.random() * 100 + 50,
                successRate: Math.random() * 10 + 90,
                averageResponseTime: Math.random() * 50 + 20
            });
        }

        setMetrics(newMetrics);
        generateTrends(newMetrics);
    };

    const generateTrends = (data: PerformanceMetrics[]) => {
        const recent = data.slice(-5);
        const previous = data.slice(-10, -5);

        const calculateTrend = (recentAvg: number, previousAvg: number): TrendData['trend'] => {
            const change = ((recentAvg - previousAvg) / previousAvg) * 100;
            if (change > 5) return 'up';
            if (change < -5) return 'down';
            return 'stable';
        };

        const trends: TrendData[] = [
            {
                label: 'CPU Usage',
                value: recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length,
                change: ((recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length) -
                    (previous.reduce((sum, m) => sum + m.cpuUsage, 0) / previous.length)) /
                    (previous.reduce((sum, m) => sum + m.cpuUsage, 0) / previous.length) * 100,
                trend: calculateTrend(
                    recent.reduce((sum, m) => sum + m.cpuUsage, 0) / recent.length,
                    previous.reduce((sum, m) => sum + m.cpuUsage, 0) / previous.length
                )
            },
            {
                label: 'Memory Usage',
                value: recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
                change: ((recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length) -
                    (previous.reduce((sum, m) => sum + m.memoryUsage, 0) / previous.length)) /
                    (previous.reduce((sum, m) => sum + m.memoryUsage, 0) / previous.length) * 100,
                trend: calculateTrend(
                    recent.reduce((sum, m) => sum + m.memoryUsage, 0) / recent.length,
                    previous.reduce((sum, m) => sum + m.memoryUsage, 0) / previous.length
                )
            },
            {
                label: 'Success Rate',
                value: recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length,
                change: ((recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length) -
                    (previous.reduce((sum, m) => sum + m.successRate, 0) / previous.length)) /
                    (previous.reduce((sum, m) => sum + m.successRate, 0) / previous.length) * 100,
                trend: calculateTrend(
                    recent.reduce((sum, m) => sum + m.successRate, 0) / recent.length,
                    previous.reduce((sum, m) => sum + m.successRate, 0) / previous.length
                )
            },
            {
                label: 'Response Time',
                value: recent.reduce((sum, m) => sum + m.averageResponseTime, 0) / recent.length,
                change: ((recent.reduce((sum, m) => sum + m.averageResponseTime, 0) / recent.length) -
                    (previous.reduce((sum, m) => sum + m.averageResponseTime, 0) / previous.length)) /
                    (previous.reduce((sum, m) => sum + m.averageResponseTime, 0) / previous.length) * 100,
                trend: calculateTrend(
                    recent.reduce((sum, m) => sum + m.averageResponseTime, 0) / recent.length,
                    previous.reduce((sum, m) => sum + m.averageResponseTime, 0) / previous.length
                )
            }
        ];

        setTrends(trends);
    };

    const getTrendIcon = (trend: TrendData['trend']) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="h-4 w-4 text-green-400" />;
            case 'down':
                return <TrendingDown className="h-4 w-4 text-red-400" />;
            default:
                return <Activity className="h-4 w-4 text-blue-400" />;
        }
    };

    const getTrendColor = (trend: TrendData['trend']) => {
        switch (trend) {
            case 'up':
                return 'text-green-400';
            case 'down':
                return 'text-red-400';
            default:
                return 'text-blue-400';
        }
    };

    const currentMetrics = metrics[metrics.length - 1];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
                    <p className="text-white/60">Monitor system performance and trends</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Select value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                        <SelectTrigger className="w-32 bg-black/20 border-white/20 text-white">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                            <SelectItem value="1h">1 Hour</SelectItem>
                            <SelectItem value="24h">24 Hours</SelectItem>
                            <SelectItem value="7d">7 Days</SelectItem>
                            <SelectItem value="30d">30 Days</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Current Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            CPU Usage
                        </CardTitle>
                        <Activity className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {currentMetrics?.cpuUsage.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${currentMetrics?.cpuUsage || 0}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Memory Usage
                        </CardTitle>
                        <Server className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {currentMetrics?.memoryUsage.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${currentMetrics?.memoryUsage || 0}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Success Rate
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {currentMetrics?.successRate.toFixed(1)}%
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${currentMetrics?.successRate || 0}%` }}
                            ></div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-white/80">
                            Response Time
                        </CardTitle>
                        <Clock className="h-4 w-4 text-white/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {currentMetrics?.averageResponseTime.toFixed(0)}ms
                        </div>
                        <p className="text-xs text-white/60">
                            Average
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Trends */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Performance Trends</CardTitle>
                    <CardDescription className="text-white/60">
                        Key metrics and their recent changes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {trends.map((trend, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                            >
                                <div className="flex items-center space-x-3">
                                    {getTrendIcon(trend.trend)}
                                    <div>
                                        <h4 className="text-white font-medium">{trend.label}</h4>
                                        <p className={`text-sm ${getTrendColor(trend.trend)}`}>
                                            {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}% from previous period
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">
                                        {trend.label === 'Response Time' ? `${trend.value.toFixed(0)}ms` : `${trend.value.toFixed(1)}%`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Real-time Metrics Chart */}
            <Card className="bg-black/20 backdrop-blur-md border border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Real-time Metrics</CardTitle>
                    <CardDescription className="text-white/60">
                        Live performance data over time
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-white font-medium mb-2">CPU & Memory Usage</h4>
                                <div className="h-32 bg-white/5 rounded-lg p-4">
                                    <div className="flex items-end justify-between h-full space-x-1">
                                        {metrics.slice(-20).map((metric, index) => (
                                            <div key={index} className="flex flex-col items-center space-y-1">
                                                <div
                                                    className="w-2 bg-blue-500 rounded-t"
                                                    style={{ height: `${(metric.cpuUsage / 100) * 80}px` }}
                                                ></div>
                                                <div
                                                    className="w-2 bg-green-500 rounded-t"
                                                    style={{ height: `${(metric.memoryUsage / 100) * 80}px` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-white font-medium mb-2">Success Rate & Response Time</h4>
                                <div className="h-32 bg-white/5 rounded-lg p-4">
                                    <div className="flex items-end justify-between h-full space-x-1">
                                        {metrics.slice(-20).map((metric, index) => (
                                            <div key={index} className="flex flex-col items-center space-y-1">
                                                <div
                                                    className="w-2 bg-purple-500 rounded-t"
                                                    style={{ height: `${(metric.successRate / 100) * 80}px` }}
                                                ></div>
                                                <div
                                                    className="w-2 bg-orange-500 rounded-t"
                                                    style={{ height: `${Math.min((metric.averageResponseTime / 100) * 80, 80)}px` }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-white/60">
                            <span>CPU (Blue) | Memory (Green) | Success Rate (Purple) | Response Time (Orange)</span>
                            <span>Last 20 data points</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformanceAnalytics; 