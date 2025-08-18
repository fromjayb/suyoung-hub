// 데이터 관리 모듈
const DataManager = {
    // 기획서 5. 데이터/텍스트 목업 기반
    products: {
        lily: [
            {id: 1, name: '소르본느', price: 1200, stock: 150, category: 'lily'},
            {id: 2, name: '시베리아', price: 0, stock: 200, category: 'lily'},
            {id: 3, name: '르네브', price: 0, stock: 0, category: 'lily'},
            {id: 4, name: '카사블랑카', price: 1500, stock: 80, category: 'lily'},
            {id: 5, name: '콘카도르', price: 1800, stock: 25, category: 'lily'}
        ],
        other: [
            {id: 6, name: '거베라', price: 1100, stock: 50, category: 'other'},
            {id: 7, name: '장미', price: 800, stock: 200, category: 'other'},
            {id: 8, name: '카네이션', price: 600, stock: 5, category: 'other'},
            {id: 9, name: '튤립', price: 900, stock: 0, category: 'other'},
            {id: 10, name: '프리지아', price: 700, stock: 120, category: 'other'}
        ]
    },
    
    customers: [
        {
            code: 'CUST001',
            name: '가나다 플라워',
            business: '123-45-67890',
            email: 'contact@ganada.co.kr',
            phone: '010-1234-5678',
            url: '/CUST001'
        }
    ],
    
    orders: [
        {
            id: 'ORD-CUST001-1754620118115',
            date: '2025-08-08',
            customer: 'CUST001',
            customerName: '가나다 플라워',
            amount: 75000,
            status: 'unpaid',
            items: [
                {name: '소르본느', qty: 50, price: 1200, subtotal: 60000},
                {name: '거베라', qty: 15, price: 1100, subtotal: 15000}
            ]
        },
        {
            id: 'ORD-CUST001-1754511111999',
            date: '2025-08-06',
            customer: 'CUST001',
            customerName: '가나다 플라워',
            amount: 64000,
            status: 'paid',
            items: [
                {name: '장미', qty: 80, price: 800, subtotal: 64000}
            ]
        }
    ],
    
    invoiceRequests: [],
    
    cart: {},
    
    // 로컬 스토리지에 데이터 저장
    save() {
        const data = {
            products: this.products,
            customers: this.customers,
            orders: this.orders,
            invoiceRequests: this.invoiceRequests
        };
        localStorage.setItem('suyoungHub', JSON.stringify(data));
    },
    
    // 로컬 스토리지에서 데이터 로드
    load() {
        const saved = localStorage.getItem('suyoungHub');
        if (saved) {
            const data = JSON.parse(saved);
            Object.assign(this, data);
        }
    },
    
    // 제품 추가
    addProduct(product) {
        const category = product.category || 'other';
        const newProduct = {
            ...product,
            id: Date.now()
        };
        this.products[category].push(newProduct);
        this.save();
        return newProduct;
    },
    
    // 제품 수정
    updateProduct(id, updates) {
        let product = null;
        ['lily', 'other'].forEach(category => {
            const index = this.products[category].findIndex(p => p.id === id);
            if (index !== -1) {
                Object.assign(this.products[category][index], updates);
                product = this.products[category][index];
            }
        });
        this.save();
        return product;
    },
    
    // 제품 삭제
    deleteProduct(id) {
        ['lily', 'other'].forEach(category => {
            this.products[category] = this.products[category].filter(p => p.id !== id);
        });
        this.save();
    },
    
    // 제품 찾기
    findProduct(id) {
        return [...this.products.lily, ...this.products.other].find(p => p.id === id);
    },
    
    // 주문 추가
    addOrder(order) {
        const newOrder = {
            ...order,
            id: `ORD-${order.customer}-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            status: 'unpaid'
        };
        this.orders.unshift(newOrder);
        this.save();
        return newOrder;
    },
    
    // 주문 상태 변경
    updateOrderStatus(orderId, status) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            this.save();
        }
        return order;
    },
    
    // 고객 추가
    addCustomer(customer) {
        const newCustomer = {
            ...customer,
            code: customer.code || `CUST${String(Math.floor(Math.random() * 900) + 100)}`,
            url: `/${customer.code || this.customers.length + 1}`
        };
        this.customers.push(newCustomer);
        this.save();
        return newCustomer;
    },
    
    // 고객 수정
    updateCustomer(code, updates) {
        const customer = this.customers.find(c => c.code === code);
        if (customer) {
            Object.assign(customer, updates);
            this.save();
        }
        return customer;
    },
    
    // 고객 삭제
    deleteCustomer(code) {
        this.customers = this.customers.filter(c => c.code !== code);
        this.save();
    },
    
    // 계산서 요청 추가
    addInvoiceRequest(request) {
        const newRequest = {
            ...request,
            id: Date.now(),
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        this.invoiceRequests.unshift(newRequest);
        this.save();
        return newRequest;
    },
    
    // 오늘 주문 조회
    getTodayOrders() {
        const today = new Date().toISOString().split('T')[0];
        return this.orders.filter(o => o.date === today);
    },
    
    // 미결제 주문 조회
    getUnpaidOrders() {
        return this.orders.filter(o => o.status === 'unpaid');
    },
    
    // 통계 계산
    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(o => o.date === today);
        const unpaidOrders = this.orders.filter(o => o.status === 'unpaid');
        const paidOrders = this.orders.filter(o => o.status === 'paid');
        
        return {
            todayCount: todayOrders.length,
            unpaidAmount: unpaidOrders.reduce((sum, o) => sum + o.amount, 0),
            monthlyRevenue: paidOrders.reduce((sum, o) => sum + o.amount, 0),
            activeCustomers: this.customers.length
        };
    }
};