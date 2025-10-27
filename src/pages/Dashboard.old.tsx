import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Receipt,
  Package,
  Users,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '@/services/api';
import type { DashboardStats, Order } from '@/types';
import { DashboardLayout } from '@/components/DashboardLayout';

// Mock data for revenue chart
const revenueData = [
  { month: 'Jan', 2024: 25, 2023: 20 },
  { month: 'Feb', 2024: 30, 2023: 25 },
  { month: 'Mar', 2024: 28, 2023: 22 },
  { month: 'Apr', 2024: 35, 2023: 28 },
  { month: 'May', 2024: 32, 2023: 26 },
  { month: 'Jun', 2024: 38, 2023: 30 },
  { month: 'Jul', 2024: 40, 2023: 32 },
];

// Mock data for profile report
const profileData = [
  { month: 'Jan', value: 65 },
  { month: 'Feb', value: 59 },
  { month: 'Mar', value: 80 },
  { month: 'Apr', value: 81 },
  { month: 'May', value: 76 },
  { month: 'Jun', value: 85 },
  { month: 'Jul', value: 90 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalWashermen: 0,
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashboardStats, orders] = await Promise.all([
        api.getDashboardStats(),
        api.getAllOrders(),
      ]);
      setStats(dashboardStats);
      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate order statistics for pie chart
  const orderStatistics = [
    { name: 'Pending', value: stats.pendingOrders, color: '#3b82f6' },
    { name: 'In Progress', value: stats.inProgressOrders, color: '#f59e0b' },
    { name: 'Completed', value: stats.completedOrders, color: '#10b981' },
  ];

  // Calculate growth percentage (mock)
  const growthPercentage = 78;
  const companyGrowth = 62;

  return (
    <DashboardLayout>
      <div className="h-full w-full space-y-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your business.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={fetchDashboardData} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-2 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Top Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Revenue / Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalStudents}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+72.80%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Sales / Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalOrders}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+28.42%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Payments / Pending */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.pendingOrders}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                <span className="text-red-500">-14.82%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          {/* Transactions / Washermen */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Washermen</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalWashermen}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500">+28.14%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Revenue Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>Comparing 2023 vs 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="2024" fill="#6366f1" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="2023" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Gauge */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Growth</CardTitle>
              <CardDescription>2024</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="relative h-40 w-40">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray={`${growthPercentage * 2.827} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">{growthPercentage}%</div>
                  <div className="text-sm text-muted-foreground">Growth</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {companyGrowth}% Company Growth
                </p>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span>2024: $32.5k</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    <span>2023: $41.2k</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Order Statistics */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
              <CardDescription>
                {((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% Total
                Completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="income" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="income">Orders</TabsTrigger>
                  <TabsTrigger value="expenses">Status</TabsTrigger>
                  <TabsTrigger value="profit">Details</TabsTrigger>
                </TabsList>
                <TabsContent value="income" className="space-y-4">
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={orderStatistics}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {orderStatistics.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500" />
                        <span className="text-sm">Pending</span>
                      </div>
                      <span className="text-sm font-medium">{stats.pendingOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-amber-500" />
                        <span className="text-sm">In Progress</span>
                      </div>
                      <span className="text-sm font-medium">{stats.inProgressOrders}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-500" />
                        <span className="text-sm">Completed</span>
                      </div>
                      <span className="text-sm font-medium">{stats.completedOrders}</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="expenses">
                  <div className="space-y-3 py-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Completion Rate</span>
                        <span className="font-medium">
                          {((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={(stats.completedOrders / stats.totalOrders) * 100 || 0}
                      />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Pending Rate</span>
                        <span className="font-medium">
                          {((stats.pendingOrders / stats.totalOrders) * 100 || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={(stats.pendingOrders / stats.totalOrders) * 100 || 0} />
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>In Progress Rate</span>
                        <span className="font-medium">
                          {((stats.inProgressOrders / stats.totalOrders) * 100 || 0).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={(stats.inProgressOrders / stats.totalOrders) * 100 || 0}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="profit">
                  <div className="space-y-2 py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Orders</span>
                      <span className="font-medium">{stats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Students</span>
                      <span className="font-medium">{stats.totalStudents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Washermen</span>
                      <span className="font-medium">{stats.totalWashermen}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Avg Orders/Student</span>
                      <span className="font-medium">
                        {(stats.totalOrders / stats.totalStudents || 0).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Recent Orders / Transactions */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest order activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-sm text-muted-foreground">Loading orders...</p>
                ) : recentOrders.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground">No orders found</p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {order.bagNo?.substring(0, 2) || 'OR'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">Order #{order.id}</p>
                          <p className="text-xs text-muted-foreground">Bag: {order.bagNo}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            order.status === 'COMPLETE'
                              ? 'default'
                              : order.status === 'INPROGRESS'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {order.status}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Report Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Profile Report</CardTitle>
                <CardDescription>Year 2024 Performance</CardDescription>
              </div>
              <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20">
                YEAR 2024
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold">$84,686k</span>
              <span className="text-sm text-green-500">+68.2%</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={profileData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
