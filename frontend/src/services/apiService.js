import api from './api';

export const authApi = {
    register: (data) => api.post('/auth/register', data),

    login: (data) => api.post('/auth/login', data),

    verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),

    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),

    resetPassword: (data) => api.post('/auth/reset-password', data),
};

export const userApi = {
    getProfile: () => api.get('/users/me'),

    updateProfile: (data) => api.put('/users/profile', data),

    completeOnboarding: (data) => api.post('/users/onboarding', data),

    uploadLogo: (formData) => api.post('/users/upload-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const clientApi = {
    getClients: () => api.get('/clients'),

    getClient: (id) => api.get(`/clients/${id}`),

    createClient: (data) => api.post('/clients', data),

    updateClient: (id, data) => api.put(`/clients/${id}`, data),

    deleteClient: (id) => api.delete(`/clients/${id}`),
};

export const invoiceApi = {
    getInvoices: (params) => api.get('/invoices', { params }),

    getInvoice: (id) => api.get(`/invoices/${id}`),

    createInvoice: (data) => api.post('/invoices', data),

    updateInvoice: (id, data) => api.put(`/invoices/${id}`, data),

    finalizeInvoice: (id) => api.post(`/invoices/${id}/finalize`),

    deleteInvoice: (id) => api.delete(`/invoices/${id}`),

    downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),

    emailInvoice: (id, clientEmail) => api.post(`/invoices/${id}/email`, { clientEmail }),

    getStats: () => api.get('/invoices/stats'),
};

export const subscriptionApi = {
    getCurrentSubscription: () => api.get('/subscriptions/current'),

    createSubscription: (planType) => api.post('/subscriptions/create', { planType }),

    verifyPayment: (data) => api.post('/subscriptions/verify', data),

    getStatus: () => api.get('/subscriptions/status'),

    cancel: () => api.post('/subscriptions/cancel'),
};
