import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  RefreshCw,
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
} from 'recharts';
import { api } from '@/services/api';
import type { DashboardStats, Order } from '@/types';
import { DashboardLayout } from '@/components/DashboardLayout';

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
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({ orders: 0, completed: 0 });

  const calculateMonthlyData = (orders: Order[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { [key: string]: number } = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Get last 7 months
    const result = [];
    const currentDate = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      result.push({
        month: months[date.getMonth()],
        orders: monthlyData[monthKey] || 0,
      });
    }
    
    return result;
  };

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
      
      // Calculate today's stats
      const today = new Date().toDateString();
      const todaysOrders = orders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todaysCompleted = todaysOrders.filter(o => o.status === 'COMPLETE');
      setTodayStats({ orders: todaysOrders.length, completed: todaysCompleted.length });
      
      // Calculate monthly data for the last 7 months
      const monthlyOrdersData = calculateMonthlyData(orders);
      setMonthlyData(monthlyOrdersData);
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

  return (
    <DashboardLayout>
      <div className="min-h-full w-full space-y-4 p-6 pb-16">
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
                <span>Registered users</span>
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
                <span>{todayStats.orders} {todayStats.orders === 1 ? 'order' : 'orders'} today</span>
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
                <span>{stats.inProgressOrders} in progress</span>
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
                <span>Active staff members</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 md:grid-cols-7">
          {/* Revenue Chart */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Monthly Orders</CardTitle>
              <CardDescription>Last 7 months overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#6366f1" radius={[8, 8, 0, 0]} name="Orders" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Completion Rate Gauge */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Completion Rate</CardTitle>
              <CardDescription>Order completion status</CardDescription>
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
                    stroke="#10b981"
                    strokeWidth="10"
                    strokeDasharray={`${((stats.completedOrders / (stats.totalOrders || 1)) * 100) * 2.827} 283`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">
                    {((stats.completedOrders / (stats.totalOrders || 1)) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Complete</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {stats.completedOrders} of {stats.totalOrders} orders completed
                </p>
                <div className="mt-2 flex items-center justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-blue-500" />
                    <span>Pending: {stats.pendingOrders}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="h-3 w-3 text-orange-500" />
                    <span>In Progress: {stats.inProgressOrders}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Side by Side */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Orders / Transactions */}
          <Card>
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

          {/* Today's Activity */}
          <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Today's Activity</CardTitle>
                <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
              </div>
              <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                LIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">New Orders</span>
                <span className="text-3xl font-bold">{todayStats.orders}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Completed Today</span>
                <span className="text-3xl font-bold">{todayStats.completed}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-3xl font-bold">{stats.pendingOrders + stats.inProgressOrders}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
