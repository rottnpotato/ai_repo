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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { SubscriptionService, UserSubscription } from "@/lib/services/SubscriptionService"
import { AdminService } from "@/lib/services/AdminService"

// Interface to track user subscriptions
interface UserWithSubscription extends User {
  userSubscriptions?: UserSubscription[];
  activeSubscription?: UserSubscription;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithSubscription[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithSubscription[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [planFilter, setPlanFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortDirection, setSortDirection] = useState("asc")
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingTokens, setIsAddingTokens] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null)
  const [tokenAmount, setTokenAmount] = useState<number>(100)
  const [tokenNote, setTokenNote] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await AdminService.GetAllUsers();
        
        if (response.success && Array.isArray(response.users)) {
          // Map backend users to frontend format
          const mappedUsers = response.users.map(user => 
            AdminService.MapBackendUserToFrontend(user)
          );
          
          setUsers(mappedUsers);
          setFilteredUsers(mappedUsers);
          
          // Fetch subscription data for each user
          fetchUserSubscriptions(mappedUsers);
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
  
  // Fetch subscription data for each user
  const fetchUserSubscriptions = async (userList: UserWithSubscription[]) => {
    const updatedUsers: UserWithSubscription[] = [...userList];
    
    for (const user of updatedUsers) {
      if (user.role !== "admin") {
        try {
          const subscriptions = await SubscriptionService.GetUserSubscriptions(user.id);
          
          if (Array.isArray(subscriptions) && subscriptions.length > 0) {
            // Add subscriptions to user object
            user.userSubscriptions = subscriptions;
            
            // Find active subscription
            const activeSubscription = subscriptions.find(sub => 
              sub.Status.toLowerCase() === "active"
            );
            
            if (activeSubscription) {
              user.activeSubscription = activeSubscription;
              
              // Update user plan based on subscription
              if (activeSubscription.SubscriptionPlan) {
                user.plan = activeSubscription.SubscriptionPlan.Name;
              }
              
              // Update tokens used/remaining
              user.tokensUsed = activeSubscription.TokensUsed;
              user.subscriptionStatus = "active";
            } else {
              user.subscriptionStatus = "inactive";
            }
          } else {
            user.subscriptionStatus = "inactive";
          }
        } catch (error) {
          console.error(`Error fetching subscriptions for user ${user.id}:`, error);
          // Continue to next user despite error
        }
      }
    }
    
    setUsers(updatedUsers);
    
    // Update filtered users based on the current filters
    let result = [...updatedUsers];
    
    // Filter out admin users
    result = result.filter((user) => user.role !== "admin");
    
    // Apply other filters (copied from the filter useEffect)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          (user.company && user.company.toLowerCase().includes(query))
      );
    }
    
    if (planFilter !== "all") {
      result = result.filter((user) => user.plan === planFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter((user) => user.subscriptionStatus === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let compareResult = 0;
      
      switch (sortBy) {
        case "name":
          compareResult = a.name.localeCompare(b.name);
          break;
        case "email":
          compareResult = a.email.localeCompare(b.email);
          break;
        case "plan":
          compareResult = a.plan.localeCompare(b.plan);
          break;
        case "status":
          compareResult = a.subscriptionStatus.localeCompare(b.subscriptionStatus);
          break;
        case "date":
          compareResult = new Date(a.subscriptionStartDate).getTime() - new Date(b.subscriptionStartDate).getTime();
          break;
        default:
          compareResult = 0;
      }
      
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
    
    setFilteredUsers(result);
  };

  // Filter and sort users based on search query, filters, and sort options
  useEffect(() => {
    let result = [...users]

    // Filter out admin users
    result = result.filter((user) => user.role !== "admin")

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
      result = result.filter((user) => user.subscriptionStatus === statusFilter)
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
          compareResult = a.subscriptionStatus.localeCompare(b.subscriptionStatus)
          break
        case "date":
          compareResult = new Date(a.subscriptionStartDate).getTime() - new Date(b.subscriptionStartDate).getTime()
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

  const handleAddTokens = async () => {
    if (!selectedUser) return

    try {
      // Find user's active subscription - in a real app, you would get this from the API
      // For now, we'll assume the subscription ID is 1 since this is a mock implementation
      const subscriptionId = 3; // Mock subscription ID
      
      const result = await SubscriptionService.AddTokensToUserSubscription(subscriptionId, {
        UserId: selectedUser.id,
        TokenCount: tokenAmount,
        Note: tokenNote
      });
      
      toast({
        title: "Success",
        description: `Added ${tokenAmount} tokens to ${selectedUser.name}'s account.`,
      });
      
      setIsAddingTokens(false);
      setTokenAmount(100);
      setTokenNote("");
      setSelectedUser(null);
    } catch (error) {
      console.error("Error adding tokens:", error);
      toast({
        title: "Error",
        description: "Failed to add tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

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
        {/* <Button className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New User
        </Button> */}
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
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Past Due</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
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
              {/* <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                More Filters
              </Button> */}
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
                      onClick={() => handleSort("date")}
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
                      <Link href={`/admin/users/${user.id}/tokens`} className="hover:text-orange-600 transition-colors">
                        {user.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4 capitalize">
                      {user.activeSubscription ? 
                        (user.activeSubscription.SubscriptionPlan?.Name || user.plan || "Free") : 
                        "No Active Subscription"}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`
                        ${
                          user.activeSubscription && user.activeSubscription.TokensUsed > 0
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }
                      `}
                      >
                        {user.activeSubscription && user.activeSubscription.TokensUsed > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{user.company || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {user.activeSubscription ? 
                            `${user.activeSubscription.TokensUsed || 0} / ${user.activeSubscription.SubscriptionPlan?.MaxTokens || 0} tokens` : 
                            `${user.tokensUsed || 0} tokens used`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {user.activeSubscription ? 
                            `Plan: ${user.activeSubscription.SubscriptionPlan?.Name || user.plan || "Free"}` : 
                            "No Active Subscription"}
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
                        <DropdownMenuSeparator />
                          {/* <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit User
                          </DropdownMenuItem> */}
                          <DropdownMenuItem onClick={() => router.push(`/admin/users/${user.id}/tokens`)}>
                            <Zap className="mr-2 h-4 w-4" />
                            Manage Tokens
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            Change Permissions
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsAddingTokens(true);
                          }}>
                            <Coins className="mr-2 h-4 w-4" />
                            Add Tokens
                          </DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem> */}
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

      {/* Add Tokens Dialog */}
      <Dialog open={isAddingTokens} onOpenChange={setIsAddingTokens}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Tokens</DialogTitle>
            <DialogDescription>
              Add tokens to {selectedUser?.name}'s account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tokenAmount" className="text-right">
                Amount
              </Label>
              <Input
                id="tokenAmount"
                type="number"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(parseInt(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tokenNote" className="text-right">
                Note
              </Label>
              <Textarea
                id="tokenNote"
                placeholder="Reason for adding tokens"
                value={tokenNote}
                onChange={(e) => setTokenNote(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingTokens(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTokens}>Add Tokens</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 