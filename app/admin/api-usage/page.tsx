"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { AlertTriangle, TrendingUp, TrendingDown, Database, Cpu } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSystemMetrics, mockUsers, mockUserStatsMap } from "@/lib/admin-data"

// Generate API usage data
const generateApiUsageData = () => {
  const days = 30
  const data = []
  const date = new Date()
  
  for (let i = days; i > 0; i--) {
    const pastDate = new Date(date)
    pastDate.setDate(date.getDate() - i)
    
    data.push({
      date: pastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      apiCalls: Math.floor(Math.random() * 2000) + 500,
      tokensUsed: Math.floor(Math.random() * 400000) + 100000,
    })
  }
  
  return data
}

// Generate endpoint usage data
const generateEndpointData = () => {
  return [
    { name: "Product Descriptions", value: 35 },
    { name: "Blog Posts", value: 25 },
    { name: "Marketing Emails", value: 18 },
    { name: "SEO Content", value: 12 },
    { name: "Social Media", value: 10 },
  ]
}

// Generate usage by plan data
const generateUsageByPlanData = () => {
  return [
    { name: "Trial", apiCalls: 1200, users: 45 },
    { name: "Starter", apiCalls: 5600, users: 65 },
    { name: "Professional", apiCalls: 24000, users: 35 },
    { name: "Enterprise", apiCalls: 12000, users: 11 },
  ]
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function ApiUsagePage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [apiUsageData, setApiUsageData] = useState<any[]>([])
  const [endpointData, setEndpointData] = useState<any[]>([])
  const [usageByPlanData, setUsageByPlanData] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metricsData = await getSystemMetrics()
        setMetrics(metricsData)
        setApiUsageData(generateApiUsageData())
        setEndpointData(generateEndpointData())
        setUsageByPlanData(generateUsageByPlanData())
      } catch (error) {
        console.error("Error fetching API usage data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate total API calls
  const totalApiCalls = apiUsageData.reduce((sum, day) => sum + day.apiCalls, 0)
  
  // Calculate tokens used
  const totalTokensUsed = apiUsageData.reduce((sum, day) => sum + day.tokensUsed, 0)
  
  // Calculate average daily API calls
  const avgDailyApiCalls = totalApiCalls / (apiUsageData.length || 1)
  
  // Calculate growth rates
  const previousPeriodApiCalls = totalApiCalls * 0.85
  const apiCallsGrowth = ((totalApiCalls - previousPeriodApiCalls) / previousPeriodApiCalls) * 100
  
  const previousPeriodTokensUsed = totalTokensUsed * 0.78
  const tokensUsedGrowth = ((totalTokensUsed - previousPeriodTokensUsed) / previousPeriodTokensUsed) * 100

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">API Usage Analytics</h1>
          <p className="text-gray-500 mt-1">Monitor and analyze API usage metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 3 months</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {apiCallsGrowth > 30 && (
        <Alert className="mb-8">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>High API Usage Growth Detected</AlertTitle>
          <AlertDescription>
            API usage has increased by {apiCallsGrowth.toFixed(1)}% compared to the previous period. 
            Consider optimizing usage or upgrading infrastructure if the trend continues.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total API Calls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{totalApiCalls.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              {apiCallsGrowth > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">{apiCallsGrowth.toFixed(1)}% increase</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600">{Math.abs(apiCallsGrowth).toFixed(1)}% decrease</span>
                </>
              )}
              <span className="text-gray-500 ml-2">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{totalTokensUsed.toLocaleString()}</div>
            <div className="flex items-center text-sm">
              {tokensUsedGrowth > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">{tokensUsedGrowth.toFixed(1)}% increase</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  <span className="text-red-600">{Math.abs(tokensUsedGrowth).toFixed(1)}% decrease</span>
                </>
              )}
              <span className="text-gray-500 ml-2">vs. previous period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Daily Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{avgDailyApiCalls.toFixed(0).toLocaleString()}</div>
            <div className="flex items-center text-sm">
              <Database className="h-4 w-4 text-blue-600 mr-1" />
              <span className="text-gray-600">API calls per day</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">98.7%</div>
            <div className="flex items-center text-sm">
              <Cpu className="h-4 w-4 text-purple-600 mr-1" />
              <span className="text-gray-600">System performance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>API Calls Over Time</CardTitle>
            <CardDescription>Daily API request volume</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={apiUsageData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value.toLocaleString(), "API Calls"]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="apiCalls"
                    name="API Calls"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Endpoint Distribution</CardTitle>
            <CardDescription>API calls by endpoint type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={endpointData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {endpointData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  <Legend layout="vertical" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage by Subscription Plan</CardTitle>
          <CardDescription>API calls and user count by plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usageByPlanData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="apiCalls" name="API Calls" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="users" name="Users" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 