import { getWrappedDb } from '../config/database.js';

// Check subscription limits based on plan
export async function checkPlanLimits(req, res, next) {
    // Only check for POST requests (creation)
    if (req.method !== 'POST') {
        return next();
    }

    try {
        const db = await getWrappedDb();

        // Get user's subscription
        const subscription = await db.get(
            `SELECT plan_type FROM subscriptions
       WHERE user_id = $1 AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
            [req.user.userId]
        );

        const planType = (subscription?.plan_type || 'free').toLowerCase();
        const planStartDate = subscription?.created_at || '1970-01-01';
        const isCreatingInvoice = req.path === '/' || req.path === '' || req.originalUrl.includes('/api/invoices');
        const isCreatingClient = req.originalUrl.includes('/api/clients');

        // Invoice Limits
        if (isCreatingInvoice && req.originalUrl.includes('/api/invoices') && req.method === 'POST') {
            if (planType === 'free') {
                const totalInvoices = await db.get(
                    `SELECT COUNT(*) as count FROM invoices WHERE user_id = $1`,
                    [req.user.userId]
                );
                if (totalInvoices.count >= 5) {
                    return res.status(403).json({
                        error: 'Invoice limit reached',
                        message: 'Free plan is limited to 5 invoices. Please upgrade to Pro or Enterprise.',
                        limit: 5,
                        current: totalInvoices.count
                    });
                }
            }

            if (planType === 'pro') {
                const invoicesSinceStart = await db.get(
                    'SELECT COUNT(*) as count FROM invoices WHERE user_id = $1 AND created_at >= $2',
                    [req.user.userId, planStartDate]
                );
                if (invoicesSinceStart.count >= 10) {
                    return res.status(403).json({
                        error: 'Invoice limit reached',
                        message: 'Pro plan is limited to 10 invoices per subscription term. Please upgrade to Enterprise for unlimited invoices.',
                        limit: 10,
                        current: invoicesSinceStart.count
                    });
                }
            }
        }

        // Client Limits
        if (isCreatingClient && req.method === 'POST') {
            if (planType === 'free') {
                const totalClients = await db.get(
                    `SELECT COUNT(*) as count FROM clients WHERE user_id = $1`,
                    [req.user.userId]
                );
                if (totalClients.count >= 1) {
                    return res.status(403).json({
                        error: 'Client limit reached',
                        message: 'Free plan is limited to 1 client. Please upgrade to Pro or Enterprise.',
                        limit: 1,
                        current: totalClients.count
                    });
                }
            }

            if (planType === 'pro') {
                const clientsSinceStart = await db.get(
                    'SELECT COUNT(*) as count FROM clients WHERE user_id = $1 AND created_at >= $2',
                    [req.user.userId, planStartDate]
                );

                if (clientsSinceStart.count >= 5) {
                    return res.status(403).json({
                        error: 'Client limit reached',
                        message: 'Pro plan is limited to 5 clients per subscription term. Please upgrade to Enterprise for unlimited clients.',
                        limit: 5,
                        current: clientsSinceStart.count
                    });
                }
            }
        }

        next();
    } catch (error) {
        next(error);
    }
}
