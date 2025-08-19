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
    
    partners: [
        {
            code: '123456',
            name: '가나다 플라워',
            business: '123-45-67890',
            email: 'contact@ganada.co.kr',
            phone: '010-1234-5678',
            url: '/123456'
        }
    ],
    
    // 기존 customers 속성을 partners로 참조하는 호환성 유지
    get customers() {
        return this.partners;
    },
    
    orders: [
        // 8월 주문들
        {
            id: 'ORD-123456-1754620118115',
            date: '2025-08-08',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 75000,
            status: 'paid',
            items: [
                {name: '소르본느', qty: 50, price: 1200, subtotal: 60000},
                {name: '거베라', qty: 15, price: 1100, subtotal: 15000}
            ]
        },
        {
            id: 'ORD-123456-1754511111999',
            date: '2025-08-06',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 64000,
            status: 'paid',
            items: [
                {name: '장미', qty: 80, price: 800, subtotal: 64000}
            ]
        },
        // 7월 주문들 (테스트용)
        {
            id: 'ORD-123456-1722345678901',
            date: '2025-07-28',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 84000,
            status: 'paid',
            items: [
                {name: '카사블랑카', qty: 40, price: 1500, subtotal: 60000},
                {name: '프리지아', qty: 30, price: 700, subtotal: 21000},
                {name: '카네이션', qty: 5, price: 600, subtotal: 3000}
            ]
        },
        {
            id: 'ORD-123456-1721234567890',
            date: '2025-07-22',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 95000,
            status: 'paid',
            items: [
                {name: '소르본느', qty: 35, price: 1200, subtotal: 42000},
                {name: '콘카도르', qty: 25, price: 1800, subtotal: 45000},
                {name: '장미', qty: 10, price: 800, subtotal: 8000}
            ]
        },
        {
            id: 'ORD-123456-1721876543210',
            date: '2025-07-18',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 127000,
            status: 'paid',
            items: [
                {name: '카사블랑카', qty: 60, price: 1500, subtotal: 90000},
                {name: '거베라', qty: 25, price: 1100, subtotal: 27500},
                {name: '튤립', qty: 10, price: 900, subtotal: 9500}
            ]
        },
        {
            id: 'ORD-123456-1721654321098',
            date: '2025-07-12',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 68500,
            status: 'paid',
            items: [
                {name: '장미', qty: 45, price: 800, subtotal: 36000},
                {name: '프리지아', qty: 35, price: 700, subtotal: 24500},
                {name: '장미', qty: 10, price: 800, subtotal: 8000}
            ]
        },
        {
            id: 'ORD-123456-1721098765432',
            date: '2025-07-08',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 52800,
            status: 'paid',
            items: [
                {name: '소르본느', qty: 20, price: 1200, subtotal: 24000},
                {name: '콘카도르', qty: 16, price: 1800, subtotal: 28800}
            ]
        },
        {
            id: 'ORD-123456-1720123456789',
            date: '2025-07-03',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 33000,
            status: 'unpaid',
            items: [
                {name: '거베라', qty: 20, price: 1100, subtotal: 22000},
                {name: '거베라', qty: 10, price: 1100, subtotal: 11000}
            ]
        },
        // 6월 주문들 (페이징 테스트용)
        {
            id: 'ORD-123456-1719876543210',
            date: '2025-06-29',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 91500,
            status: 'paid',
            items: [
                {name: '소르본느', qty: 40, price: 1200, subtotal: 48000},
                {name: '카사블랑카', qty: 25, price: 1500, subtotal: 37500},
                {name: '카네이션', qty: 10, price: 600, subtotal: 6000}
            ]
        },
        {
            id: 'ORD-123456-1719654321098',
            date: '2025-06-25',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 73200,
            status: 'paid',
            items: [
                {name: '장미', qty: 60, price: 800, subtotal: 48000},
                {name: '프리지아', qty: 36, price: 700, subtotal: 25200}
            ]
        },
        {
            id: 'ORD-123456-1719432109876',
            date: '2025-06-20',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 115800,
            status: 'paid',
            items: [
                {name: '콘카도르', qty: 35, price: 1800, subtotal: 63000},
                {name: '거베라', qty: 48, price: 1100, subtotal: 52800}
            ]
        },
        {
            id: 'ORD-123456-1719210987654',
            date: '2025-06-15',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 82500,
            status: 'paid',
            items: [
                {name: '카사블랑카', qty: 30, price: 1500, subtotal: 45000},
                {name: '소르본느', qty: 25, price: 1200, subtotal: 30000},
                {name: '장미', qty: 10, price: 800, subtotal: 7500}
            ]
        },
        {
            id: 'ORD-123456-1718987654321',
            date: '2025-06-10',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 56700,
            status: 'unpaid',
            items: [
                {name: '프리지아', qty: 45, price: 700, subtotal: 31500},
                {name: '카네이션', qty: 42, price: 600, subtotal: 25200}
            ]
        },
        {
            id: 'ORD-123456-1718765432109',
            date: '2025-06-05',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 94800,
            status: 'paid',
            items: [
                {name: '콘카도르', qty: 28, price: 1800, subtotal: 50400},
                {name: '거베라', qty: 32, price: 1100, subtotal: 35200},
                {name: '튤립', qty: 10, price: 900, subtotal: 9200}
            ]
        },
        // 5월 주문들 (페이징 테스트용)
        {
            id: 'ORD-123456-1717543210987',
            date: '2025-05-28',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 108000,
            status: 'paid',
            items: [
                {name: '카사블랑카', qty: 48, price: 1500, subtotal: 72000},
                {name: '장미', qty: 45, price: 800, subtotal: 36000}
            ]
        },
        {
            id: 'ORD-123456-1717321098765',
            date: '2025-05-22',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 76300,
            status: 'paid',
            items: [
                {name: '소르본느', qty: 38, price: 1200, subtotal: 45600},
                {name: '프리지아', qty: 44, price: 700, subtotal: 30800}
            ]
        },
        {
            id: 'ORD-123456-1717098765432',
            date: '2025-05-15',
            customer: '123456',
            customerName: '가나다 플라워',
            amount: 89200,
            status: 'unpaid',
            items: [
                {name: '콘카도르', qty: 32, price: 1800, subtotal: 57600},
                {name: '거베라', qty: 28, price: 1100, subtotal: 30800},
                {name: '카네이션', qty: 2, price: 600, subtotal: 800}
            ]
        }
    ],
    
    invoiceRequests: [
        {
            id: 1734123456789,
            customer: '123456',
            customerName: '가나다 플라워',
            period: '2025년 8월',
            type: 'monthly',
            requestAmount: 139000,
            paidCount: 2,
            requestDate: '2025-08-19',
            status: 'pending'
        }
    ],
    
    cart: {},
    
    // 로컬 스토리지에 데이터 저장
    save() {
        const data = {
            products: this.products,
            partners: this.partners,
            orders: this.orders,
            invoiceRequests: this.invoiceRequests
        };
        console.log('데이터 저장 중:', data); // 디버깅용
        localStorage.setItem('suyoungHub', JSON.stringify(data));
    },
    
    // 로컬 스토리지에서 데이터 로드
    load() {
        const saved = localStorage.getItem('suyoungHub');
        console.log('저장된 데이터 로드 시도:', saved ? '데이터 있음' : '데이터 없음');
        
        if (saved) {
            const data = JSON.parse(saved);
            // 기존 데이터와 병합 (새로운 필드나 테스트 데이터 유지)
            if (data.products) this.products = data.products;
            if (data.partners) this.partners = data.partners;
            if (data.orders) {
                this.orders = data.orders;
                console.log('로드된 주문 데이터 개수:', this.orders.length);
            }
            if (data.invoiceRequests) this.invoiceRequests = data.invoiceRequests;
        } else {
            // 저장된 데이터가 없으면 강제로 초기 데이터 저장
            console.log('저장된 데이터가 없어서 강제 저장 실행');
            this.save();
        }
        
        // 7월 데이터가 없다면 강제로 추가
        const july2025Orders = this.orders.filter(o => o.date && o.date.startsWith('2025-07'));
        console.log('7월 주문 데이터 개수:', july2025Orders.length);
        
        if (july2025Orders.length < 6) {
            console.log('7월 데이터 부족, 강제 추가');
            this.ensureTestData();
        }
        
        // 테스트 데이터가 없으면 초기 데이터 저장
        if (!this.invoiceRequests || this.invoiceRequests.length === 0) {
            this.invoiceRequests = [
                {
                    id: 1734123456789,
                    customer: '123456',
                    customerName: '가나다 플라워',
                    period: '2025년 8월',
                    type: 'monthly',
                    requestAmount: 139000,
                    paidCount: 2,
                    requestDate: '2025-08-19',
                    status: 'pending'
                }
            ];
            this.save();
        }
        
        // 디버깅용: 현재 가격이 0인 상품들 로그 출력
        console.log('가격이 0인 상품들:', 
            [...this.products.lily, ...this.products.other]
            .filter(p => p.price === 0)
            .map(p => `${p.name}: ${p.price}원`)
        );
        
        // 디버깅용: 전체 주문 목록 로그 출력
        console.log('로드된 전체 주문 목록:', this.orders.length + '개');
        console.log('123456 파트너 주문:', this.orders.filter(o => o.customer === '123456').length + '개');
    },
    
    // 테스트 데이터 확보
    ensureTestData() {
        // 기존 주문에 7월 데이터가 부족하면 추가
        const existingJulyOrders = this.orders.filter(o => o.date && o.date.startsWith('2025-07'));
        
        if (existingJulyOrders.length < 6) {
            // 7월 테스트 데이터 강제 추가
            const julyTestOrders = [
                {
                    id: 'ORD-123456-1722345678901',
                    date: '2025-07-28',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 84000,
                    status: 'paid',
                    items: [
                        {name: '카사블랑카', qty: 40, price: 1500, subtotal: 60000},
                        {name: '프리지아', qty: 30, price: 700, subtotal: 21000},
                        {name: '카네이션', qty: 5, price: 600, subtotal: 3000}
                    ]
                },
                {
                    id: 'ORD-123456-1721234567890',
                    date: '2025-07-22',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 95000,
                    status: 'paid',
                    items: [
                        {name: '소르본느', qty: 35, price: 1200, subtotal: 42000},
                        {name: '콘카도르', qty: 25, price: 1800, subtotal: 45000},
                        {name: '장미', qty: 10, price: 800, subtotal: 8000}
                    ]
                },
                {
                    id: 'ORD-123456-1721876543210',
                    date: '2025-07-18',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 127000,
                    status: 'paid',
                    items: [
                        {name: '카사블랑카', qty: 60, price: 1500, subtotal: 90000},
                        {name: '거베라', qty: 25, price: 1100, subtotal: 27500},
                        {name: '튤립', qty: 10, price: 900, subtotal: 9500}
                    ]
                },
                {
                    id: 'ORD-123456-1721654321098',
                    date: '2025-07-12',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 68500,
                    status: 'paid',
                    items: [
                        {name: '장미', qty: 45, price: 800, subtotal: 36000},
                        {name: '프리지아', qty: 35, price: 700, subtotal: 24500},
                        {name: '장미', qty: 10, price: 800, subtotal: 8000}
                    ]
                },
                {
                    id: 'ORD-123456-1721098765432',
                    date: '2025-07-08',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 52800,
                    status: 'paid',
                    items: [
                        {name: '소르본느', qty: 20, price: 1200, subtotal: 24000},
                        {name: '콘카도르', qty: 16, price: 1800, subtotal: 28800}
                    ]
                },
                {
                    id: 'ORD-123456-1720123456789',
                    date: '2025-07-03',
                    customer: '123456',
                    customerName: '가나다 플라워',
                    amount: 33000,
                    status: 'unpaid',
                    items: [
                        {name: '거베라', qty: 20, price: 1100, subtotal: 22000},
                        {name: '거베라', qty: 10, price: 1100, subtotal: 11000}
                    ]
                }
            ];
            
            // 중복 제거 후 추가
            for (const testOrder of julyTestOrders) {
                const exists = this.orders.find(o => o.id === testOrder.id);
                if (!exists) {
                    this.orders.push(testOrder);
                }
            }
            
            console.log('7월 테스트 데이터 추가 완료');
            this.save();
        }
    },
    
    // 강제 데이터 초기화 (개발/테스트용)
    forceReset() {
        localStorage.removeItem('suyoungHub');
        console.log('로컬 스토리지 초기화됨');
        
        // 초기 데이터 다시 설정
        this.products = {
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
        };
        
        this.ensureTestData();
        this.save();
        console.log('강제 초기화 완료, 총 주문 개수:', this.orders.length);
    },
    
    // 디버깅용 메서드들
    debug() {
        console.log('=== 데이터 현황 ===');
        console.log('전체 주문 개수:', this.orders.length);
        console.log('123456 파트너 주문:', this.orders.filter(o => o.customer === '123456').length);
        console.log('7월 주문:', this.orders.filter(o => o.date && o.date.startsWith('2025-07')).length);
        console.log('8월 주문:', this.orders.filter(o => o.date && o.date.startsWith('2025-08')).length);
        
        const customer123456Orders = this.orders.filter(o => o.customer === '123456');
        console.log('123456 파트너 주문 목록:');
        customer123456Orders.forEach(order => {
            console.log(`- ${order.date}: ${order.id} (₩${order.amount})`);
        });
        
        return {
            totalOrders: this.orders.length,
            partner123456Orders: customer123456Orders.length,
            julyOrders: this.orders.filter(o => o.date && o.date.startsWith('2025-07')).length,
            augustOrders: this.orders.filter(o => o.date && o.date.startsWith('2025-08')).length,
            invoiceRequestsCount: this.invoiceRequests ? this.invoiceRequests.length : 0
        };
    },
    
    // 테스트 계산서 요청 생성 (디버깅용)
    createTestInvoiceRequest() {
        const testRequest = {
            customer: '123456',
            customerName: '가나다 플라워', 
            period: '2025년 7월',
            type: 'monthly',
            requestAmount: 427300, // 7월 결제완료 주문 총액
            paidCount: 5 // 7월 결제완료 주문 건수
        };
        
        console.log('테스트 계산서 요청 생성:', testRequest);
        const result = this.addInvoiceRequest(testRequest);
        
        // 즉시 관리자 페이지 새로고침
        setTimeout(() => {
            if (typeof AdminApp !== 'undefined' && AdminApp.currentPage === 'invoices') {
                AdminApp.forceDataSync();
                AdminApp.renderInvoiceRequestsTable();
            }
        }, 100);
        
        return result;
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
    
    // 파트너 추가
    addPartner(partner) {
        const newPartner = {
            ...partner,
            code: partner.code || String(Math.floor(Math.random() * 900000) + 100000),
            url: `/${partner.code || this.partners.length + 1}`
        };
        this.partners.push(newPartner);
        this.save();
        return newPartner;
    },
    
    // 기존 호환성을 위한 addCustomer 메서드
    addCustomer(customer) {
        return this.addPartner(customer);
    },
    
    // 파트너 수정
    updatePartner(code, updates) {
        const partner = this.partners.find(p => p.code === code);
        if (partner) {
            Object.assign(partner, updates);
            this.save();
        }
        return partner;
    },
    
    // 기존 호환성을 위한 updateCustomer 메서드
    updateCustomer(code, updates) {
        return this.updatePartner(code, updates);
    },
    
    // 파트너 삭제
    deletePartner(code) {
        this.partners = this.partners.filter(p => p.code !== code);
        this.save();
    },
    
    // 기존 호환성을 위한 deleteCustomer 메서드
    deleteCustomer(code) {
        return this.deletePartner(code);
    },
    
    // 계산서 요청 추가
    addInvoiceRequest(request) {
        const newRequest = {
            ...request,
            id: Date.now(),
            requestDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };
        
        // invoiceRequests 배열이 없으면 초기화
        if (!this.invoiceRequests) {
            this.invoiceRequests = [];
        }
        
        this.invoiceRequests.unshift(newRequest);
        console.log('계산서 요청 추가 후 전체 목록:', this.invoiceRequests);
        
        // 강제 저장 및 검증
        this.save();
        
        // 저장 후 즉시 검증
        setTimeout(() => {
            const saved = localStorage.getItem('suyoungHub');
            if (saved) {
                const data = JSON.parse(saved);
                console.log('저장 검증 - 계산서 요청 목록:', data.invoiceRequests);
            }
        }, 50);
        
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
    
    // 주문의 실시간 총액 계산 (현재 상품 가격 기준)
    calculateOrderRealTimeAmount(order) {
        let totalAmount = 0;
        let hasPricePending = false;
        
        if (order.items) {
            for (const item of order.items) {
                // 현재 상품 데이터에서 최신 가격 조회
                const currentProduct = [...this.products.lily, ...this.products.other]
                    .find(p => p.name === item.name);
                
                const currentPrice = currentProduct ? currentProduct.price : item.price;
                
                if (currentPrice > 0) {
                    totalAmount += currentPrice * item.qty;
                } else {
                    hasPricePending = true;
                }
            }
        }
        
        return { totalAmount, hasPricePending };
    },
    
    // 통계 계산 (실시간 가격 반영)
    getStats() {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = this.orders.filter(o => o.date === today);
        const unpaidOrders = this.orders.filter(o => o.status === 'unpaid');
        const paidOrders = this.orders.filter(o => o.status === 'paid');
        
        // 실시간 가격으로 금액 재계산
        const unpaidAmount = unpaidOrders.reduce((sum, order) => {
            const { totalAmount } = this.calculateOrderRealTimeAmount(order);
            return sum + totalAmount;
        }, 0);
        
        const monthlyRevenue = paidOrders.reduce((sum, order) => {
            const { totalAmount } = this.calculateOrderRealTimeAmount(order);
            return sum + totalAmount;
        }, 0);
        
        return {
            todayCount: todayOrders.length,
            unpaidAmount: unpaidAmount,
            monthlyRevenue: monthlyRevenue,
            activePartners: this.partners.length
        };
    }
};