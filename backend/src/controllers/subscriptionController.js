import Razorpay from 'razorpay';
import { v4 as uuidv4 } from 'uuid';
import { getWrappedDb } from '../config/database.js';

// Lazy initialize Razorpay (only when needed, after env vars are loaded)
let razorpayInstance = null;

function getRazorpay() {
    if (!razorpayInstance && process.env.PAYMENT_MODE === 'razorpay') {
        console.log('Initializing Razorpay with KEY_ID:', process.env.RAZORPAY_KEY_ID);
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpayInstance;
}

// Get current subscription
export async function getCurrentSubscription(req, res, next) {
    try {
        const db = await getWrappedDb();
        const subscription = await db.get(
            `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );

        if (!subscription) {
            return res.json({
                plan_type: 'free',
                status: 'active'
            });
        }

        res.json(subscription);
    } catch (error) {
        next(error);
    }
}

// Create subscription
export async function createSubscription(req, res, next) {
    try {
        // Extract planType - handle both {planType: 'pro'} and just 'pro'
        let planType = req.body.planType || req.body;

        // If planType is an object, extract the planType property
        if (typeof planType === 'object' && planType.planType) {
            planType = planType.planType;
        }

        console.log('Creating subscription for plan:', planType);

        if (!planType || !['free', 'pro', 'enterprise'].includes(planType.toLowerCase())) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }

        const db = await getWrappedDb();

        // Mock mode (development) - check PAYMENT_MODE instead of razorpay variable
        if (process.env.PAYMENT_MODE === 'mock' || process.env.PAYMENT_MODE !== 'razorpay') {
            // Check if user already has an active subscription
            const existing = await db.get(
                'SELECT id FROM subscriptions WHERE user_id = $1 AND status = \'active\'',
                [req.user.userId]
            );

            if (existing) {
                // Update existing subscription
                await db.run(
                    'UPDATE subscriptions SET plan_type = $1, updated_at = NOW() WHERE id = $2',
                    [planType.toLowerCase(), existing.id]
                );
            } else {
                // Create new subscription
                const subscriptionId = uuidv4();
                await db.run(
                    `INSERT INTO subscriptions (id, user_id, plan_type, status, start_date)
                     VALUES ($1, $2, $3, 'active', NOW())`,
                    [subscriptionId, req.user.userId, planType.toLowerCase()]
                );
            }

            return res.json({
                success: true,
                message: `Subscription upgraded to ${planType} plan!`,
                mode: 'mock'
            });
        }

        // Razorpay mode (production)
        const razorpay = getRazorpay();

        if (!razorpay) {
            return res.status(500).json({ error: 'Razorpay is not configured. Please check your API keys.' });
        }

        const amount = planType.toLowerCase() === 'pro' ? 49900 : 199900; // in paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `sub_${uuidv4()}`,
            notes: {
                userId: req.user.userId,
                planType: planType.toLowerCase()
            }
        };

        console.log('Creating Razorpay order with options:', options);

        const order = await razorpay.orders.create(options);

        console.log('Razorpay order created:', order.id);

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('Subscription creation error:', error);
        next(error);
    }
}

// Verify payment
export async function verifyPayment(req, res, next) {
    try {
        const { orderId, paymentId, signature, planType } = req.body;

        if (!orderId || !paymentId || !signature) {
            return res.status(400).json({ error: 'Missing payment details' });
        }

        // Verify Razorpay signature
        const crypto = await import('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${orderId}|${paymentId}`)
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Payment verified, create subscription
        const db = await getWrappedDb();

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

        // Check if user already has an active subscription
        const existing = await db.get(
            'SELECT id FROM subscriptions WHERE user_id = $1 AND status = \'active\'',
            [req.user.userId]
        );

        if (existing) {
            // Update existing subscription
            await db.run(
                `UPDATE subscriptions SET 
                 plan_type = $1, 
                 razorpay_subscription_id = $2, 
                 end_date = $3, 
                 updated_at = NOW() 
                 WHERE id = $4`,
                [planType.toLowerCase(), paymentId, endDate, existing.id]
            );
        } else {
            // Create new subscription
            const subscriptionId = uuidv4();
            await db.run(
                `INSERT INTO subscriptions (id, user_id, plan_type, status, razorpay_subscription_id, start_date, end_date)
                 VALUES ($1, $2, $3, 'active', $4, NOW(), $5)`,
                [subscriptionId, req.user.userId, planType.toLowerCase(), paymentId, endDate]
            );
        }

        res.json({
            success: true,
            message: 'Payment verified and subscription activated!',
            planType
        });
    } catch (error) {
        console.error('Payment verification error:', error);
        next(error);
    }
}

// Get subscription status
export async function getSubscriptionStatus(req, res, next) {
    try {
        const db = await getWrappedDb();
        const subscription = await db.get(
            `SELECT * FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );

        if (!subscription || subscription.plan_type === 'free') {
            return res.json({
                planType: 'free',
                status: 'active',
                features: {
                    totalInvoices: 5,
                    totalClients: 'unlimited', // Note: User said "free tire invoice for only one user", usually implying 1 user, but "invoice for only one user on the pro pack 10 invoices for 5 clients". I'll keep clients unlimited for free unless specified otherwise, but invoices are limited to 5.
                    watermark: true,
                    templateChoice: false
                }
            });
        }

        const planType = subscription.plan_type.toLowerCase();
        const isPro = planType === 'pro';
        const isEnterprise = planType === 'enterprise';

        res.json({
            ...subscription,
            features: {
                totalInvoices: isEnterprise ? 'unlimited' : (isPro ? 10 : 5),
                totalClients: isEnterprise ? 'unlimited' : (isPro ? 5 : 'unlimited'),
                watermark: !isPro && !isEnterprise,
                templateChoice: isPro || isEnterprise
            }
        });
    } catch (error) {
        next(error);
    }
}

// Cancel subscription
export async function cancelSubscription(req, res, next) {
    try {
        const db = await getWrappedDb();

        await db.run(
            `UPDATE subscriptions SET
         status = 'cancelled',
         updated_at = NOW()
       WHERE user_id = $1 AND status = 'active'`,
            [req.user.userId]
        );

        // Create new free subscription
        const subscriptionId = uuidv4();
        await db.run(
            `INSERT INTO subscriptions (id, user_id, plan_type, status, start_date)
       VALUES ($1, $2, 'free', 'active', NOW())`,
            [subscriptionId, req.user.userId]
        );

        res.json({ message: 'Subscription cancelled. Downgraded to free plan.' });
    } catch (error) {
        next(error);
    }
}
