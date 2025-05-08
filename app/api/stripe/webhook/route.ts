import { NextResponse } from 'next/server';

/**
 * Handles webhook events from the backend API
 * Processes payment confirmations, failures, subscription updates
 */
export async function POST(request: Request) {
  try {
    // Get the stripe-signature header required for verification
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      console.error('Webhook error: Missing stripe-signature header');
      return NextResponse.json(
        { message: 'Invalid webhook signature' },
        { status: 400 }
      );
    }

    // Parse the JSON payload
    const payload = await request.json();
    
    // Log the event type for debugging
    console.log(`Processing webhook event: ${payload.type}`);
    
    // Handle different event types
    switch (payload.type) {
      case 'checkout.session.completed':
        await HandleCheckoutSessionCompleted(payload);
        break;
      case 'customer.subscription.created':
        await HandleSubscriptionCreated(payload);
        break;
      case 'customer.subscription.updated':
        await HandleSubscriptionUpdated(payload);
        break;
      case 'customer.subscription.deleted':
        await HandleSubscriptionDeleted(payload);
        break;
      case 'invoice.payment_succeeded':
        await HandlePaymentSucceeded(payload);
        break;
      case 'invoice.payment_failed':
        await HandlePaymentFailed(payload);
        break;
      default:
        // Handle other event types or ignore them
        console.log(`Unhandled webhook event type: ${payload.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handler functions for different event types

async function HandleCheckoutSessionCompleted(payload: any) {
  // Extract necessary data from the payload
  const sessionId = payload.data.object.id;
  const customerId = payload.data.object.customer;
  const subscriptionId = payload.data.object.subscription;
  const metadata = payload.data.object.metadata || {};
  
  console.log(`Checkout session completed: ${sessionId}, Customer: ${customerId}, Subscription: ${subscriptionId}`);
  
  // TODO: Update user subscription in your database
  // This might involve:
  // 1. Finding the user associated with this checkout session (using metadata.userId)
  // 2. Recording the subscription details (plan, start date, etc.)
  // 3. Updating the user's subscription status
  
  // Example of accessing metadata that was set during checkout creation
  if (metadata.userId) {
    console.log(`User ID from metadata: ${metadata.userId}`);
    // Update user's subscription status in your database
  }
}

async function HandleSubscriptionCreated(payload: any) {
  const subscriptionId = payload.data.object.id;
  const customerId = payload.data.object.customer;
  const status = payload.data.object.status;
  
  console.log(`Subscription created: ${subscriptionId}, Status: ${status}`);
  
  // TODO: Record the new subscription in your database
}

async function HandleSubscriptionUpdated(payload: any) {
  const subscriptionId = payload.data.object.id;
  const status = payload.data.object.status;
  
  console.log(`Subscription updated: ${subscriptionId}, New status: ${status}`);
  
  // TODO: Update the subscription details in your database
}

async function HandleSubscriptionDeleted(payload: any) {
  const subscriptionId = payload.data.object.id;
  
  console.log(`Subscription deleted: ${subscriptionId}`);
  
  // TODO: Mark the subscription as canceled in your database
}

async function HandlePaymentSucceeded(payload: any) {
  const invoiceId = payload.data.object.id;
  const subscriptionId = payload.data.object.subscription;
  const amountPaid = payload.data.object.amount_paid;
  
  console.log(`Payment succeeded for invoice: ${invoiceId}, Amount: ${amountPaid}`);
  
  // TODO: Record successful payment in your database
}

async function HandlePaymentFailed(payload: any) {
  const invoiceId = payload.data.object.id;
  const subscriptionId = payload.data.object.subscription;
  const attemptCount = payload.data.object.attempt_count;
  
  console.log(`Payment failed for invoice: ${invoiceId}, Attempt: ${attemptCount}`);
  
  // TODO: Handle failed payment (notify user, update subscription status, etc.)
} 