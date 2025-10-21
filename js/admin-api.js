// Admin APIs
export const adminAPI = {
    login: (email, password) => 
        apiCall('/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }),

    getDashboardStats: () => 
        apiCall('/admin/dashboard/stats'),

    getUsers: (page = 1, limit = 10) => 
        apiCall(`/admin/users?page=${page}&limit=${limit}`),

    getUserDetails: (userId) => 
        apiCall(`/admin/users/${userId}`),

    updateUser: (userId, userData) => 
        apiCall(`/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        }),

    getPayments: (page = 1, limit = 10) => 
        apiCall(`/admin/payments?page=${page}&limit=${limit}`),

    updatePaymentStatus: (paymentId, status) => 
        apiCall(`/admin/payments/${paymentId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        }),

    getReferrals: (page = 1, limit = 10) => 
        apiCall(`/admin/referrals?page=${page}&limit=${limit}`),

    getSettings: () => 
        apiCall('/admin/settings'),

    updateSettings: (settings) => 
        apiCall('/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        })
};