GET localhost:3000/auth/users
sample response: 
{
    "success": true,
    "users": [
        {
            "Id": "44766b77-c112-471d-b6c1-e79070315155",
            "FirstName": "Test",
            "LastName": "Test",
            "Email": "kouhaiikun@gmail.com",
            "Status": "active",
            "Role": "user",
            "GoogleId": null,
            "HasUsedFreeTrial": false,
            "CreatedAt": "2025-04-15T01:25:30.474Z",
            "UpdatedAt": "2025-04-15T01:26:12.664Z"
        },
        {
            "Id": "baca8f8e-6bf7-4060-8fe5-426ab6d2c73d",
            "FirstName": "Test",
            "LastName": "Test",
            "Email": "kouhaiikua@gmail.com",
            "Status": "unverified",
            "Role": "user",
            "GoogleId": null,
            "HasUsedFreeTrial": false,
            "CreatedAt": "2025-04-27T16:19:15.031Z",
            "UpdatedAt": "2025-04-27T16:19:15.031Z"
        },
        {
            "Id": "2862737a-0d46-4905-9fcd-899e051769a5",
            "FirstName": "Mega",
            "LastName": "Delon",
            "Email": "raikko331@gmail.com",
            "Status": "unverified",
            "Role": "user",
            "GoogleId": null,
            "HasUsedFreeTrial": false,
            "CreatedAt": "2025-04-28T06:36:04.121Z",
            "UpdatedAt": "2025-04-28T06:36:04.121Z"
        },
        {
            "Id": "4f03580e-6fa1-4786-a6be-faf970336f84",
            "FirstName": "Mega",
            "LastName": "Delon",
            "Email": "raiko331@gmail.com",
            "Status": "active",
            "Role": "admin",
            "GoogleId": null,
            "HasUsedFreeTrial": false,
            "CreatedAt": "2025-04-28T02:22:52.734Z",
            "UpdatedAt": "2025-04-28T02:41:36.292Z"
        },
        {
            "Id": "097b3fd9-ab02-45e1-b710-823a6c5950c1",
            "FirstName": "Test",
            "LastName": "Test",
            "Email": "jeromelomoyq@gmail.com",
            "Status": "active",
            "Role": "user",
            "GoogleId": "111928482018619535080",
            "HasUsedFreeTrial": false,
            "CreatedAt": "2025-04-29T02:45:05.258Z",
            "UpdatedAt": "2025-04-29T13:01:59.089Z"
        }
    ]
}

GET localhost:3000/api/subscription-plans
sample response: 
[
    {
        "Id": 1,
        "Name": "Professional Plan",
        "Description": "Advanced subscription plan for business users with higher request limits",
        "PlanType": "Business",
        "MaxTokens": 5,
        "Price": "199.99",
        "Currency": "USD",
        "BillingCycle": "monthly",
        "IsActive": true,
        "CreatedAt": "2025-04-15T01:59:19.234Z",
        "UpdatedAt": "2025-04-15T01:59:19.234Z"
    },
    {
        "Id": 2,
        "Name": "Professional Plan",
        "Description": "Advanced subscription plan for business users with higher request limits",
        "PlanType": "Business",
        "MaxTokens": 2000,
        "Price": "199.99",
        "Currency": "USD",
        "BillingCycle": "monthly",
        "IsActive": true,
        "CreatedAt": "2025-04-22T03:11:21.341Z",
        "UpdatedAt": "2025-04-22T03:11:21.341Z"
    },
    {
        "Id": 3,
        "Name": "Professional Plan",
        "Description": "Advanced subscription plan for business users with higher request limits",
        "PlanType": "Business",
        "MaxTokens": 2000,
        "Price": "199.99",
        "Currency": "USD",
        "BillingCycle": "monthly",
        "IsActive": true,
        "CreatedAt": "2025-04-29T04:32:10.610Z",
        "UpdatedAt": "2025-04-29T04:32:10.610Z"
    }
]

POST localhost:3000/api/subscription-plans/create
sample body: 
{
  "Name": "Free Trial Plan (14 Days)",
  "Description": "Trial for new users",
  "PlanType": "Trial",
  "MaxTokens": 5000,
  "Price": 0,
  "Currency": "USD",
  "BillingCycle": "monthly",
  "IsActive": true
}
sample response: 
{
    "Id": 4,
    "Name": "Free Trial Plan (14 Days)",
    "Description": "Trial for new users",
    "PlanType": "Trial",
    "MaxTokens": 5000,
    "Price": "0.00",
    "Currency": "USD",
    "BillingCycle": "monthly",
    "IsActive": true,
    "CreatedAt": "2025-04-29T09:24:06.437Z",
    "UpdatedAt": "2025-04-29T09:24:06.437Z"
}

POST localhost:3000/api/subscription-plans/:id
params: subscription_plan_id

sample body: 
{
  "Name": "Free Trial Plan (14 Days)",
  "Description": "Trial for new users",
  "PlanType": "Trial",
  "MaxTokens": 5000,
  "Price": 0,
  "Currency": "USD",
  "BillingCycle": "monthly",
  "IsActive": true
}
sample response
 {
    "Id": 1,
    "Name": "Professional Plan",
    "Description": "Advanced subscription plan for business users with higher request limits",
    "PlanType": "Business",
    "MaxTokens": 2000,
    "Price": 199.99,
    "Currency": "USD",
    "BillingCycle": "monthly",
    "IsActive": true,
    "CreatedAt": "2025-04-15T01:59:19.234Z",
    "UpdatedAt": "2025-04-29T07:45:55.453Z"
}
DELETE localhost:3000/api/subscription-plans/:id
params: subscription_plan_id
sample response: 1 or 0

POST localhost:3000/api/user-subscriptions/admin/:id/add-tokens
params: user_subscription_id
sample body: 
{
  "UserId": "44766b77-c112-471d-b6c1-e79070315155",
  "TokenCount": 100,
  "Note": "Bonus tokens for loyal customer"
}
sample response: 
{
    "Id": 3,
    "UserId": "44766b77-c112-471d-b6c1-e79070315155",
    "SubscriptionPlanId": 2,
    "StartDate": "2025-04-22T14:52:57.564Z",
    "EndDate": "2025-05-22T14:52:57.564Z",
    "TokensUsed": 7785,
    "TokensRemaining": 670,
    "Status": "active",
    "PaymentId": "payment_1745333577564_qq2pckykl",
    "PaymentMethod": "credit_card",
    "AutoRenew": true,
    "CreatedAt": "2025-04-22T14:52:57.578Z",
    "UpdatedAt": "2025-04-29T16:31:56.160Z",
    "SubscriptionPlan": {
        "Id": 2,
        "Name": "Professional Plan",
        "Description": "Advanced subscription plan for business users with higher request limits",
        "PlanType": "Business",
        "MaxTokens": 2000,
        "Price": "199.99",
        "Currency": "USD",
        "BillingCycle": "monthly"
    }
}



