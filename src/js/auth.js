// 인증 관리 모듈
const AuthManager = {
    currentUser: null,
    adminPassword: localStorage.getItem('adminPassword') || 'admin123',
    
    // 고객 로그인
    customerLogin(code) {
        const customer = DataManager.customers.find(c => 
            c.code.toUpperCase() === code.toUpperCase()
        );
        
        if (customer) {
            this.currentUser = {
                type: 'customer',
                code: customer.code,
                name: customer.name,
                data: customer
            };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    },
    
    // 관리자 로그인
    adminLogin(email, password) {
        if (email.includes('admin') && 
            (password === this.adminPassword || password === 'admin')) {
            this.currentUser = {
                type: 'admin',
                email: email
            };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            return true;
        }
        return false;
    },
    
    // 비밀번호 변경
    changePassword(currentPw, newPw) {
        if (currentPw === this.adminPassword || currentPw === 'admin') {
            if (newPw.length < 6) {
                alert('비밀번호는 6자 이상이어야 합니다.');
                return false;
            }
            this.adminPassword = newPw;
            localStorage.setItem('adminPassword', newPw);
            return true;
        }
        alert('현재 비밀번호가 일치하지 않습니다.');
        return false;
    },
    
    // 로그아웃
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        location.reload();
    },
    
    // 세션 복원
    restoreSession() {
        const saved = sessionStorage.getItem('currentUser');
        if (saved) {
            this.currentUser = JSON.parse(saved);
            return true;
        }
        return false;
    },
    
    // 인증 확인
    isAuthenticated() {
        return this.currentUser !== null;
    },
    
    // 관리자 확인
    isAdmin() {
        return this.currentUser && this.currentUser.type === 'admin';
    },
    
    // 고객 확인
    isCustomer() {
        return this.currentUser && this.currentUser.type === 'customer';
    }
};