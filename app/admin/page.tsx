"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Filter,
  PlusCircle,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  Zap,
  Shield,
  Edit,
  Trash,
  Coins,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { AdminService } from "@/lib/services/AdminService"

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await AdminService.GetAllUsers();
        
        if (response.success && Array.isArray(response.users)) {
          const mappedUsers = response.users.map(user => 
            AdminService.MapBackendUserToFrontend(user)
          );
          
          setUsers(mappedUsers);
          setFilteredUsers(mappedUsers);
        } else {
          console.error("Error fetching users: Invalid response format", response);
          toast({
            title: "Error",
            description: "Failed to load users. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsers();
  }, [toast]);

  // Filter and sort users based on search query, filters, and sort options
  useEffect(() => {
    let result = [...users]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.company && user.company.toLowerCase().includes(query))
      )
    }

    // Apply plan filter
    if (planFilter !== "all") {
      result = result.filter((user) => user.plan === planFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((user) => user.pluginActivation === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      let compareResult = 0

      switch (sortBy) {
        case "name":
          compareResult = a.name.localeCompare(b.name)
          break
        case "email":
          compareResult = a.email.localeCompare(b.email)
          break
        case "plan":
          compareResult = a.plan.localeCompare(b.plan)
          break
        case "status":
          compareResult = (a.pluginActivation || "").localeCompare(b.pluginActivation || "")
          break
        case "tokens":
          compareResult = (a.tokensUsed || 0) - (b.tokensUsed || 0)
          break
        default:
          compareResult = 0
      }

      return sortDirection === "asc" ? compareResult : -compareResult
    })

    setFilteredUsers(result)
  }, [users, searchQuery, planFilter, statusFilter, sortBy, sortDirection])

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
  }

  const handleSort = (field: string) => {
    if (sortBy === field) {
      toggleSortDirection()
    } else {
      setSortBy(field)
      setSortDirection("asc")
    }
  }

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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all users in your system</p>
        </div>
        <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search for users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by name, email, or company..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Users</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      onClick={() => handleSort("name")}
                    >
                      Name
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      onClick={() => handleSort("email")}
                    >
                      Email
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      onClick={() => handleSort("plan")}
                    >
                      Plan
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      Plugin Activation
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Company</th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button
                      className="flex items-center gap-1 hover:text-orange-600 transition-colors"
                      onClick={() => handleSort("tokens")}
                    >
                      Token Used & Plan
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">
                      <Link href={`/admin/users/${user.id}`} className="hover:text-orange-600 transition-colors">
                        {user.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4 capitalize">{user.plan}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`
                        ${
                          user.pluginActivation === "active"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : user.pluginActivation === "inactive"
                            ? "border-red-200 bg-red-50 text-red-700"
                            : "border-gray-200 bg-gray-50 text-gray-700"
                        }
                      `}
                      >
                        {user.pluginActivation || "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{user.company || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.tokensUsed || 0} tokens used
                        </span>
                        <span className="text-xs text-gray-500">
                          Plan: {user.plan || "No Plan"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/tokens`)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Manage Tokens
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found matching your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 