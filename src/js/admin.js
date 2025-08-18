// 관리자 기능 모듈
const AdminModule = {
    currentSection: 'dashboard',
    showUnpaidOnly: false,
    
    // 초기화
    init() {
        this.showSection('dashboard');
    },
    
    // 섹션 전환
    showSection(section) {
        // 모든 섹션 숨기기
        document.querySelectorAll('.admin-section').forEach(s => {
            s.style.display = 'none';
        });
        
        // 선택된 섹션 표시
        const sectionEl = document.getElementById(section);
        if (sectionEl) {
            sectionEl.style.display = 'block';
        }
        
        // 사이드바 메뉴 활성화
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
        
        this.currentSection = section;
        this.loadSectionData(section);
        
        // 모바일에서 사이드바 닫기
        if (window.innerWidth < 768) {
            this.closeSidebar();
        }
    },
    
    // 섹션 데이터 로드
    loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'inventory':
                this.loadInventory();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'customers':
                this.loadCustomers();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'invoices':
                this.loadInvoices();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    },
    
    // 대시보드 로드
    loadDashboard() {
        const stats = DataManager.getStats();
        const container = document.getElementById('dashboardContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 32px;">
                <div class="stat-card">
                    <div class="stat-label">오늘 주문</div>
                    <div class="stat-value">${stats.todayCount}</div>
                    <div style="font-size: 12px; color: var(--semantic-success); margin-top: 8px;">
                        ▲ 20% 전일 대비
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">미결제 금액</div>
                    <div class="stat-value" style="color: var(--semantic-error);">
                        ${Utils.formatCurrency(stats.unpaidAmount)}
                    </div>
                    <div style="font-size: 12px; color: var(--semantic-warning); margin-top: 8px;">
                        ${DataManager.getUnpaidOrders().length}건 처리 대기
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">이번 달 매출</div>
                    <div class="stat-value">${Utils.formatCurrency(stats.monthlyRevenue)}</div>
                    <div style="font-size: 12px; color: var(--semantic-success); margin-top: 8px;">
                        ▲ 15% 전월 대비
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">활성 고객사</div>
                    <div class="stat-value">${stats.activeCustomers}</div>
                    <div style="font-size: 12px; color: var(--semantic-info); margin-top: 8px;">
                        신규 2개사
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>오늘 들어온 주문</h2>
                    <div class="toggle-container">
                        <label class="toggle-switch">
                            <input type="checkbox" class="toggle-input" onchange="AdminModule.toggleUnpaidFilter(this.checked)">
                            <span class="toggle-slider"></span>
                        </label>
                        <span>미결제만 보기</span>
                    </div>
                </div>
                
                <div class="table-container" style="overflow-x: auto;">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>고객명</th>
                                <th>주문일시</th>
                                <th>주문금액</th>
                                <th>상태</th>
                                <th>작업</th>
                            </tr>
                        </thead>
                        <tbody id="todayOrdersTable">
                            ${this.renderTodayOrders()}
                        </tbody>
                    </table>
                </div>
                
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="AdminModule.bulkPaymentComplete()">
                    선택항목 일괄 결제완료
                </button>
            </div>
        `;
    },
    
    // 오늘 주문 렌더링
    renderTodayOrders() {
        let orders = DataManager.getTodayOrders();
        
        if (this.showUnpaidOnly) {
            orders = orders.filter(o => o.status === 'unpaid');
        }
        
        if (orders.length === 0) {
            return '<tr><td colspan="5" style="text-align: center;">주문이 없습니다.</td></tr>';
        }
        
        return orders.map(order => `
            <tr data-order-id="${order.id}">
                <td>
                    <input type="checkbox" class="order-checkbox" value="${order.id}">
                    ${order.customerName}
                </td>
                <td>${order.date} ${new Date().toTimeString().slice(0, 5)}</td>
                <td>${Utils.formatCurrency(order.amount)}</td>
                <td>
                    <span class="badge badge-${order.status === 'paid' ? 'paid' : 'unpaid'}">
                        ${order.status === 'paid' ? '결제완료' : '미결제'}
                    </span>
                </td>
                <td>
                    ${order.status === 'unpaid' ? 
                        `<button class="btn btn-secondary" onclick="AdminModule.markAsPaid('${order.id}')">결제완료 처리</button>` : 
                        '-'
                    }
                </td>
            </tr>
        `).join('');
    },
    
    // 미결제 필터 토글
    toggleUnpaidFilter(checked) {
        this.showUnpaidOnly = checked;
        const tbody = document.getElementById('todayOrdersTable');
        if (tbody) {
            tbody.innerHTML = this.renderTodayOrders();
        }
    },
    
    // 결제완료 처리
    markAsPaid(orderId) {
        DataManager.updateOrderStatus(orderId, 'paid');
        Utils.showAlert('결제완료 처리되었습니다.');
        this.loadDashboard();
    },
    
    // 일괄 결제완료
    bulkPaymentComplete() {
        const checkboxes = document.querySelectorAll('.order-checkbox:checked');
        if (checkboxes.length === 0) {
            Utils.showAlert('처리할 주문을 선택해주세요.');
            return;
        }
        
        checkboxes.forEach(checkbox => {
            DataManager.updateOrderStatus(checkbox.value, 'paid');
        });
        
        Utils.showAlert(`${checkboxes.length}건의 주문이 결제완료 처리되었습니다.`);
        this.loadDashboard();
    },
    
    // 재고·단가 관리 로드
    loadInventory() {
        const container = document.getElementById('inventoryContent');
        if (!container) return;
        
        const allProducts = [...DataManager.products.lily, ...DataManager.products.other];
        
        container.innerHTML = `
            <div class="tabs">
                <button class="tab active" data-tab="lily" onclick="AdminModule.switchInventoryTab('lily')">백합류</button>
                <button class="tab" data-tab="other" onclick="AdminModule.switchInventoryTab('other')">기타</button>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>품종명</th>
                            <th>단가</th>
                            <th>재고</th>
                            <th>표시규칙</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody id="inventoryTable">
                        ${this.renderInventoryTable('lily')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 재고 테이블 렌더링
    renderInventoryTable(category) {
        const products = DataManager.products[category];
        
        return products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>
                    <input type="number" class="form-input" value="${product.price}" 
                           id="price-${product.id}" style="width: 120px;">
                </td>
                <td>
                    <input type="number" class="form-input" value="${product.stock}" 
                           id="stock-${product.id}" style="width: 100px;">
                </td>
                <td>${Utils.getStockBadge(product.stock)}</td>
                <td>
                    <button class="btn btn-primary" onclick="AdminModule.saveInventory(${product.id})">저장</button>
                </td>
            </tr>
        `).join('');
    },
    
    // 재고 탭 전환
    switchInventoryTab(category) {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            }
        });
        
        const tbody = document.getElementById('inventoryTable');
        if (tbody) {
            tbody.innerHTML = this.renderInventoryTable(category);
        }
    },
    
    // 재고 저장
    saveInventory(productId) {
        const price = parseInt(document.getElementById(`price-${productId}`).value) || 0;
        const stock = parseInt(document.getElementById(`stock-${productId}`).value) || 0;
        
        DataManager.updateProduct(productId, { price, stock });
        Utils.showAlert('저장되었습니다.');
        this.loadInventory();
    },
    
    // 상품 관리 로드
    loadProducts() {
        const container = document.getElementById('productsContent');
        if (!container) return;
        
        const allProducts = [...DataManager.products.lily, ...DataManager.products.other];
        
        container.innerHTML = `
            <button class="btn btn-primary" onclick="AdminModule.showAddProductModal()">+ 상품 추가</button>
            
            <div class="table-container" style="margin-top: 20px;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>품종명</th>
                            <th>카테고리</th>
                            <th>등록일</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allProducts.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.category === 'lily' ? '백합류' : '기타'}</td>
                                <td>${Utils.getToday()}</td>
                                <td><span class="badge badge-plenty">활성</span></td>
                                <td>
                                    <button class="btn btn-ghost" onclick="AdminModule.editProduct(${product.id})">수정</button>
                                    <button class="btn btn-ghost" onclick="AdminModule.deleteProduct(${product.id})">삭제</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 고객사 관리 로드
    loadCustomers() {
        const container = document.getElementById('customersContent');
        if (!container) return;
        
        container.innerHTML = `
            <button class="btn btn-primary" onclick="AdminModule.showAddCustomerModal()">+ 고객사 추가</button>
            
            <div class="table-container" style="margin-top: 20px;">
                <table class="table">
                    <thead>
                        <tr>
                            <th>고객코드</th>
                            <th>상호</th>
                            <th>사업자번호</th>
                            <th>이메일</th>
                            <th>연락처</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DataManager.customers.map(customer => `
                            <tr>
                                <td>${customer.code}</td>
                                <td>${customer.name}</td>
                                <td>${customer.business}</td>
                                <td>${customer.email}</td>
                                <td>${customer.phone}</td>
                                <td>
                                    <button class="btn btn-ghost" onclick="AdminModule.editCustomer('${customer.code}')">수정</button>
                                    <button class="btn btn-ghost" onclick="AdminModule.deleteCustomer('${customer.code}')">삭제</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 전체 주문 조회 로드
    loadOrders() {
        const container = document.getElementById('ordersContent');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
                <select class="form-input" id="orderCustomerFilter" style="width: 200px;">
                    <option value="">전체 고객</option>
                    ${DataManager.customers.map(c => `
                        <option value="${c.code}">${c.name}</option>
                    `).join('')}
                </select>
                <input type="date" class="form-input" id="orderStartDate" style="width: 150px;">
                <input type="date" class="form-input" id="orderEndDate" style="width: 150px;">
                <select class="form-input" id="orderStatusFilter" style="width: 150px;">
                    <option value="">전체</option>
                    <option value="unpaid">미결제</option>
                    <option value="paid">결제완료</option>
                </select>
                <button class="btn btn-primary" onclick="AdminModule.filterOrders()">조회</button>
                <button class="btn btn-secondary" onclick="AdminModule.exportOrders()">CSV 내보내기</button>
            </div>
            
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>주문일</th>
                            <th>고객명</th>
                            <th>주문번호</th>
                            <th>금액</th>
                            <th>상태</th>
                        </tr>
                    </thead>
                    <tbody id="ordersTable">
                        ${DataManager.orders.map(order => `
                            <tr>
                                <td>${order.date}</td>
                                <td>${order.customerName}</td>
                                <td>${order.id}</td>
                                <td>${Utils.formatCurrency(order.amount)}</td>
                                <td>
                                    <span class="badge badge-${order.status === 'paid' ? 'paid' : 'unpaid'}">
                                        ${order.status === 'paid' ? '결제완료' : '미결제'}
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 계산서 요청 현황 로드
    loadInvoices() {
        const container = document.getElementById('invoicesContent');
        if (!container) return;
        
        // 각 고객의 연간 누적 구매액 계산
        const customerTotals = {};
        DataManager.orders.filter(o => o.status === 'paid').forEach(order => {
            if (!customerTotals[order.customer]) {
                customerTotals[order.customer] = 0;
            }
            customerTotals[order.customer] += order.amount;
        });
        
        container.innerHTML = `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>요청일</th>
                            <th>고객</th>
                            <th>기간</th>
                            <th>구분</th>
                            <th>요청금액</th>
                            <th>연간누적</th>
                            <th>상태</th>
                            <th>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${DataManager.invoiceRequests.map(request => `
                            <tr>
                                <td>${request.requestDate}</td>
                                <td>${request.customerName}</td>
                                <td>${request.period}</td>
                                <td>${request.type === 'monthly' ? '월별' : 
                                     request.type === 'quarterly' ? '분기별' : 
                                     request.type === 'semiannual' ? '반기별' : '연간'}</td>
                                <td>${Utils.formatCurrency(request.requestAmount)}</td>
                                <td>${Utils.formatCurrency(customerTotals[request.customer] || 0)}</td>
                                <td>
                                    <span class="badge badge-${request.status === 'issued' ? 'paid' : 'pending'}">
                                        ${request.status === 'issued' ? '발행완료' : '대기'}
                                    </span>
                                </td>
                                <td>
                                    ${request.status === 'pending' ? 
                                        `<button class="btn btn-primary" onclick="AdminModule.issueInvoice(${request.id})">발행</button>` : 
                                        ''
                                    }
                                    <button class="btn btn-ghost" onclick="AdminModule.viewInvoiceDetail(${request.id})">상세</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // 설정 로드
    loadSettings() {
        const container = document.getElementById('settingsContent');
        if (!container) return;
        
        const stats = DataManager.getStats();
        
        container.innerHTML = `
            <div class="card">
                <h2>총 매출 합계</h2>
                <div class="dashboard-grid" style="margin-top: 20px;">
                    <div class="stat-card">
                        <div class="stat-label">전체 기간</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.monthlyRevenue * 12)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">올해</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.monthlyRevenue * 8)}</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">이번 달</div>
                        <div class="stat-value">${Utils.formatCurrency(stats.monthlyRevenue)}</div>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2>관리자 계정</h2>
                <div class="form-group">
                    <label class="form-label">현재 비밀번호</label>
                    <input type="password" class="form-input" id="currentPassword">
                </div>
                <div class="form-group">
                    <label class="form-label">새 비밀번호</label>
                    <input type="password" class="form-input" id="newPassword">
                </div>
                <div class="form-group">
                    <label class="form-label">새 비밀번호 확인</label>
                    <input type="password" class="form-input" id="confirmPassword">
                </div>
                <button class="btn btn-primary" onclick="AdminModule.changePassword()">비밀번호 변경</button>
            </div>
            
            <div class="card" style="margin-top: 20px;">
                <h2>감사 로그</h2>
                <p>최근 변경 이력이 여기에 표시됩니다.</p>
            </div>
        `;
    },
    
    // 비밀번호 변경
    changePassword() {
        const currentPw = document.getElementById('currentPassword').value;
        const newPw = document.getElementById('newPassword').value;
        const confirmPw = document.getElementById('confirmPassword').value;
        
        if (!currentPw || !newPw || !confirmPw) {
            Utils.showAlert('모든 필드를 입력해주세요.');
            return;
        }
        
        if (newPw !== confirmPw) {
            Utils.showAlert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (AuthManager.changePassword(currentPw, newPw)) {
            Utils.showAlert('비밀번호가 변경되었습니다.\n다음 로그인부터 적용됩니다.');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        }
    },
    
    // 사이드바 토글
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    },
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    },
    
    // 모달 관련
    showAddProductModal() {
        ModalComponent.showProductModal();
    },
    
    showAddCustomerModal() {
        ModalComponent.showCustomerModal();
    },
    
    editProduct(id) {
        const product = DataManager.findProduct(id);
        if (product) {
            const name = prompt('새 품종명:', product.name);
            if (name) {
                DataManager.updateProduct(id, { name });
                this.loadProducts();
            }
        }
    },
    
    deleteProduct(id) {
        if (Utils.showConfirm('정말 삭제하시겠습니까?')) {
            DataManager.deleteProduct(id);
            this.loadProducts();
        }
    },
    
    editCustomer(code) {
        const customer = DataManager.customers.find(c => c.code === code);
        if (customer) {
            const name = prompt('새 상호명:', customer.name);
            if (name) {
                DataManager.updateCustomer(code, { name });
                this.loadCustomers();
            }
        }
    },
    
    deleteCustomer(code) {
        if (Utils.showConfirm('정말 삭제하시겠습니까?\n관련된 주문 기록은 보존됩니다.')) {
            DataManager.deleteCustomer(code);
            this.loadCustomers();
        }
    },
    
    issueInvoice(id) {
        const request = DataManager.invoiceRequests.find(r => r.id === id);
        if (request) {
            request.status = 'issued';
            DataManager.save();
            Utils.showAlert('계산서가 발행되었습니다.');
            this.loadInvoices();
        }
    },
    
    viewInvoiceDetail(id) {
        const request = DataManager.invoiceRequests.find(r => r.id === id);
        if (request) {
            ModalComponent.showInvoiceDetail(request);
        }
    },
    
    exportOrders() {
        const data = DataManager.orders.map(order => ({
            '주문일': order.date,
            '고객명': order.customerName,
            '주문번호': order.id,
            '금액': order.amount,
            '상태': order.status === 'paid' ? '결제완료' : '미결제'
        }));
        
        Utils.exportToCSV(data, `orders_${Utils.getToday()}.csv`);
    }
};