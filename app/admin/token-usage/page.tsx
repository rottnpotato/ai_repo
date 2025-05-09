"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Coins, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { AdminService } from "@/lib/services/AdminService"
import { SubscriptionService, UserSubscription } from "@/lib/services/SubscriptionService"

interface TokenUsage {
  userId: string
  userName: string
  totalTokens: number
  costInUSD: number
  lastUsed: string
  promptTokens: number
  outputTokens: number
  trend: number // Percentage change
}

export default function TokenUsagePage() {
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalCost, setTotalCost] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)
  const prevUsageRef = useRef<Record<string, number>>({})
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([])

  const fetchTokenUsage = async () => {
    setIsLoading(true)
    try {
      const userResponse = await AdminService.GetAllUsers()
      console.log(userResponse)
      if (!userResponse.success) throw new Error("Failed to fetch users")
      // Map backend users to frontend User format to get correct id and name
      const users = userResponse.users.map((backendUser) =>
        AdminService.MapBackendUserToFrontend(backendUser)
      )
      const usageData: TokenUsage[] = await Promise.all(
        users.map(async (u) => {
          const subs = await SubscriptionService.GetUserSubscriptions(u.id)
       
         
          //const sub = await SubscriptionService.GetSubscriptionById(subs[0].Id);
          // console.log(subs)
          const total = subs.reduce((sum, sub) => sum + sub.TokensUsed, 0)
      
          
          
          // Calculate cost using 30% input tokens at $0.10 per 1M, 70% output tokens at $0.40 per 1M
          const inputTokens = total * 0.4
          const outputTokens = total * 0.6
          // const inputTokens = sub.PromptTokenUsed;
          // const outputTokens = sub.CandidateTokenUsed;
          const inputRate = 0.10  // USD per 1M tokens
          const outputRate = 0.40 // USD per 1M tokens
          const cost = (inputTokens / 1_000_000) * inputRate + (outputTokens / 1_000_000) * outputRate
          const lastDate = subs.reduce(
            (latest, sub) => {
              const date = new Date(sub.UpdatedAt || sub.CreatedAt)
              return date > latest ? date : latest
            },
            new Date(0)
          )
          return {
            userId: u.id,
            userName: u.name,
            totalTokens: total,
            costInUSD: cost,
            lastUsed: lastDate.toISOString(),
            promptTokens: inputTokens,
            outputTokens: outputTokens,
            trend: 0,
          }
        })
      )
      // calculate trends
      usageData.forEach((u) => {
        const prev = prevUsageRef.current[u.userId] || 0
        u.trend = prev ? ((u.totalTokens - prev) / prev) * 100 : 0
        prevUsageRef.current[u.userId] = u.totalTokens
      })
      setTokenUsage(usageData)
      setTotalTokens(usageData.reduce((acc, u) => acc + u.totalTokens, 0))
      setTotalCost(usageData.reduce((acc, u) => acc + u.costInUSD, 0))
    } catch (error) {
      console.error("Error fetching token usage:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTokenUsage()
    const interval = setInterval(fetchTokenUsage, 4000) // Refresh every 4 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Token Usage Monitor</h1>
          <p className="text-muted-foreground mt-1">Real-time token usage across all users</p>
        </div>
        <div className="flex items-center text-muted-foreground text-sm">
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Auto-refreshing every 4 seconds
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Tokens Used</CardTitle>
            <CardDescription>Across all users</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold">{totalTokens.toLocaleString()}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Cost</CardTitle>
            <CardDescription>In USD</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Average Cost per Token</CardTitle>
            <CardDescription>Based on current usage</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold">
                {totalTokens > 0
                  ? `$${((totalCost / totalTokens) * 1000).toFixed(4)}/1K`
                  : '$0.0000/1K'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Token Usage</CardTitle>
          <CardDescription>Detailed breakdown by user</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Tokens Used</TableHead>
                <TableHead className="text-right">Input Tokens</TableHead>
                <TableHead className="text-right">Output Tokens</TableHead>
                <TableHead className="text-right">Cost (USD)</TableHead>
                <TableHead className="text-right">Last Used</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : (
                tokenUsage.map((usage) => (
                  <TableRow key={usage.userId}>
                    <TableCell className="font-medium">{usage.userName}</TableCell>
                    <TableCell className="text-right">{usage.totalTokens.toLocaleString()}</TableCell> 
                    <TableCell className="text-right">{usage.promptTokens.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{usage.outputTokens.toLocaleString()}</TableCell>
                    {/* <TableCell className="text-right">{usage.promptTokens}</TableCell>
                    <TableCell className="text-right">{usage.outputTokens}</TableCell> */}
                    <TableCell className="text-right">${usage.costInUSD.toFixed(4)}</TableCell>
                    <TableCell className="text-right">
                      {new Date(usage.lastUsed).toLocaleTimeString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        {usage.trend > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={usage.trend > 0 ? "text-green-500" : "text-red-500"}>
                          {Math.abs(usage.trend)}%
                        </span>
                      </div>
                    </TableCell>
                    </TableRow>
                  ))
              
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 