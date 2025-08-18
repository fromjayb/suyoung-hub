// 전체 데이터 저장소
window.DataManager = window.DataManager || {
    products: {
        lily: [
            {id: 1, name: '소르본느', price: 1200, stock: 150},
            {id: 2, name: '시베리아', price: 0, stock: 200},
            {id: 3, name: '카사블랑카', price: 1500, stock: 80}
        ],
        other: [
            {id: 4, name: '거베라', price: 1100, stock: 50},
            {id: 5, name: '장미', price: 800, stock: 200},
            {id: 6, name: '튤립', price: 900, stock: 0}
        ]
    },
    orders: [],
    customers: [{code: 'CUST001', name: '가나다 플라워', phone: '010-1234-5678'}],
    cart: {},
    currentUser: null
};

// 앱 시작 함수
const App = {
    init() {
        this.renderLogin();
    },
    
    renderLogin() {
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="logo">
                        <h1>수영원예 HUB</h1>
                        <p>절화 주문 통합 관리 시스템</p>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600;">고객 코드</label>
                        <input type="text" class="form-input" id="customerCode" placeholder="CUST001 입력">
                    </div>
                    <button class="btn btn-primary" onclick="App.customerLogin()">로그인하기</button>
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="#" onclick="App.showAdminLogin()" style="color: var(--primary);">관리자 로그인</a>
                    </div>
                </div>
            </div>
        `;
    },
    
    customerLogin() {
        const code = document.getElementById('customerCode').value;
        if (code === 'CUST001' || code.toLowerCase() === 'cust001') {
            DataManager.currentUser = 'customer';
            this.renderCustomerApp();
        } else {
            alert('코드를 다시 확인해주세요! (힌트: CUST001)');
        }
    },
    
    showAdminLogin() {
        const password = prompt('관리자 비밀번호를 입력하세요:');
        if (password === 'admin' || password === '1234') {
            DataManager.currentUser = 'admin';
            this.renderAdminApp();
        } else if (password) {
            alert('비밀번호가 틀렸습니다! (힌트: admin)');
        }
    },
    
    renderCustomerApp() {
        document.getElementById('app').innerHTML = `
            <div style="background: white; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div class="container">
                    <h1 style="color: var(--primary);">수영원예 HUB - 고객 페이지</h1>
                </div>
            </div>
            <div class="container" style="padding: 20px;">
                <h2>🌸 꽃 주문하기</h2>
                <div id="productList"></div>
                <div style="position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 16px; box-shadow: 0 -2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                        <div style="font-size: 20px; font-weight: bold;">총액: <span id="total">₩0</span></div>
                        <button class="btn btn-primary" style="width: 150px;" onclick="App.placeOrder()">주문하기</button>
                    </div>
                </div>
            </div>
        `;
        this.renderProducts();
    },
    
    renderAdminApp() {
        document.getElementById('app').innerHTML = `
            <div style="background: white; padding: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div class="container">
                    <h1 style="color: var(--primary);">수영원예 HUB - 관리자 페이지</h1>
                </div>
            </div>
            <div class="container" style="padding: 20px;">
                <h2>📊 관리자 대시보드</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0;">
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="color: var(--gray-700); font-size: 14px;">오늘 주문</div>
                        <div style="font-size: 32px; font-weight: bold; color: var(--primary);">12건</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <div style="color: var(--gray-700); font-size: 14px;">총 매출</div>
                        <div style="font-size: 32px; font-weight: bold; color: var(--primary);">₩4,250,000</div>
                    </div>
                </div>
                <button class="btn btn-primary" onclick="App.renderLogin()">로그아웃</button>
            </div>
        `;
    },
    
    renderProducts() {
        const products = [...DataManager.products.lily, ...DataManager.products.other];
        const productList = document.getElementById('productList');
        
        productList.innerHTML = products.map(p => `
            <div style="background: white; padding: 20px; margin: 16px 0; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3>${p.name}</h3>
                <p>가격: ${p.price > 0 ? '₩' + p.price : '가격 미정'}</p>
                <p>재고: ${p.stock > 0 ? p.stock + '개' : '품절'}</p>
                <div style="display: flex; gap: 10px; margin-top: 10px;">
                    <button onclick="App.updateQty(${p.id}, -1)" style="padding: 8px 16px; cursor: pointer;">-</button>
                    <span style="padding: 8px 16px; background: #f0f0f0;">${DataManager.cart[p.id] || 0}</span>
                    <button onclick="App.updateQty(${p.id}, 1)" style="padding: 8px 16px; cursor: pointer;">+</button>
                </div>
            </div>
        `).join('');
        
        this.updateTotal();
    },
    
    updateQty(id, change) {
        const current = DataManager.cart[id] || 0;
        const newQty = Math.max(0, current + change);
        
        if (newQty === 0) {
            delete DataManager.cart[id];
        } else {
            DataManager.cart[id] = newQty;
        }
        
        this.renderProducts();
    },
    
    updateTotal() {
        const products = [...DataManager.products.lily, ...DataManager.products.other];
        let total = 0;
        
        for (const [id, qty] of Object.entries(DataManager.cart)) {
            const product = products.find(p => p.id === parseInt(id));
            if (product && product.price > 0) {
                total += product.price * qty;
            }
        }
        
        document.getElementById('total').textContent = '₩' + total.toLocaleString();
    },
    
    placeOrder() {
        if (Object.keys(DataManager.cart).length === 0) {
            alert('상품을 선택해주세요!');
            return;
        }
        
        alert('주문이 완료되었습니다!');
        DataManager.cart = {};
        this.renderProducts();
    }
};

// 페이지 로드시 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});