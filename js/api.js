// api.js - Frontend Only with Session Storage
const SESSION_KEYS = {
    USERS: 'dribzap_users',
    CURRENT_USER: 'dribzap_current_user',
    ADMIN_USERS: 'dribzap_admin_users',
    CURRENT_ADMIN: 'dribzap_current_admin',
    VIDEOS: 'dribzap_videos',
    TASKS: 'dribzap_tasks',
    WITHDRAWALS: 'dribzap_withdrawals',
    REFERRALS: 'dribzap_referrals'
};

// Initialize demo data
function initializeDemoData() {
    if (!sessionStorage.getItem(SESSION_KEYS.USERS)) {
        const demoUsers = [
            {
                id: 1,
                fullName: 'John Doe',
                email: 'user@demo.com',
                password: 'demo123',
                walletBalance: 25.50,
                videosWatched: 150,
                totalReferrals: 5,
                isAdmin: false,
                joinDate: '2024-01-15'
            }
        ];
        sessionStorage.setItem(SESSION_KEYS.USERS, JSON.stringify(demoUsers));
    }

    if (!sessionStorage.getItem(SESSION_KEYS.ADMIN_USERS)) {
        const demoAdmins = [
            {
                id: 1,
                fullName: 'Admin User',
                email: 'admin@dribzap.com',
                password: 'admin123',
                isAdmin: true
            }
        ];
        sessionStorage.setItem(SESSION_KEYS.ADMIN_USERS, JSON.stringify(demoAdmins));
    }

    if (!sessionStorage.getItem(SESSION_KEYS.VIDEOS)) {
        const demoVideos = [
            { id: 1, title: 'Video #1', duration: 30, earnings: 0.10, watched: false },
            { id: 2, title: 'Video #2', duration: 45, earnings: 0.10, watched: false },
            { id: 3, title: 'Video #3', duration: 60, earnings: 0.15, watched: false }
        ];
        sessionStorage.setItem(SESSION_KEYS.VIDEOS, JSON.stringify(demoVideos));
    }

    if (!sessionStorage.getItem(SESSION_KEYS.TASKS)) {
        const demoTasks = [
            { id: 'instagram', title: 'Follow on Instagram', earnings: 1.00, completed: false },
            { id: 'telegram', title: 'Join Telegram Channel', earnings: 0.50, completed: false },
            { id: 'facebook', title: 'Share on Facebook', earnings: 2.00, completed: false }
        ];
        sessionStorage.setItem(SESSION_KEYS.TASKS, JSON.stringify(demoTasks));
    }

    if (!sessionStorage.getItem(SESSION_KEYS.WITHDRAWALS)) {
        sessionStorage.setItem(SESSION_KEYS.WITHDRAWALS, JSON.stringify([]));
    }

    if (!sessionStorage.getItem(SESSION_KEYS.REFERRALS)) {
        sessionStorage.setItem(SESSION_KEYS.REFERRALS, JSON.stringify([]));
    }
}

// Initialize data when module loads
initializeDemoData();

// Common utility functions
function getItem(key) {
    return JSON.parse(sessionStorage.getItem(key) || '[]');
}

function setItem(key, data) {
    sessionStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

// Auth APIs
export const authAPI = {
    login: (email, password) => {
        const users = getItem(SESSION_KEYS.USERS);
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            setItem(SESSION_KEYS.CURRENT_USER, userWithoutPassword);
            return { success: true, data: { user: userWithoutPassword, token: 'demo-token-' + user.id } };
        }
        return { success: false, message: 'Invalid email or password' };
    },

    signup: (userData) => {
        const users = getItem(SESSION_KEYS.USERS);
        const existingUser = users.find(u => u.email === userData.email);
        
        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }

        const newUser = {
            id: generateId(),
            ...userData,
            walletBalance: 0,
            videosWatched: 0,
            totalReferrals: 0,
            isAdmin: false,
            joinDate: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);
        setItem(SESSION_KEYS.USERS, users);

        const { password: _, ...userWithoutPassword } = newUser;
        setItem(SESSION_KEYS.CURRENT_USER, userWithoutPassword);
        
        return { 
            success: true, 
            data: { 
                user: userWithoutPassword, 
                token: 'demo-token-' + newUser.id 
            } 
        };
    }
};

// User APIs
export const userAPI = {
    getDashboard: () => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }
        return { 
            success: true, 
            data: { 
                user: currentUser, 
                transactions: [] 
            } 
        };
    },

    watchVideo: (videoId) => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        const videos = getItem(SESSION_KEYS.VIDEOS);
        const video = videos.find(v => v.id == videoId);
        
        if (!video || video.watched) {
            return { success: false, message: 'Video not available or already watched' };
        }

        // Update video status
        video.watched = true;
        setItem(SESSION_KEYS.VIDEOS, videos);

        // Update user balance
        const users = getItem(SESSION_KEYS.USERS);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].walletBalance += video.earnings;
            users[userIndex].videosWatched += 1;
            setItem(SESSION_KEYS.USERS, users);
            
            // Update current user session
            const updatedUser = users[userIndex];
            const { password: _, ...userWithoutPassword } = updatedUser;
            setItem(SESSION_KEYS.CURRENT_USER, userWithoutPassword);

            return { 
                success: true, 
                data: { 
                    earnings: video.earnings, 
                    newBalance: updatedUser.walletBalance 
                } 
            };
        }

        return { success: false, message: 'User not found' };
    },

    completeTask: (taskId) => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        const tasks = getItem(SESSION_KEYS.TASKS);
        const task = tasks.find(t => t.id === taskId);
        
        if (!task || task.completed) {
            return { success: false, message: 'Task not available or already completed' };
        }

        // Update task status
        task.completed = true;
        setItem(SESSION_KEYS.TASKS, tasks);

        // Update user balance
        const users = getItem(SESSION_KEYS.USERS);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].walletBalance += task.earnings;
            setItem(SESSION_KEYS.USERS, users);
            
            // Update current user session
            const updatedUser = users[userIndex];
            const { password: _, ...userWithoutPassword } = updatedUser;
            setItem(SESSION_KEYS.CURRENT_USER, userWithoutPassword);

            return { 
                success: true, 
                data: { 
                    earnings: task.earnings, 
                    newBalance: updatedUser.walletBalance 
                } 
            };
        }

        return { success: false, message: 'User not found' };
    }
};

// Payment APIs
export const paymentAPI = {
    requestWithdrawal: (amount, method, accountInfo) => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        if (currentUser.walletBalance < amount) {
            return { success: false, message: 'Insufficient balance' };
        }

        const withdrawals = getItem(SESSION_KEYS.WITHDRAWALS);
        const newWithdrawal = {
            id: generateId(),
            userId: currentUser.id,
            amount: parseFloat(amount),
            method,
            accountInfo,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        withdrawals.push(newWithdrawal);
        setItem(SESSION_KEYS.WITHDRAWALS, withdrawals);

        // Update user balance
        const users = getItem(SESSION_KEYS.USERS);
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        
        if (userIndex !== -1) {
            users[userIndex].walletBalance -= amount;
            setItem(SESSION_KEYS.USERS, users);
            
            // Update current user session
            const updatedUser = users[userIndex];
            const { password: _, ...userWithoutPassword } = updatedUser;
            setItem(SESSION_KEYS.CURRENT_USER, userWithoutPassword);

            return { success: true, data: newWithdrawal };
        }

        return { success: false, message: 'Withdrawal request failed' };
    },

    getWithdrawalHistory: () => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        const withdrawals = getItem(SESSION_KEYS.WITHDRAWALS);
        const userWithdrawals = withdrawals.filter(w => w.userId === currentUser.id);
        
        return { success: true, data: { withdrawals: userWithdrawals } };
    }
};

// Referral APIs
export const referralAPI = {
    getStats: () => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        const referrals = getItem(SESSION_KEYS.REFERRALS);
        const userReferrals = referrals.filter(r => r.referrerId === currentUser.id);
        const totalEarnings = userReferrals.reduce((sum, ref) => sum + ref.commission, 0);

        return { 
            success: true, 
            data: { 
                totalReferrals: userReferrals.length,
                totalEarnings: totalEarnings,
                referrals: userReferrals 
            } 
        };
    },

    getLink: () => {
        const currentUser = getItem(SESSION_KEYS.CURRENT_USER);
        if (!currentUser) {
            return { success: false, message: 'Not authenticated' };
        }

        return { 
            success: true, 
            data: { 
                referralLink: `https://dribzap.site/register?ref=${currentUser.id}` 
            } 
        };
    },

    getHistory: () => {
        return referralAPI.getStats();
    }
};

// Admin APIs
export const adminAPI = {
    login: (email, password) => {
        const admins = getItem(SESSION_KEYS.ADMIN_USERS);
        const admin = admins.find(a => a.email === email && a.password === password);
        
        if (admin) {
            const { password: _, ...adminWithoutPassword } = admin;
            setItem(SESSION_KEYS.CURRENT_ADMIN, adminWithoutPassword);
            return { success: true, data: { admin: adminWithoutPassword, token: 'admin-token-' + admin.id } };
        }
        return { success: false, message: 'Invalid admin credentials' };
    },

    getDashboardStats: () => {
        const users = getItem(SESSION_KEYS.USERS);
        const withdrawals = getItem(SESSION_KEYS.WITHDRAWALS);
        const videos = getItem(SESSION_KEYS.VIDEOS);

        const totalRevenue = users.reduce((sum, user) => sum + user.walletBalance, 0) * 0.2; // 20% platform fee
        const totalWithdrawals = withdrawals.filter(w => w.status === 'completed')
                                           .reduce((sum, w) => sum + w.amount, 0);
        const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
        const videosWatched = videos.filter(v => v.watched).length;

        return {
            success: true,
            data: {
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                totalUsers: users.length,
                totalWithdrawals: parseFloat(totalWithdrawals.toFixed(2)),
                pendingWithdrawals: pendingWithdrawals,
                videosWatched: videosWatched
            }
        };
    }
};

// Utility function to check authentication
export const checkAuth = () => {
    return !!getItem(SESSION_KEYS.CURRENT_USER);
};

// Utility function to check admin authentication
export const checkAdminAuth = () => {
    return !!getItem(SESSION_KEYS.CURRENT_ADMIN);
};

// Logout functions
export const logout = () => {
    sessionStorage.removeItem(SESSION_KEYS.CURRENT_USER);
};

export const adminLogout = () => {
    sessionStorage.removeItem(SESSION_KEYS.CURRENT_ADMIN);
};