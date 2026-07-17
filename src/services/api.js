import { apiClient, request } from '../api/client';

export const publicApi = {
  content: () => request(apiClient.get('/cms/content'), { showError: false }),
  trainers: (activeOnly = true) =>
    request(apiClient.get('/cms/trainers', { params: { activeOnly } }), { showError: false }),
  plans: (activeOnly = true) =>
    request(apiClient.get('/membership-plans', { params: { activeOnly } }), { showError: false }),
};

export const adminApi = {
  stats: () => request(apiClient.get('/dashboard/stats')),
  members: (params) => request(apiClient.get('/members/dashboard', { params })),
  membersBasic: () => request(apiClient.get('/members')),
  member: (id) => request(apiClient.get(`/members/${id}`)),
  createMember: (payload) =>
    request(apiClient.post('/members', payload), { successMessage: 'Member created' }),
  updateMember: (id, payload) =>
    request(apiClient.patch(`/members/${id}`, payload), { successMessage: 'Member updated' }),
  deleteMember: (id) =>
    request(apiClient.delete(`/members/${id}`), { successMessage: 'Member removed' }),

  plans: (activeOnly = false) =>
    request(apiClient.get('/membership-plans', { params: { activeOnly } })),
  createPlan: (payload) =>
    request(apiClient.post('/membership-plans', payload), { successMessage: 'Plan created' }),
  updatePlan: (id, payload) =>
    request(apiClient.patch(`/membership-plans/${id}`, payload), { successMessage: 'Plan updated' }),
  deletePlan: (id) =>
    request(apiClient.delete(`/membership-plans/${id}`), { successMessage: 'Plan removed' }),

  payments: () => request(apiClient.get('/payments')),
  createPayment: (payload) =>
    request(apiClient.post('/payments', payload), { successMessage: 'Payment recorded' }),
  updatePayment: (id, payload) =>
    request(apiClient.patch(`/payments/${id}`, payload), { successMessage: 'Payment updated' }),

  trainers: (activeOnly = false) =>
    request(apiClient.get('/cms/trainers', { params: { activeOnly } })),
  createTrainer: (payload) =>
    request(apiClient.post('/cms/trainers', payload), { successMessage: 'Trainer created' }),
  updateTrainer: (id, payload) =>
    request(apiClient.patch(`/cms/trainers/${id}`, payload), { successMessage: 'Trainer updated' }),
  deleteTrainer: (id) =>
    request(apiClient.delete(`/cms/trainers/${id}`), { successMessage: 'Trainer removed' }),

  content: () => request(apiClient.get('/cms/content')),
  updateContent: (payload) =>
    request(apiClient.patch('/cms/content', payload), { successMessage: 'Website content updated' }),

  coupons: () => request(apiClient.get('/coupons')),
  createCoupon: (payload) =>
    request(apiClient.post('/coupons', payload), { successMessage: 'Coupon created' }),
  updateCoupon: (id, payload) =>
    request(apiClient.patch(`/coupons/${id}`, payload), { successMessage: 'Coupon updated' }),
  deleteCoupon: (id) =>
    request(apiClient.delete(`/coupons/${id}`), { successMessage: 'Coupon removed' }),
  validateCoupon: (code, purchaseAmount) =>
    request(apiClient.get(`/coupons/validate/${code}`, { params: { purchaseAmount } })),

  users: () => request(apiClient.get('/users')),
  createUser: (payload) =>
    request(apiClient.post('/users', payload), { successMessage: 'Admin user created' }),
  updateUser: (id, payload) =>
    request(apiClient.patch(`/users/${id}`, payload), { successMessage: 'User updated' }),
  deleteUser: (id) =>
    request(apiClient.delete(`/users/${id}`), { successMessage: 'User removed' }),

  auditLogs: (limit = 50) => request(apiClient.get('/audit-logs', { params: { limit } })),
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(
      apiClient.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      { successMessage: 'Image uploaded' },
    );
  },
};

export const memberApi = {
  profile: () => request(apiClient.get('/members/my-profile')),
  paymentHistory: () => request(apiClient.get('/payments/my-history')),
};
