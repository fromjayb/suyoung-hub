// 관리자 앱 객체 - 관리자용 화면 담당
const AdminApp = {
    currentPage: 'dashboard',
    currentTab: 'lily',
    
    init() {
        // 세션 상태 복원 시도
        const sessionState = this.loadSessionState();
        if (sessionState && sessionState.isLoggedIn && sessionState.userType === 'admin') {
            // 로그인 상태 복원
            DataManager.currentUser = sessionState.currentUser;
            
            // 세션 타임아웃 시작
            SessionManager.init();
            
            this.renderAdminLayout();
            // 현재 페이지 상태 복원
            const lastPage = sessionState.currentPage || 'dashboard';
            this.showPage(lastPage);
        } else {
            this.renderAdminLayout();
            this.showPage('dashboard');
        }
        this.saveSessionState(); // 초기 상태 저장
    },
    
    // 세션 상태 저장
    saveSessionState() {
        const sessionState = {
            isLoggedIn: !!DataManager.currentUser,
            userType: DataManager.currentUser?.type || null,
            currentUser: DataManager.currentUser,
            currentPage: this.currentPage,
            currentSection: this.currentSection || null
        };
        localStorage.setItem('adminSessionState', JSON.stringify(sessionState));
    },
    
    // 세션 상태 로드
    loadSessionState() {
        try {
            const saved = localStorage.getItem('adminSessionState');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    
    // 세션 상태 삭제
    clearSessionState() {
        localStorage.removeItem('adminSessionState');
    },
    
    renderAdminLayout() {
        document.getElementById('app').innerHTML = `
            ${Sidebar.render(this.currentPage)}
            <div class="overlay" id="overlay" onclick="Sidebar.toggle()"></div>
            <div class="admin-content" id="admin-main-content">
                <!-- 페이지 내용이 여기에 로드됩니다 -->
            </div>
        `;
    },
    
    showPage(pageId) {
        this.currentPage = pageId;
        this.saveSessionState(); // 세션 상태 저장
        
        // 최신 데이터 로드 (특히 계산서 요청 등의 실시간 데이터)
        DataManager.load();
        
        // 계산서관리 페이지인 경우 추가 강제 동기화
        if (pageId === 'invoices') {
            console.log('계산서관리 페이지 접근 - 강제 동기화 실행');
            this.forceDataSync();
            
            // 추가: 1초 후 한번 더 체크 (비동기 데이터 로드 대비)
            setTimeout(() => {
                console.log('계산서관리 페이지 - 지연 동기화 실행');
                this.forceDataSync();
                this.renderInvoiceRequestsTable();
            }, 1000);
        }
        
        // 사이드바 업데이트
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.innerHTML = Sidebar.render(pageId).match(/<div class="sidebar"[^>]*>(.*)<\/div>/s)[1];
        }
        
        // 페이지 콘텐츠 렌더링
        const mainContent = document.getElementById('admin-main-content');
        if (mainContent) {
            switch(pageId) {
                case 'dashboard':
                    this.renderDashboard();
                    break;
                case 'inventory':
                    this.renderInventory();
                    break;
                case 'products':
                    this.renderProducts();
                    break;
                case 'customers':
                    this.renderCustomers();
                    break;
                case 'orders':
                    this.renderOrders();
                    break;
                case 'invoices':
                    this.renderInvoices();
                    break;
                case 'settings':
                    this.renderSettings();
                    break;
                default:
                    this.renderDashboard();
            }
        }
    },
    
    // 대시보드 렌더링
    renderDashboard() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">대시보드</h1>
                    <div style="color: var(--neutral-gray-700);">
                        ${new Date().toLocaleDateString('ko-KR', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            weekday: 'long'
                        })}
                    </div>
                </div>
                
                <!-- 통계 카드들 -->
                <div id="stats-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--spacing-xl); margin-bottom: var(--spacing-2xl);">
                    <!-- JavaScript에서 동적 생성 -->
                </div>
                
                <!-- 오늘의 주문 -->
                <div class="card">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-xl);">
                        <h2 style="margin: 0;">오늘의 주문</h2>
                        <div style="display: flex; gap: var(--spacing-md);">
                            <button class="btn btn-secondary" onclick="AdminApp.showPage('orders')">
                                전체 주문 보기
                            </button>
                        </div>
                    </div>
                    
                    <div style="overflow-x: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>파트너사</th>
                                    <th>주문일</th>
                                    <th>금액</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody id="today-orders-tbody">
                                <!-- JavaScript에서 동적 생성 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        this.initDashboard();
    },
    
    // 파트너사 관리 렌더링
    renderCustomers() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">파트너사 관리</h1>
                    <button class="btn btn-primary" onclick="AdminApp.showAddCustomerModal()">
                        파트너 추가
                    </button>
                </div>
                
                <!-- 검색 -->
                <div class="card" style="margin-bottom: var(--spacing-xl);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-lg); align-items: end;">
                        <div>
                            <label class="form-label">상호 검색</label>
                            <input type="text" class="form-input" id="customer-name-search" placeholder="상호명을 입력하세요" onkeyup="AdminApp.searchCustomers()">
                        </div>
                        <div>
                            <label class="form-label">파트너코드 검색</label>
                            <input type="text" class="form-input" id="customer-code-search" placeholder="123456" onkeyup="AdminApp.searchCustomers()">
                        </div>
                    </div>
                </div>
                
                <!-- 파트너사 목록 -->
                <div id="customers-grid">
                    <!-- JavaScript에서 동적 생성 -->
                </div>
            </div>
            
            <!-- 파트너사 추가/수정 모달 템플릿 -->
            <template id="customer-modal-template">
                <div class="form-group">
                    <label class="form-label">상호 *</label>
                    <input type="text" class="form-input" id="modal-customer-name" placeholder="예: 가나다 플라워" required>
                </div>
                <div class="form-group">
                    <label class="form-label">파트너코드</label>
                    <input type="text" class="form-input" id="modal-customer-code" placeholder="자동 생성됩니다" readonly>
                    <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-xs);">
                        6자리 숫자 형태로 자동 생성됩니다.
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">사업자번호 *</label>
                    <input type="text" class="form-input" id="modal-customer-business" placeholder="123-45-67890" required>
                </div>
                <div class="form-group">
                    <label class="form-label">이메일 *</label>
                    <input type="email" class="form-input" id="modal-customer-email" placeholder="contact@company.co.kr" required>
                </div>
                <div class="form-group">
                    <label class="form-label">연락처 *</label>
                    <input type="tel" class="form-input" id="modal-customer-phone" placeholder="010-1234-5678" required>
                </div>
                <div style="background: var(--neutral-gray-100); padding: var(--spacing-lg); border-radius: var(--radius-md); margin-top: var(--spacing-lg);">
                    <div class="caption" style="color: var(--neutral-gray-700);">
                        <strong>파트너 전용 URL:</strong> <span id="modal-customer-url">저장 후 생성됩니다</span>
                    </div>
                </div>
            </template>
        `;
        this.initCustomers();
    },
    
    // 재고관리 렌더링
    renderInventory() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">재고관리</h1>
                    <div style="display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-secondary" onclick="AdminApp.exportInventory()">
                            내보내기
                        </button>
                        <button class="btn btn-primary" onclick="AdminApp.showPage('products')">
                            상품 관리
                        </button>
                    </div>
                </div>
                
                <!-- 탭 메뉴 -->
                <div class="tabs">
                    <button class="tab active" onclick="AdminApp.switchInventoryTab('lily')" data-tab="lily">
                        백합류
                    </button>
                    <button class="tab" onclick="AdminApp.switchInventoryTab('other')" data-tab="other">
                        기타
                    </button>
                </div>
                
                <!-- 재고 목록 -->
                <div id="inventory-list">
                    <!-- JavaScript에서 동적 생성 -->
                </div>
            </div>
        `;
        this.initInventory();
    },
    
    // 상품관리 렌더링
    renderProducts() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">상품관리</h1>
                    <button class="btn btn-primary" onclick="AdminApp.showAddProductModal()">
                        상품 추가
                    </button>
                </div>
                
                <!-- 탭 메뉴 -->
                <div class="tabs">
                    <button class="tab active" onclick="AdminApp.switchProductTab('lily')" data-tab="lily">
                        백합류
                    </button>
                    <button class="tab" onclick="AdminApp.switchProductTab('other')" data-tab="other">
                        기타
                    </button>
                </div>
                
                <!-- 상품 목록 -->
                <div id="products-list">
                    <!-- JavaScript에서 동적 생성 -->
                </div>
                
                <!-- 상품 추가/수정 모달 템플릿 -->
                <template id="product-modal-template">
                    <div class="form-group">
                        <label class="form-label">상품명 *</label>
                        <input type="text" class="form-input" id="modal-product-name" placeholder="예: 시베리아(외대)" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">분류 *</label>
                        <select class="form-input" id="modal-product-category" required>
                            <option value="">분류를 선택하세요</option>
                            <option value="lily">백합류</option>
                            <option value="other">기타</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">단가 (원)</label>
                        <input type="number" class="form-input" id="modal-product-price" placeholder="0" min="0">
                        <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-xs);">
                            0원으로 설정하면 "가격 미정"으로 표시됩니다.
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">재고 수량 (단)</label>
                        <input type="number" class="form-input" id="modal-product-stock" placeholder="0" min="0">
                    </div>
                </template>
            </div>
        `;
        this.initProducts();
    },
    
    // 주문관리 렌더링
    renderOrders() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <div>
                        <h1 style="margin: 0;">누적 주문관리</h1>
                        <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-xs);">
                            최근 5년간 전체 주문 내역
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--spacing-md);">
                        <button class="btn btn-secondary" onclick="AdminApp.exportOrders()">
                            내보내기
                        </button>
                    </div>
                </div>
                
                <!-- 매출 통계 -->
                <div class="card" style="margin-bottom: var(--spacing-xl);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                        <h3 style="margin: 0;">매출 통계</h3>
                        <select class="form-input" id="revenue-period" style="width: auto;" onchange="AdminApp.updateRevenueStats()">
                            <option value="monthly">월별 매출</option>
                            <option value="yearly">연간 매출</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg);">
                        <div style="text-align: center; padding: var(--spacing-lg); background: var(--primary-green-50); border-radius: var(--radius-md);">
                            <div class="caption" style="color: var(--neutral-gray-700); margin-bottom: var(--spacing-sm);">
                                총 매출
                            </div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary-green-800);" id="total-revenue">
                                ₩0
                            </div>
                        </div>
                        <div style="text-align: center; padding: var(--spacing-lg); background: var(--primary-green-50); border-radius: var(--radius-md);">
                            <div class="caption" style="color: var(--neutral-gray-700); margin-bottom: var(--spacing-sm);">
                                완료된 주문
                            </div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--primary-green-800);" id="completed-orders">
                                0건
                            </div>
                        </div>
                        <div style="text-align: center; padding: var(--spacing-lg); background: var(--badge-unpaid-bg); border-radius: var(--radius-md);">
                            <div class="caption" style="color: var(--neutral-gray-700); margin-bottom: var(--spacing-sm);">
                                미결제 금액
                            </div>
                            <div style="font-size: 24px; font-weight: 700; color: var(--badge-unpaid-text);" id="unpaid-amount">
                                ₩0
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 필터 -->
                <div class="card" style="margin-bottom: var(--spacing-xl);">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--spacing-lg); align-items: end;">
                        <div>
                            <label class="form-label">상태</label>
                            <select class="form-input" id="order-status-filter">
                                <option value="">전체</option>
                                <option value="unpaid">미결제</option>
                                <option value="paid">결제완료</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">파트너사</label>
                            <input type="text" class="form-input" id="order-partner-filter" placeholder="파트너사명">
                        </div>
                        <div>
                            <label class="form-label">시작일</label>
                            <input type="date" class="form-input" id="order-start-date">
                        </div>
                        <div>
                            <label class="form-label">종료일</label>
                            <input type="date" class="form-input" id="order-end-date">
                        </div>
                        <div>
                            <button class="btn btn-primary" onclick="AdminApp.searchOrders()" style="width: 100%;">
                                검색
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- 주문 목록 -->
                <div class="card">
                    <div style="margin-bottom: var(--spacing-lg);">
                        <span id="order-count-info">전체 주문 0건</span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>선택</th>
                                    <th>주문번호</th>
                                    <th>파트너사</th>
                                    <th>주문일</th>
                                    <th>금액</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody id="orders-tbody">
                                <!-- JavaScript에서 동적 생성 -->
                            </tbody>
                        </table>
                    </div>
                    
                    <!-- 페이지네이션 -->
                    <div id="pagination-container" style="margin-top: var(--spacing-xl); text-align: center;">
                        <!-- JavaScript에서 동적 생성 -->
                    </div>
                </div>
            </div>
        `;
        this.currentOrderPage = 1;
        this.ordersPerPage = 10;
        this.filteredOrders = [];
        this.initOrders();
    },
    
    // 계산서관리 렌더링
    renderInvoices() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">계산서관리</h1>
                </div>
                
                <!-- 계산서 요청 목록 -->
                <div class="card">
                    <h2 style="margin: 0 0 var(--spacing-xl) 0;">계산서 요청 목록</h2>
                    <div style="overflow-x: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>요청일</th>
                                    <th>파트너사</th>
                                    <th>기간</th>
                                    <th>유형</th>
                                    <th>금액</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody id="invoice-requests-tbody">
                                <!-- JavaScript에서 동적 생성 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        this.initInvoices();
    },
    
    // 설정 렌더링
    renderSettings() {
        document.getElementById('admin-main-content').innerHTML = `
            <div class="admin-content">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-2xl);">
                    <h1 style="margin: 0;">설정</h1>
                </div>
                
                <!-- 관리자 설정 -->
                <div class="card">
                    <h2 style="margin: 0 0 var(--spacing-xl) 0;">관리자 설정</h2>
                    <div class="form-group">
                        <label class="form-label">현재 비밀번호</label>
                        <input type="password" class="form-input" id="current-password" placeholder="현재 비밀번호를 입력하세요">
                    </div>
                    <div class="form-group">
                        <label class="form-label">새 비밀번호</label>
                        <input type="password" class="form-input" id="new-password" placeholder="새 비밀번호를 입력하세요">
                    </div>
                    <div class="form-group">
                        <label class="form-label">새 비밀번호 확인</label>
                        <input type="password" class="form-input" id="confirm-password" placeholder="새 비밀번호를 다시 입력하세요">
                    </div>
                    <button class="btn btn-primary" onclick="AdminApp.changePassword()">
                        비밀번호 변경
                    </button>
                </div>
                
                <!-- 시스템 정보 -->
                <div class="card">
                    <h2 style="margin: 0 0 var(--spacing-xl) 0;">시스템 정보</h2>
                    <div style="display: grid; gap: var(--spacing-md);">
                        <div style="display: flex; justify-content: space-between;">
                            <span>시스템 이름</span>
                            <strong>수영원예 HUB</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>버전</span>
                            <strong>1.0.0</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span>데이터 저장</span>
                            <strong>로컬 스토리지</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.initSettings();
    },
    
    // 탭 전환 메서드들
    switchInventoryTab(category) {
        this.currentTab = category;
        
        // 탭 버튼 활성화 상태 업데이트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            }
        });
        
        this.renderInventoryList();
    },
    
    switchProductTab(category) {
        this.currentTab = category;
        
        // 탭 버튼 활성화 상태 업데이트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            }
        });
        
        this.renderProductsTable();
    },
    
    // 필터 및 검색 메서드들
    searchCustomers() {
        this.renderCustomersGrid();
    },
    
    
    // 내보내기 메서드들
    exportInventory() {
        alert('재고 내보내기 기능은 준비 중입니다.');
    },
    
    exportOrders() {
        alert('주문 내보내기 기능은 준비 중입니다.');
    },
    
    // 비밀번호 변경
    changePassword() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert('모든 필드를 입력해주세요.');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (newPassword.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        
        // 간단한 비밀번호 검증 (실제로는 서버에서 처리해야 함)
        if (currentPassword === 'admin' || currentPassword === '1234') {
            localStorage.setItem('adminPassword', newPassword);
            alert('비밀번호가 성공적으로 변경되었습니다.');
            
            // 폼 초기화
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        } else {
            alert('현재 비밀번호가 올바르지 않습니다.');
        }
    },
    
    // 재고 목록 렌더링
    renderInventoryList() {
        const products = DataManager.products[this.currentTab] || [];
        const inventoryList = document.getElementById('inventory-list');
        
        if (inventoryList) {
            inventoryList.innerHTML = `
                <div class="card">
                    <div style="overflow-x: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>제품명</th>
                                    <th>분류</th>
                                    <th>현재 재고</th>
                                    <th>단가</th>
                                    <th>재고 상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => `
                                    <tr>
                                        <td>${product.name}</td>
                                        <td><span class="badge badge-${product.category === 'lily' ? 'plenty' : 'low'}">${product.category === 'lily' ? '백합류' : '기타'}</span></td>
                                        <td>${product.stock}단</td>
                                        <td>₩${product.price.toLocaleString()}</td>
                                        <td>
                                            ${product.stock > 30 ? '<span class="badge badge-plenty">여유</span>' : 
                                              product.stock > 0 ? `<span class="badge badge-low">${product.stock}단</span>` : 
                                              '<span class="badge badge-out">품절</span>'}
                                        </td>
                                        <td>
                                            <button class="btn btn-ghost" onclick="AdminApp.showStockModal(${product.id})">재고 조정</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    },
    
    // 주문 검색
    searchOrders() {
        const statusFilter = document.getElementById('order-status-filter').value;
        const partnerFilter = document.getElementById('order-partner-filter').value.toLowerCase();
        const startDate = document.getElementById('order-start-date').value;
        const endDate = document.getElementById('order-end-date').value;
        
        // 최근 5년간 주문 필터링
        const fiveYearsAgo = new Date();
        fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
        const fiveYearsAgoStr = fiveYearsAgo.toISOString().split('T')[0];
        
        let filtered = DataManager.orders.filter(order => {
            // 최근 5년 필터
            if (order.date < fiveYearsAgoStr) return false;
            
            // 상태 필터
            if (statusFilter && order.status !== statusFilter) return false;
            
            // 파트너사 필터
            if (partnerFilter && !order.customerName.toLowerCase().includes(partnerFilter)) return false;
            
            // 날짜 필터
            if (startDate && order.date < startDate) return false;
            if (endDate && order.date > endDate) return false;
            
            return true;
        });
        
        // 최신순으로 정렬
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        this.filteredOrders = filtered;
        this.currentOrderPage = 1;
        this.renderOrdersTable();
        this.renderPagination();
    },
    
    // 주문 테이블 렌더링 (페이지네이션 적용)
    renderOrdersTable() {
        const orders = this.filteredOrders || DataManager.orders;
        const startIndex = (this.currentOrderPage - 1) * this.ordersPerPage;
        const endIndex = startIndex + this.ordersPerPage;
        const currentOrders = orders.slice(startIndex, endIndex);
        
        const tbody = document.getElementById('orders-tbody');
        const countInfo = document.getElementById('order-count-info');
        
        if (countInfo) {
            countInfo.textContent = `전체 주문 ${orders.length}건 (${this.currentOrderPage}/${Math.ceil(orders.length / this.ordersPerPage)} 페이지)`;
        }
        
        if (tbody) {
            if (currentOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--neutral-gray-700);">검색 조건에 맞는 주문이 없습니다.</td></tr>';
            } else {
                tbody.innerHTML = currentOrders.map(order => {
                    // 실시간 가격 계산
                    const { totalAmount, hasPricePending } = DataManager.calculateOrderRealTimeAmount(order);
                    const displayAmount = hasPricePending && totalAmount === 0 ? 
                        '가격미정 포함' : 
                        (hasPricePending ? 
                            `₩${totalAmount.toLocaleString()} + 가격미정` : 
                            `₩${totalAmount.toLocaleString()}`);
                    
                    return `
                        <tr>
                            <td><input type="checkbox" value="${order.id}"></td>
                            <td>${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${order.date}</td>
                            <td>${displayAmount}</td>
                            <td>
                                <span class="badge badge-${order.status === 'paid' ? 'paid' : 'unpaid'}">
                                    ${order.status === 'paid' ? '결제완료' : '미결제'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-ghost" onclick="AdminApp.toggleOrderStatus('${order.id}')">
                                    ${order.status === 'paid' ? '미결제 변경' : '결제완료 변경'}
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    },
    
    // 페이지네이션 렌더링
    renderPagination() {
        const orders = this.filteredOrders || DataManager.orders;
        const totalPages = Math.ceil(orders.length / this.ordersPerPage);
        const container = document.getElementById('pagination-container');
        
        if (!container || totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }
        
        let paginationHtml = '<div style="display: flex; gap: var(--spacing-sm); justify-content: center; align-items: center;">';
        
        // 이전 페이지 버튼
        if (this.currentOrderPage > 1) {
            paginationHtml += `<button class="btn btn-ghost" onclick="AdminApp.goToOrderPage(${this.currentOrderPage - 1})">이전</button>`;
        }
        
        // 페이지 번호 버튼들
        const startPage = Math.max(1, this.currentOrderPage - 2);
        const endPage = Math.min(totalPages, this.currentOrderPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.currentOrderPage;
            paginationHtml += `<button class="btn ${isActive ? 'btn-primary' : 'btn-ghost'}" onclick="AdminApp.goToOrderPage(${i})">${i}</button>`;
        }
        
        // 다음 페이지 버튼
        if (this.currentOrderPage < totalPages) {
            paginationHtml += `<button class="btn btn-ghost" onclick="AdminApp.goToOrderPage(${this.currentOrderPage + 1})">다음</button>`;
        }
        
        paginationHtml += '</div>';
        container.innerHTML = paginationHtml;
    },
    
    // 페이지 이동
    goToOrderPage(page) {
        const orders = this.filteredOrders || DataManager.orders;
        const totalPages = Math.ceil(orders.length / this.ordersPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentOrderPage = page;
            this.renderOrdersTable();
            this.renderPagination();
        }
    },
    
    // 계산서 요청 테이블 렌더링
    renderInvoiceRequestsTable() {
        console.log('=== 계산서 요청 테이블 렌더링 시작 ===');
        
        // 다중 방식으로 최신 데이터 로드
        DataManager.load();
        
        // 로컬 스토리지에서 직접 읽기
        const rawData = localStorage.getItem('suyoungHub');
        if (rawData) {
            try {
                const data = JSON.parse(rawData);
                if (data.invoiceRequests) {
                    DataManager.invoiceRequests = data.invoiceRequests;
                    console.log('로컬 스토리지에서 직접 로드한 계산서 요청:', data.invoiceRequests);
                }
            } catch (e) {
                console.error('로컬 스토리지 직접 읽기 실패:', e);
            }
        }
        
        const requests = DataManager.invoiceRequests || [];
        
        // 디버깅용 로그
        console.log('최종 계산서 요청 목록:', requests);
        console.log('요청 개수:', requests.length);
        
        const tbody = document.getElementById('invoice-requests-tbody');
        
        if (tbody) {
            if (requests.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--neutral-gray-700);">계산서 요청이 없습니다.</td></tr>';
            } else {
                tbody.innerHTML = requests.map(request => `
                    <tr>
                        <td>${request.requestDate}</td>
                        <td>${request.customerName}</td>
                        <td>${request.period}</td>
                        <td>${request.type}</td>
                        <td>₩${request.requestAmount.toLocaleString()}</td>
                        <td>
                            <span class="badge badge-${request.status === 'completed' ? 'paid' : 'pending'}">
                                ${request.status === 'completed' ? '발행완료' : '처리대기'}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-ghost" onclick="AdminApp.processInvoiceRequest('${request.id}')">
                                ${request.status === 'completed' ? '완료됨' : '처리하기'}
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    },
    
    // 주문 상태 토글
    toggleOrderStatus(orderId) {
        const order = DataManager.orders.find(o => o.id === orderId);
        if (order) {
            const newStatus = order.status === 'paid' ? 'unpaid' : 'paid';
            const statusText = newStatus === 'paid' ? '결제완료' : '미결제';
            
            if (confirm(`주문 상태를 "${statusText}"로 변경하시겠습니까?`)) {
                DataManager.updateOrderStatus(orderId, newStatus);
                
                // 현재 필터링 상태 유지하며 테이블 재렌더링
                if (this.currentPage === 'orders') {
                    this.updateRevenueStats(); // 매출 통계 업데이트
                    this.searchOrders(); // 현재 검색 조건 유지
                } else {
                    this.renderOrdersTable();
                }
                
                // 대시보드가 현재 페이지라면 통계 업데이트
                if (this.currentPage === 'dashboard') {
                    this.renderStatsCards();
                    this.renderTodayOrders();
                }
            }
        }
    },
    
    // 계산서 요청 처리
    processInvoiceRequest(requestId) {
        const request = DataManager.invoiceRequests.find(r => r.id == requestId);
        if (request && request.status === 'pending') {
            if (confirm(`${request.customerName}의 ${request.period} 계산서를 발행하시겠습니까?`)) {
                request.status = 'completed';
                request.processedDate = new Date().toISOString().split('T')[0];
                DataManager.save();
                this.renderInvoiceRequestsTable();
                alert('계산서가 발행되었습니다.');
            }
        }
    },
    
    // 재고 조정 모달
    showStockModal(productId) {
        const product = DataManager.findProduct(productId);
        if (!product) return;
        
        const content = `
            <div class="form-group">
                <label class="form-label">제품명</label>
                <input type="text" class="form-input" value="${product.name}" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">현재 재고</label>
                <input type="text" class="form-input" value="${product.stock}단" readonly>
            </div>
            <div class="form-group">
                <label class="form-label">조정 수량</label>
                <input type="number" class="form-input" id="stock-adjustment" placeholder="양수: 입고, 음수: 출고">
                <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-xs);">
                    예: +50 (50단 입고), -20 (20단 출고)
                </div>
            </div>
        `;
        
        Modal.show('재고 조정', content, [
            {
                text: '조정',
                class: 'btn-primary',
                onclick: `AdminApp.adjustStock(${productId})`
            }
        ]);
    },
    
    // 재고 조정 실행
    adjustStock(productId) {
        const adjustment = parseInt(document.getElementById('stock-adjustment').value) || 0;
        if (adjustment === 0) {
            alert('조정 수량을 입력해주세요.');
            return;
        }
        
        const product = DataManager.findProduct(productId);
        if (product) {
            const newStock = Math.max(0, product.stock + adjustment);
            DataManager.updateProduct(productId, { stock: newStock });
            Modal.hide();
            this.renderInventoryList();
            
            // 대시보드 업데이트
            if (this.currentPage === 'dashboard') {
                this.renderStatsCards();
            }
        }
    },
    
    // 대시보드 초기화
    initDashboard() {
        this.renderStatsCards();
        this.renderTodayOrders();
        this.updateRevenue();
    },
    
    renderStatsCards() {
        const stats = DataManager.getStats();
        const statsCards = document.getElementById('stats-cards');
        
        if (statsCards) {
            statsCards.innerHTML = `
                ${Card.statsCard('오늘 주문', `${stats.todayCount}건`)}
                ${Card.statsCard('미결제 금액', `₩${stats.unpaidAmount.toLocaleString()}`, '처리 대기 중')}
                ${Card.statsCard('월 매출', `₩${stats.monthlyRevenue.toLocaleString()}`, '결제완료 누적')}
                ${Card.statsCard('등록 파트너', `${stats.activePartners}개사`)}
            `;
        }
    },
    
    renderTodayOrders() {
        const todayOrders = DataManager.getTodayOrders();
        const tbody = document.getElementById('today-orders-tbody');
        
        if (tbody) {
            if (todayOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--neutral-gray-700);">오늘 주문이 없습니다.</td></tr>';
            } else {
                tbody.innerHTML = todayOrders.map(order => {
                    // 실시간 가격 계산
                    const { totalAmount, hasPricePending } = DataManager.calculateOrderRealTimeAmount(order);
                    const displayAmount = hasPricePending && totalAmount === 0 ? 
                        '가격미정 포함' : 
                        (hasPricePending ? 
                            `₩${totalAmount.toLocaleString()} + 가격미정` : 
                            `₩${totalAmount.toLocaleString()}`);
                    
                    return `
                        <tr>
                            <td><input type="checkbox" value="${order.id}" onchange="AdminApp.updateBulkButton()"></td>
                            <td>${order.customerName}</td>
                            <td>${order.date}</td>
                            <td>${displayAmount}</td>
                            <td><span class="badge badge-${order.status === 'paid' ? 'paid' : 'unpaid'}">${order.status === 'paid' ? '결제완료' : '미결제'}</span></td>
                            <td>
                                ${order.status === 'unpaid' ? 
                                    `<button class="btn btn-ghost" onclick="AdminApp.markAsPaid('${order.id}')">결제완료 처리</button>` : 
                                    '완료됨'
                                }
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        }
    },
    
    toggleUnpaidOnly() {
        const checkbox = document.getElementById('unpaid-only');
        // 필터 로직 구현
        this.renderTodayOrders();
    },
    
    updateBulkButton() {
        const checkboxes = document.querySelectorAll('#today-orders-tbody input[type="checkbox"]:checked');
        const bulkBtn = document.getElementById('bulk-paid-btn');
        
        if (bulkBtn) {
            bulkBtn.style.display = checkboxes.length > 0 ? 'inline-block' : 'none';
        }
    },
    
    markAsPaid(orderId) {
        DataManager.updateOrderStatus(orderId, 'paid');
        this.renderTodayOrders();
        this.renderStatsCards();
    },
    
    markSelectedAsPaid() {
        const checkboxes = document.querySelectorAll('#today-orders-tbody input[type="checkbox"]:checked');
        checkboxes.forEach(cb => {
            DataManager.updateOrderStatus(cb.value, 'paid');
        });
        
        this.renderTodayOrders();
        this.renderStatsCards();
        this.updateBulkButton();
    },
    
    toggleSelectAll(checkbox) {
        const allCheckboxes = document.querySelectorAll('#today-orders-tbody input[type="checkbox"]');
        allCheckboxes.forEach(cb => cb.checked = checkbox.checked);
        this.updateBulkButton();
    },
    
    updateRevenue() {
        const period = document.getElementById('revenue-period')?.value || 'all';
        const revenue = this.calculateRevenue(period);
        const revenueElement = document.getElementById('total-revenue');
        
        if (revenueElement) {
            revenueElement.textContent = `₩${revenue.toLocaleString()}`;
        }
    },
    
    calculateRevenue(period) {
        const paidOrders = DataManager.orders.filter(o => o.status === 'paid');
        // 기간별 필터링 로직 구현 필요
        return paidOrders.reduce((sum, order) => sum + order.amount, 0);
    },
    
    // 재고·단가 관리
    initInventory() {
        this.switchInventoryTab('lily');
        this.loadInventoryForDate();
    },
    
    switchInventoryTab(category) {
        this.currentTab = category;
        
        // 탭 스타일 업데이트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            }
        });
        
        this.renderInventoryTable();
    },
    
    renderInventoryTable() {
        const products = DataManager.products[this.currentTab] || [];
        const tbody = document.getElementById('inventory-tbody');
        
        if (tbody) {
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>
                        <input type="number" class="form-input" style="width: 120px;" 
                               value="${product.price}" min="0" 
                               data-product-id="${product.id}" data-field="price">
                    </td>
                    <td>
                        <input type="number" class="form-input" style="width: 120px;" 
                               value="${product.stock}" min="0" 
                               data-product-id="${product.id}" data-field="stock">
                    </td>
                    <td>${Card.getStockBadge(product.stock)}</td>
                    <td>
                        <button class="btn btn-ghost" onclick="AdminApp.saveProductInventory(${product.id})">저장</button>
                    </td>
                </tr>
            `).join('');
        }
    },
    
    saveProductInventory(productId) {
        const priceInput = document.querySelector(`input[data-product-id="${productId}"][data-field="price"]`);
        const stockInput = document.querySelector(`input[data-product-id="${productId}"][data-field="stock"]`);
        
        if (priceInput && stockInput) {
            DataManager.updateProduct(productId, {
                price: parseInt(priceInput.value) || 0,
                stock: parseInt(stockInput.value) || 0
            });
            
            this.renderInventoryTable();
            alert('저장되었습니다.');
        }
    },
    
    saveAllInventory() {
        const inputs = document.querySelectorAll('#inventory-tbody input');
        const updates = {};
        
        inputs.forEach(input => {
            const productId = input.dataset.productId;
            const field = input.dataset.field;
            
            if (!updates[productId]) {
                updates[productId] = {};
            }
            
            updates[productId][field] = parseInt(input.value) || 0;
        });
        
        Object.keys(updates).forEach(productId => {
            DataManager.updateProduct(parseInt(productId), updates[productId]);
        });
        
        this.renderInventoryTable();
        alert('전체 저장이 완료되었습니다.');
    },
    
    loadInventoryForDate() {
        const dateInput = document.getElementById('inventory-date');
        if (dateInput && !dateInput.value) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }
    },
    
    // 상품 관리
    initProducts() {
        this.renderProductsTable();
        this.updateProductFilters();
    },
    
    renderProductsTable() {
        const currentProducts = DataManager.products[this.currentTab] || [];
        const productsList = document.getElementById('products-list');
        
        if (productsList) {
            productsList.innerHTML = `
                <div class="card">
                    <div style="overflow-x: auto;">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>상품명</th>
                                    <th>분류</th>
                                    <th>단가</th>
                                    <th>재고</th>
                                    <th>상태</th>
                                    <th>관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${currentProducts.length === 0 ? `
                                    <tr>
                                        <td colspan="6" style="text-align: center; color: var(--neutral-gray-700);">
                                            ${this.currentTab === 'lily' ? '백합류' : '기타'} 상품이 없습니다.
                                        </td>
                                    </tr>
                                ` : currentProducts.map(product => `
                                    <tr>
                                        <td>${product.name}</td>
                                        <td><span class="badge badge-${product.category === 'lily' ? 'plenty' : 'low'}">${product.category === 'lily' ? '백합류' : '기타'}</span></td>
                                        <td>${product.price > 0 ? `₩${product.price.toLocaleString()}` : '<span class="badge badge-pending">가격 미정</span>'}</td>
                                        <td>${product.stock}단</td>
                                        <td>
                                            ${product.stock > 30 ? '<span class="badge badge-plenty">여유</span>' : 
                                              product.stock > 0 ? `<span class="badge badge-low">${product.stock}단</span>` : 
                                              '<span class="badge badge-out">품절</span>'}
                                        </td>
                                        <td>
                                            <button class="btn btn-ghost" onclick="AdminApp.editProduct(${product.id})">수정</button>
                                            <button class="btn btn-ghost" onclick="AdminApp.deleteProduct(${product.id})" style="color: var(--semantic-error);">삭제</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    },
    
    showAddProductModal() {
        const template = document.getElementById('product-modal-template');
        if (template) {
            Modal.show('상품 추가', template.innerHTML, [
                {
                    text: '추가',
                    class: 'btn-primary',
                    onclick: 'AdminApp.saveProduct()'
                }
            ]);
            
            // 현재 탭에 맞는 기본 분류 설정
            setTimeout(() => {
                const categorySelect = document.getElementById('modal-product-category');
                if (categorySelect) {
                    categorySelect.value = this.currentTab;
                }
            }, 100);
        }
    },
    
    saveProduct(productId = null) {
        const name = document.getElementById('modal-product-name').value.trim();
        const category = document.getElementById('modal-product-category').value;
        const price = parseInt(document.getElementById('modal-product-price').value) || 0;
        const stock = parseInt(document.getElementById('modal-product-stock').value) || 0;
        
        if (!name || !category) {
            alert('필수 항목을 입력해주세요.');
            return;
        }
        
        if (productId) {
            DataManager.updateProduct(productId, { name, category, price, stock });
        } else {
            DataManager.addProduct({ name, category, price, stock });
        }
        
        Modal.hide();
        this.renderProductsTable();
        
        // 가격 업데이트 시 모든 화면 새로고침
        this.forceDataSync();
        this.updateRevenueStats();
        
        // 현재 페이지에 따른 화면 갱신
        if (this.currentPage === 'dashboard') {
            this.initDashboard();
        } else if (this.currentPage === 'orders') {
            this.renderOrdersTable();
        }
    },
    
    editProduct(productId) {
        const product = DataManager.findProduct(productId);
        if (!product) return;
        
        const template = document.getElementById('product-modal-template');
        if (template) {
            Modal.show('상품 수정', template.innerHTML, [
                {
                    text: '수정',
                    class: 'btn-primary',
                    onclick: `AdminApp.saveProduct(${productId})`
                }
            ]);
            
            // 기존 값 설정
            setTimeout(() => {
                document.getElementById('modal-product-name').value = product.name;
                document.getElementById('modal-product-category').value = product.category;
                document.getElementById('modal-product-price').value = product.price;
                document.getElementById('modal-product-stock').value = product.stock;
            }, 100);
        }
    },
    
    deleteProduct(productId) {
        const product = DataManager.findProduct(productId);
        if (!product) return;
        
        if (confirm(`"${product.name}" 상품을 삭제하시겠습니까?`)) {
            DataManager.deleteProduct(productId);
            this.renderProductsTable();
        }
    },
    
    updateProductFilters() {
        // 필터 기능 구현
    },
    
    filterProducts() {
        // 필터링 로직
    },
    
    searchProducts() {
        // 검색 로직
    },
    
    // 파트너사 관리
    initCustomers() {
        this.renderCustomersGrid();
    },
    
    // 재고관리 초기화
    initInventory() {
        this.renderInventoryList();
    },
    
    // 상품관리 초기화
    initProducts() {
        this.currentTab = 'lily'; // 기본 탭 설정
        this.renderProductsTable();
    },
    
    // 주문관리 초기화
    initOrders() {
        // 월별 기본 설정 (이번 달)
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        document.getElementById('order-start-date').value = firstDayOfMonth.toISOString().split('T')[0];
        document.getElementById('order-end-date').value = lastDayOfMonth.toISOString().split('T')[0];
        
        // 매출 통계 업데이트 (월별 디폴트)
        this.updateRevenueStats();
        
        // 초기 검색 실행 (월별 주문 데이터)
        this.searchOrders();
    },
    
    // 매출 통계 업데이트
    updateRevenueStats() {
        const period = document.getElementById('revenue-period')?.value || 'monthly';
        const now = new Date();
        let startDate, endDate;
        
        if (period === 'monthly') {
            // 이번 달
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else {
            // 올해
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // 기간 내 주문 필터링
        const periodOrders = DataManager.orders.filter(order => {
            return order.date >= startDateStr && order.date <= endDateStr;
        });
        
        const paidOrders = periodOrders.filter(o => o.status === 'paid');
        const unpaidOrders = periodOrders.filter(o => o.status === 'unpaid');
        
        // 실시간 가격으로 매출 계산
        const totalRevenue = paidOrders.reduce((sum, order) => {
            const { totalAmount } = DataManager.calculateOrderRealTimeAmount(order);
            return sum + totalAmount;
        }, 0);
        
        const unpaidAmount = unpaidOrders.reduce((sum, order) => {
            const { totalAmount } = DataManager.calculateOrderRealTimeAmount(order);
            return sum + totalAmount;
        }, 0);
        
        // UI 업데이트
        const totalRevenueEl = document.getElementById('total-revenue');
        const completedOrdersEl = document.getElementById('completed-orders');
        const unpaidAmountEl = document.getElementById('unpaid-amount');
        
        if (totalRevenueEl) totalRevenueEl.textContent = `₩${totalRevenue.toLocaleString()}`;
        if (completedOrdersEl) completedOrdersEl.textContent = `${paidOrders.length}건`;
        if (unpaidAmountEl) unpaidAmountEl.textContent = `₩${unpaidAmount.toLocaleString()}`;
        
        console.log(`${period === 'monthly' ? '월별' : '연간'} 매출 통계:`, {
            기간: `${startDateStr} ~ ${endDateStr}`,
            총매출: totalRevenue,
            완료주문: paidOrders.length,
            미결제금액: unpaidAmount
        });
    },
    
    // 계산서관리 초기화
    initInvoices() {
        // 강제 데이터 동기화
        this.forceDataSync();
        this.renderInvoiceRequestsTable();
    },
    
    // 강제 데이터 동기화 (계산서 요청 전용)
    forceDataSync() {
        console.log('=== 강제 데이터 동기화 시작 ===');
        
        // 로컬 스토리지에서 직접 읽기
        const rawData = localStorage.getItem('suyoungHub');
        console.log('로컬 스토리지 원본 데이터:', rawData);
        
        if (rawData) {
            try {
                const parsedData = JSON.parse(rawData);
                console.log('파싱된 데이터:', parsedData);
                console.log('계산서 요청 데이터:', parsedData.invoiceRequests);
                
                // DataManager에 직접 할당
                if (parsedData.invoiceRequests) {
                    DataManager.invoiceRequests = parsedData.invoiceRequests;
                    console.log('DataManager 계산서 요청 업데이트 완료:', DataManager.invoiceRequests);
                }
            } catch (e) {
                console.error('데이터 파싱 오류:', e);
            }
        }
        
        console.log('=== 강제 데이터 동기화 완료 ===');
    },
    
    // 설정 초기화
    initSettings() {
        // 설정 페이지는 렌더링만으로 충분
    },
    
    renderCustomersGrid() {
        const grid = document.getElementById('customers-grid');
        if (!grid) return;
        
        grid.className = 'customers-grid';
        grid.innerHTML = DataManager.customers.map(partner => `
            <div class="customer-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-lg);">
                    <div>
                        <h3 style="margin: 0 0 var(--spacing-sm) 0;">${partner.name}</h3>
                        <span class="customer-code">${partner.code}</span>
                    </div>
                    <div style="display: flex; gap: var(--spacing-xs);">
                        <button class="btn btn-ghost" onclick="AdminApp.editCustomer('${partner.code}')" style="padding: var(--spacing-xs);">수정</button>
                        <button class="btn btn-ghost" onclick="AdminApp.deleteCustomer('${partner.code}')" style="padding: var(--spacing-xs); color: var(--semantic-error);">삭제</button>
                    </div>
                </div>
                <div class="form-group">
                    <div class="caption">사업자번호</div>
                    <div>${partner.business || '-'}</div>
                </div>
                <div class="form-group">
                    <div class="caption">이메일</div>
                    <div>${partner.email || '-'}</div>
                </div>
                <div class="form-group">
                    <div class="caption">연락처</div>
                    <div>${partner.phone || '-'}</div>
                </div>
                <div class="form-group">
                    <div class="caption">파트너 전용 URL</div>
                    <div style="font-family: monospace; background: var(--neutral-gray-100); padding: var(--spacing-xs); border-radius: var(--radius-sm);">
                        ${window.location.origin}${partner.url || `/${partner.code}`}
                    </div>
                </div>
            </div>
        `).join('');
    },
    
    showAddCustomerModal() {
        const template = document.getElementById('customer-modal-template');
        if (template) {
            Modal.show('파트너사 추가', template.innerHTML, [
                {
                    text: '추가',
                    class: 'btn-primary',
                    onclick: 'AdminApp.saveCustomer()'
                }
            ]);
        }
    },
    
    saveCustomer(partnerCode = null) {
        const name = document.getElementById('modal-customer-name').value.trim();
        const business = document.getElementById('modal-customer-business').value.trim();
        const email = document.getElementById('modal-customer-email').value.trim();
        const phone = document.getElementById('modal-customer-phone').value.trim();
        
        if (!name || !business || !email || !phone) {
            alert('모든 필수 항목을 입력해주세요.');
            return;
        }
        
        if (partnerCode) {
            DataManager.updatePartner(partnerCode, { name, business, email, phone });
        } else {
            DataManager.addPartner({ name, business, email, phone });
        }
        
        Modal.hide();
        this.renderCustomersGrid();
    },
    
    editCustomer(partnerCode) {
        const partner = DataManager.customers.find(c => c.code === partnerCode);
        if (!partner) return;
        
        const template = document.getElementById('customer-modal-template');
        if (template) {
            Modal.show('파트너사 수정', template.innerHTML, [
                {
                    text: '수정',
                    class: 'btn-primary',
                    onclick: `AdminApp.saveCustomer('${partnerCode}')`
                }
            ]);
            
            setTimeout(() => {
                document.getElementById('modal-customer-name').value = partner.name;
                document.getElementById('modal-customer-code').value = partner.code;
                document.getElementById('modal-customer-business').value = partner.business || '';
                document.getElementById('modal-customer-email').value = partner.email || '';
                document.getElementById('modal-customer-phone').value = partner.phone || '';
                document.getElementById('modal-customer-url').textContent = 
                    `${window.location.origin}${partner.url || `/${partner.code}`}`;
            }, 100);
        }
    },
    
    deleteCustomer(partnerCode) {
        const partner = DataManager.customers.find(c => c.code === partnerCode);
        if (!partner) return;
        
        Modal.confirm('파트너사 삭제', 
            `"${partner.name}" 파트너사를 삭제하시겠습니까?`,
            () => {
                DataManager.deletePartner(partnerCode);
                this.renderCustomersGrid();
            }
        );
    },
    
    searchCustomers() {
        // 검색 기능 구현
    },
    
    // 기본 초기화 메서드들
    initOrders() {
        console.log('주문 조회 페이지 초기화');
    },
    
    initInvoices() {
        console.log('계산서 현황 페이지 초기화');
    },
    
    initSettings() {
        console.log('설정 페이지 초기화');
    },
    
    // 로그아웃
    logout() {
        // 세션 매니저 정지
        if (typeof SessionManager !== 'undefined') {
            SessionManager.stop();
        }
        
        DataManager.currentUser = null;
        this.clearSessionState();
        
        // 파트너 로그인 화면으로 이동
        if (typeof App !== 'undefined' && App.renderLogin) {
            App.renderLogin();
        } else {
            window.location.reload();
        }
    }
};