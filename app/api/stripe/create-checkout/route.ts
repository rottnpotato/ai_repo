import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { SubscriptionService, SubscriptionPlan } from '@/lib/services/SubscriptionService';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { SubscriptionPlanId, PaymentMethod, AutoRenew } = body;

    if (!SubscriptionPlanId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get subscription plan details from your database
    // This is a placeholder - implement your own logic to fetch plan details
    const plan = await getPlanDetails(SubscriptionPlanId);

    if (!plan) {
      return NextResponse.json(
        { message: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: session.user.email || undefined,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
      metadata: {
        userId: session.user.id || '',
        planId: SubscriptionPlanId.toString(),
        autoRenew: AutoRenew ? 'true' : 'false',
      },
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { message: 'Error creating checkout session' },
      { status: 500 }
    );
  }
}

// Helper function to get plan details
async function getPlanDetails(planId: number) {
  try {
    const plans = await SubscriptionService.GetSubscriptionPlans();
    const plan = plans.find((p: SubscriptionPlan) => p.Id === planId);
    
    if (!plan) {
      return null;
    }

    return {
      id: plan.Id,
      stripePriceId: process.env.STRIPE_PRICE_ID || '', // TODO: Add stripePriceId to your plan data model
      name: plan.Name,
      description: plan.Description,
      price: plan.Price,
      currency: plan.Currency,
      billingCycle: plan.BillingCycle,
      maxTokens: plan.MaxTokens
    };
  } catch (error) {
    console.error('Error fetching plan details:', error);
    return null;
  }
} 