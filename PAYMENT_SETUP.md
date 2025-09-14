# Payment Integration Setup Guide

## Overview

AgentCeylon uses Stripe for secure payment processing. This guide will walk you through setting up the payment system.

## Prerequisites

1. **Stripe Account**: Create a free account at [stripe.com](https://stripe.com)
2. **Supabase Database**: Ensure your database schema is up to date
3. **Environment Variables**: Configure your Stripe keys

## Step 1: Stripe Setup

### 1.1 Create Stripe Account
1. Go to [https://stripe.com](https://stripe.com)
2. Sign up for a free account
3. Complete business verification (for live payments)
4. Note: You can use test mode for development

### 1.2 Get Your API Keys
1. **Dashboard** → **Developers** → **API Keys**
2. Copy the following keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### 1.3 Setup Webhook Endpoint
1. **Dashboard** → **Developers** → **Webhooks**
2. **Add endpoint**: `https://yourdomain.com/api/webhooks/stripe`
3. **Select events**:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.dispute.created`
   - `refund.created`
4. Copy the **Webhook Secret** (starts with `whsec_`)

## Step 2: Environment Configuration

### 2.1 Update .env.local
Add these variables to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2.2 Currency Configuration
AgentCeylon is configured for Sri Lankan Rupees (LKR). To change:

1. Edit `src/lib/stripe/config.ts`
2. Update the `STRIPE_CONFIG.currency` value
3. Update `formatCurrency` functions

## Step 3: Database Setup

### 3.1 Run Payment Migration
Execute the payment tables migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: migrations/003_payment_tables.sql
```

This creates:
- `payment_intents` table
- `refunds` table  
- `payment_methods` table (optional)
- `invoices` table
- Necessary indexes and policies

### 3.2 Verify Tables
Check that these tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_intents', 'refunds', 'invoices');
```

## Step 4: Testing the Integration

### 4.1 Test Cards
Use these test cards in development:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits
- Zip: Any 5 digits

**Declined Payment:**
- Card: `4000 0000 0000 0002`

**3D Secure:**
- Card: `4000 0025 0000 3155`

### 4.2 Test Flow
1. **Browse Tours**: Go to `/tours` or `/tours/[id]`
2. **Book Tour**: Click "Book Now" button
3. **Fill Details**: Complete booking form
4. **Test Payment**: Use test card details
5. **Verify**: Check booking in `/dashboard/bookings`

### 4.3 Admin Testing
1. **Login as Admin**: Use admin credentials
2. **Check Payments**: View in admin dashboard
3. **Process Refunds**: Test refund functionality

## Step 5: Going Live

### 5.1 Switch to Live Mode
1. **Stripe Dashboard** → **View test data** toggle OFF
2. Update environment variables with live keys:
   ```bash
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
   STRIPE_SECRET_KEY=sk_live_your_live_key
   ```
3. Update webhook endpoint to production URL

### 5.2 Business Verification
Complete Stripe's business verification process:
- Business information
- Bank account details
- Identity verification
- Tax information

## Features Included

### ✅ Core Payment Features
- **Secure Card Processing**: Via Stripe Elements
- **Payment Intents**: For SCA compliance
- **Webhook Handling**: Real-time payment updates
- **Refund Management**: Admin and automated refunds
- **Multiple Currencies**: Easy currency configuration

### ✅ Booking Features
- **Real-time Availability**: Check tour capacity
- **Payment Confirmation**: Instant booking confirmation
- **Email Notifications**: Confirmation and receipts
- **Booking Management**: Full CRUD operations

### ✅ Admin Features
- **Payment Dashboard**: View all payments
- **Refund Processing**: Issue refunds easily
- **Booking Management**: Update booking status
- **Financial Reports**: Revenue and transaction reports

### ✅ Security Features
- **PCI Compliance**: Through Stripe
- **Data Encryption**: All sensitive data encrypted
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Comprehensive validation

## API Endpoints

### Payment APIs
- `POST /api/payments/intent` - Create payment intent
- `GET /api/payments/intent?payment_intent_id={id}` - Get payment details
- `POST /api/payments/confirm` - Confirm payment and create booking
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

### Booking APIs
- `GET /api/bookings` - List user bookings
- `POST /api/bookings` - Create booking (legacy)
- `PUT /api/bookings/[id]` - Update booking
- `GET /api/bookings/[id]` - Get booking details

## Troubleshooting

### Common Issues

**1. "Payment method required"**
- Check Stripe Elements implementation
- Verify card element is properly loaded

**2. "Webhook signature verification failed"**
- Verify webhook secret is correct
- Check raw body is being passed to verification

**3. "Payment intent not found"**
- Check payment intent ID is valid
- Verify user permissions

**4. Database errors**
- Run migration scripts
- Check RLS policies are configured

### Debug Mode
Enable debug logging:
```javascript
// In stripe config
console.log('Payment Intent:', paymentIntent)
console.log('Webhook Event:', event)
```

### Support
- **Stripe Docs**: [https://stripe.com/docs](https://stripe.com/docs)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **AgentCeylon Issues**: Check project documentation

## Security Checklist

- [ ] Environment variables are secure
- [ ] Webhook endpoints use HTTPS
- [ ] User input is validated
- [ ] Rate limiting is enabled
- [ ] Database policies are configured
- [ ] Error handling doesn't expose sensitive data
- [ ] Test in staging before production

## Next Steps

After setting up payments, consider:
1. **Email Notifications**: Set up booking confirmations
2. **SMS Notifications**: Add phone notifications
3. **Advanced Analytics**: Implement revenue tracking
4. **Multi-currency**: Support multiple currencies
5. **Subscription Plans**: For recurring services