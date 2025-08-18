// 고객 기능 모듈
const CustomerModule = {
    currentTab: 'lily',
    currentPage: 1,
    itemsPerPage: 10,
    selectedPeriod: 'monthly',
    
    // 초기화
    init() {
        this.renderCatalog();
        this.setupEventListeners();
    },
    
    // 이벤트 리스너 설정
    setupEventListeners() {
        // 탭 전환
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab')) {
                this.switchTab(e.target.dataset.tab);
            }
        });
    },
    
    // 카탈로그 렌더링
    renderCatalog() {
        const container = document.getElementById('productList');
        if (!container) return;
        
        const products = DataManager.products[this.currentTab];
        
        container.innerHTML = products.map(product => `
            <div class="card">
                <h3>${product.name}</h3>
                <div class="product-info">
                    <div>${Utils.getStockBadge(product.stock)}</div>
                    <div>${Utils.getPriceDisplay(product.price)}</div>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="CustomerModule.updateQty(${product.id}, -1)">-</button>
                    <span class="qty-display">${DataManager.cart[product.id] || 0}</span>
                    <button class="qty-btn" onclick="CustomerModule.updateQty(${product.id}, 1)">+</button>
                    <button class="qty-btn" onclick="CustomerModule.updateQty(${product.id}, 5)">+5</button>
                </div>
            </div>
        `).join('');
        
        this.updateTotal();
    },
    
    // 탭 전환
    switchTab(tab) {
        this.currentTab = tab;
        
        // 탭 활성화 상태 변경
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.remove('active');
            if (t.dataset.tab === tab) {
                t.classList.add('active');
            }
        });
        
        this.renderCatalog();
    },
    
    // 수량 업데이트
    updateQty(productId, change) {
        const product = DataManager.findProduct(productId);
        if (!product) return;
        
        // 품절 체크
        if (product.stock === 0 && change > 0) {
            Utils.showAlert('품절된 상품입니다.');
            return;
        }
        
        const current = DataManager.cart[productId] || 0;
        const newQty = Math.max(0, Math.min(product.stock, current + change));
        
        if (newQty === 0) {
            delete DataManager.cart[productId];
        } else {
            DataManager.cart[productId] = newQty;
        }
        
        this.renderCatalog();
    },
    
    // 총액 업데이트
    updateTotal() {
        let total = 0;
        
        for (const [productId, qty] of Object.entries(DataManager.cart)) {
            const product = DataManager.findProduct(parseInt(productId));
            if (product && product.price > 0) {
                total += product.price * qty;
            }
        }
        
        const totalElement = document.getElementById('totalAmount');
        if (totalElement) {
            totalElement.textContent = Utils.formatCurrency(total);
        }
    },
    
    // 주문하기
    placeOrder() {
        if (Object.keys(DataManager.cart).length === 0) {
            Utils.showAlert('상품을 선택해주세요.');
            return;
        }
        
        const items = [];
        let total = 0;
        
        for (const [productId, qty] of Object.entries(DataManager.cart)) {
            const product = DataManager.findProduct(parseInt(productId));
            if (product) {
                const subtotal = product.price * qty;
                items.push({
                    name: product.name,
                    qty: qty,
                    price: product.price,
                    subtotal: subtotal
                });
                if (product.price > 0) {
                    total += subtotal;
                }
            }
        }
        
        const order = DataManager.addOrder({
            customer: AuthManager.currentUser.code,
            customerName: AuthManager.currentUser.name,
            items: items,
            amount: total
        });
        
        DataManager.cart = {};
        Utils.showAlert(`주문이 완료되었습니다!\n주문번호: ${order.id}\n총 금액: ${Utils.formatCurrency(total)}`);
        this.renderCatalog();
    },
    
    // 주문 내역 렌더링
    renderOrders() {
        const container = document.getElementById('ordersList');
        if (!container) return;
        
        const customerOrders = DataManager.orders.filter(o => 
            o.customer === AuthManager.currentUser.code
        );
        
        // 페이지네이션
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageOrders = customerOrders.slice(start, end);
        
        container.innerHTML = pageOrders.map(order => `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: 600;">${order.date}</div>
                        <div style="color: var(--neutral-gray-700); font-size: 14px;">${order.id}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 18px; font-weight: 600;">${Utils.formatCurrency(order.amount)}</div>
                        <span class="badge badge-${order.status === 'paid' ? 'paid' : 'unpaid'}">
                            ${order.status === 'paid' ? '결제완료' : '미결제'}
                        </span>
                    </div>
                </div>
                <details style="margin-top: 16px;">
                    <summary style="cursor: pointer; color: var(--primary-green-800);">상세보기</summary>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--neutral-gray-300);">
                        ${order.items.map(item => `
                            <div style="padding: 8px 0;">
                                ${item.name} - ${item.qty}개 × ${Utils.formatCurrency(item.price)} = ${Utils.formatCurrency(item.subtotal)}
                            </div>
                        `).join('')}
                    </div>
                </details>
            </div>
        `).join('');
        
        // 페이지네이션 버튼
        if (customerOrders.length > this.itemsPerPage) {
            const pagination = Utils.createPagination(customerOrders.length, this.itemsPerPage, this.currentPage);
            container.innerHTML += `
                <div class="pagination">
                    ${pagination.hasPrev ? `<button onclick="CustomerModule.changePage(${this.currentPage - 1})">이전</button>` : ''}
                    ${pagination.pages.map(p => `
                        <button class="${p.active ? 'active' : ''}" onclick="CustomerModule.changePage(${p.page})">${p.page}</button>
                    `).join('')}
                    ${pagination.hasNext ? `<button onclick="CustomerModule.changePage(${this.currentPage + 1})">다음</button>` : ''}
                </div>
            `;
        }
    },
    
    // 페이지 변경
    changePage(page) {
        this.currentPage = page;
        this.renderOrders();
    },
    
    // 계산서 요청 렌더링
    renderInvoiceRequest() {
        const container = document.getElementById('invoiceContent');
        if (!container) return;
        
        // 연간 계산서 버튼 활성화 체크
        const isAnnualEnabled = Utils.checkAnnualInvoice();
        
        container.innerHTML = `
            <div class="info-message">
                <strong>안내:</strong> 계산서는 결제완료된 주문에 대해서만 발행됩니다. 미결제 건은 자동으로 제외됩니다.
            </div>
            
            <div class="period-selector" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 24px 0;">
                <button class="btn ${this.selectedPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="CustomerModule.selectPeriod('monthly')">
                    월별<br><small>전월 기준</small>
                </button>
                <button class="btn ${this.selectedPeriod === 'quarterly' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="CustomerModule.selectPeriod('quarterly')">
                    분기별<br><small>전분기 기준</small>
                </button>
                <button class="btn ${this.selectedPeriod === 'semiannual' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="CustomerModule.selectPeriod('semiannual')">
                    반기별<br><small>전반기 기준</small>
                </button>
                <button class="btn ${this.selectedPeriod === 'annual' ? 'btn-primary' : 'btn-secondary'}" 
                        onclick="CustomerModule.selectPeriod('annual')"
                        ${!isAnnualEnabled ? 'disabled' : ''}>
                    연간<br><small>12월 중순~말</small>
                </button>
            </div>
            
            ${!isAnnualEnabled && this.selectedPeriod === 'annual' ? `
                <div class="warning-message">
                    연간 계산서는 12월 15일부터 31일까지만 요청 가능합니다.
                </div>
            ` : ''}
            
            <div class="invoice-summary">
                ${this.getInvoiceSummary()}
            </div>
            
            <div class="company-info" style="background: var(--neutral-gray-100); padding: 20px; border-radius: 12px; margin: 20px 0;">
                <h3>고객사 정보</h3>
                <div style="margin-top: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>상호</span>
                        <strong>${AuthManager.currentUser.data.name}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>사업자번호</span>
                        <strong>${AuthManager.currentUser.data.business}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>이메일</span>
                        <strong>${AuthManager.currentUser.data.email}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>연락처</span>
                        <strong>${AuthManager.currentUser.data.phone}</strong>
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary" style="width: 100%;" onclick="CustomerModule.requestInvoice()">
                계산서 요청 보내기
            </button>
        `;
    },
    
    // 기간 선택
    selectPeriod(period) {
        if (period === 'annual' && !Utils.checkAnnualInvoice()) {
            Utils.showAlert('연간 계산서는 12월 15일부터 31일까지만 요청 가능합니다.');
            return;
        }
        
        this.selectedPeriod = period;
        this.renderInvoiceRequest();
    },
    
    // 계산서 요약 정보
    getInvoiceSummary() {
        const customerOrders = DataManager.orders.filter(o => 
            o.customer === AuthManager.currentUser.code
        );
        
        const paidOrders = customerOrders.filter(o => o.status === 'paid');
        const unpaidOrders = customerOrders.filter(o => o.status === 'unpaid');
        
        const paidTotal = paidOrders.reduce((sum, o) => sum + o.amount, 0);
        const unpaidTotal = unpaidOrders.reduce((sum, o) => sum + o.amount, 0);
        
        return `
            <div style="background: var(--neutral-gray-100); padding: 20px; border-radius: 12px;">
                <h3>예상 계산서 내역</h3>
                <div style="margin-top: 12px;">
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>선택 기간</span>
                        <strong>${Utils.getPeriodText(this.selectedPeriod)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                        <span>결제완료 주문</span>
                        <strong style="color: var(--semantic-success);">${paidOrders.length}건</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                       <span>미결제 주문 (제외)</span>
                       <strong style="color: var(--semantic-error);">${unpaidOrders.length}건</strong>
                   </div>
                   <div style="display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid var(--neutral-gray-300); margin-top: 12px; font-weight: 700; font-size: 18px;">
                       <span>계산서 발행 금액</span>
                       <span style="color: var(--primary-green-800);">${Utils.formatCurrency(paidTotal)}</span>
                   </div>
               </div>
           </div>
       `;
   },
   
   // 계산서 요청
   requestInvoice() {
       const customerOrders = DataManager.orders.filter(o => 
           o.customer === AuthManager.currentUser.code
       );
       
       const paidOrders = customerOrders.filter(o => o.status === 'paid');
       const paidTotal = paidOrders.reduce((sum, o) => sum + o.amount, 0);
       
       if (paidOrders.length === 0) {
           Utils.showAlert('결제완료된 주문이 없습니다.\n계산서는 결제완료된 주문에 대해서만 발행됩니다.');
           return;
       }
       
       const periodText = {
           'monthly': '월별',
           'quarterly': '분기별',
           'semiannual': '반기별',
           'annual': '연간'
       }[this.selectedPeriod];
       
       if (Utils.showConfirm(`${periodText} 계산서를 요청하시겠습니까?\n\n결제완료 주문: ${paidOrders.length}건\n총 금액: ${Utils.formatCurrency(paidTotal)}\n\n* 미결제 주문은 자동으로 제외됩니다.`)) {
           const request = DataManager.addInvoiceRequest({
               customer: AuthManager.currentUser.code,
               customerName: AuthManager.currentUser.name,
               period: Utils.getPeriodText(this.selectedPeriod),
               type: this.selectedPeriod,
               requestAmount: paidTotal,
               paidCount: paidOrders.length,
               orders: paidOrders.map(o => o.id)
           });
           
           Utils.showAlert('계산서 요청이 완료되었습니다.\n관리자 확인 후 발행됩니다.');
           App.showCatalog();
       }
   }
};