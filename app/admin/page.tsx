"use client"

import { useState, useEffect } from "react"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Area, AreaChart
} from "recharts"
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Database,
  ExternalLink
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AdminApiService } from "@/lib/api-service"
import { cn } from "@/lib/utils"

interface ActivityDataPoint {
  date: string;
  apiCalls: number;
  userLogins: number;
}

interface RevenueDataPoint {
  month: string;
  revenue: number;
  projected: number;
}

// Create activity data for the chart
const generateActivityData = (): ActivityDataPoint[] => {
  const date = new Date()
  const data: ActivityDataPoint[] = []
  
  for (let i = 30; i > 0; i--) {
    const pastDate = new Date(date)
    pastDate.setDate(date.getDate() - i)
    
    data.push({
      date: pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      apiCalls: Math.floor(Math.random() * 500) + 500,
      userLogins: Math.floor(Math.random() * 50) + 50,
    })
  }
  
  return data
}

// Create revenue data for the chart (to be replaced with real data)
const generateRevenueData = (): RevenueDataPoint[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data: RevenueDataPoint[] = []
  
  months.forEach((month) => {
    data.push({
      month,
      revenue: Math.floor(Math.random() * 5000) + 3000,
      projected: Math.floor(Math.random() * 6000) + 3500,
    })
  })
  
  return data
}

// Weekly day labels
const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null)
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([])
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([])
  const [topUsers, setTopUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Week')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch real data from API endpoints
        const metricsData = await AdminApiService.GetSystemMetrics();
        const activityData = await AdminApiService.GenerateActivityData();
        const topUsersData = await AdminApiService.GetTopPerformingUsers();
        
        // Update state with real data
        setMetrics(metricsData);
        setActivityData(activityData);
        setTopUsers(topUsersData);
        
        // Revenue data - still using generated data until we have a real endpoint
        setRevenueData(generateRevenueData());
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: metrics.totalUsers,
      description: `${metrics.activeUsers} active users`,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+12%",
      isPositive: true
    },
    {
      title: "API Calls",
      value: metrics.totalApiCalls.toLocaleString(),
      description: `Avg ${metrics.averageDailyApiCalls.toLocaleString()}/day`,
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+8%",
      isPositive: true
    },
    {
      title: "Monthly Revenue",
      value: metrics.revenueThisMonth,
      description: `${metrics.revenueLastMonth} last month`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+15%",
      isPositive: true
    },
    {
      title: "Conversion Rate",
      value: metrics.conversionRate,
      description: `Top plan: ${metrics.topPlan}`,
      icon: TrendingUp,
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "-2%",
      isPositive: false
    },
  ]

  return (
    <div className="p-6">
      <div className="flex flex-col max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track performance metrics and system usage</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" className="text-sm border-border">
              <Database className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(['Week', 'Month', 'Year'] as const).map((period) => (
                <button 
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    timeframe === period 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-background text-foreground hover:bg-secondary"
                  )}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Card key={index} className="border-border shadow-sm">
              <CardHeader className="pb-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className={`p-2 mr-3 rounded-full ${card.bgColor}`}>
                      <card.icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                    <CardTitle className="text-base font-medium text-foreground/80">{card.title}</CardTitle>
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    card.isPositive ? "text-primary" : "text-destructive"
                  )}>
                    {card.change}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold tracking-tight text-foreground mb-1">{card.value}</div>
                <p className="text-sm text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <Card className="border-border shadow-sm xl:col-span-2">
            <CardHeader className="space-y-0 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold tracking-tight text-foreground">API Usage</CardTitle>
                  <CardDescription className="text-muted-foreground mt-1">Track changes in API usage over time</CardDescription>
                </div>
                <span className="text-3xl font-bold tracking-tight text-primary">+20%</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={activityData.slice(-7)} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                    <defs>
                      <linearGradient id="apiCallsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis hide={true} />
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-20" />
                    <Tooltip cursor={false} contentStyle={{ borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }} />
                    <Area 
                      type="monotone" 
                      dataKey="apiCalls" 
                      name="API Calls"
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#apiCallsGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-around mt-2">
                {weekDays.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                        index === 2 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-foreground/80"
                      )}
                    >
                      {day}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Top Users</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Highest API usage this {timeframe.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {topUsers.slice(0, 4).map((user, index) => (
                  <div key={user.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm text-primary-foreground",
                      index === 0 ? "bg-primary" : "bg-primary/80"
                    )}>
                      {user.name.charAt(0)}{user.name.split(' ')[1]?.charAt(0) || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {user.apiCalls.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">calls</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <Button variant="ghost" className="w-full justify-between text-primary">
                  View All Users 
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Revenue</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">Actual vs projected revenue</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.slice(-6)} barGap={8} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis hide axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'hsl(var(--secondary))'}} 
                      contentStyle={{ 
                        borderRadius: '0.5rem', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      name="Actual" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                    />
                    <Bar 
                      dataKey="projected" 
                      name="Projected" 
                      fill="hsl(var(--muted))" 
                      radius={[4, 4, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">User Growth</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">New user registrations over time</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData.slice(-7)} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="opacity-20" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis hide axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '0.5rem', 
                        border: '1px solid hsl(var(--border))' 
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="userLogins"
                      name="New Users"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                      activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border shadow-sm mb-6">
          <CardHeader className="pb-0">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">System events and user actions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-foreground/80">Event</th>
                    <th className="text-left p-3 font-medium text-foreground/80">User</th>
                    <th className="text-left p-3 font-medium text-foreground/80">Time</th>
                    <th className="text-right p-3 font-medium text-foreground/80">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { event: "Login", user: "Sarah Johnson", time: "Just now", details: "IP: 192.168.1.1" },
                    { event: "API Call", user: "Tom Wilson", time: "5 min ago", details: "Status: Success" },
                    { event: "Subscription Update", user: "Alex Chen", time: "1 hour ago", details: "Plan: Enterprise" },
                    { event: "New User", user: "Maria Garcia", time: "3 hours ago", details: "Source: Referral" },
                    { event: "API Error", user: "James Lee", time: "Yesterday", details: "Error: Rate limit" },
                  ].map((activity, i) => (
                    <tr key={i} className="border-b border-border hover:bg-secondary/30 transition-colors">
                      <td className="p-3 text-foreground">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            activity.event.includes("Error") ? "bg-destructive" : "bg-primary/80"
                          )}></div>
                          {activity.event}
                        </div>
                      </td>
                      <td className="p-3 text-foreground">{activity.user}</td>
                      <td className="p-3 text-muted-foreground">{activity.time}</td>
                      <td className="p-3 text-right text-foreground">{activity.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 