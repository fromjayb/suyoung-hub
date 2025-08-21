// 메인 앱 객체 - 파트너용 화면 담당
const App = {
    currentTab: 'lily',
    currentPage: 'login',
    ordersCurrentPage: 1,
    ordersPerPage: 10,
    invoiceRequestsCurrentPage: 1,
    invoiceRequestsPerPage: 5,
    
    init() {
        DataManager.load();
        
        // 세션 상태 복원 시도
        const sessionState = this.loadSessionState();
        if (sessionState && sessionState.isLoggedIn && sessionState.userType === 'partner') {
            // 로그인 상태 복원
            DataManager.currentUser = sessionState.currentUser;
            
            // 세션 타임아웃 시작
            SessionManager.init();
            
            // 저장된 장바구니 복원
            const savedCart = localStorage.getItem('partnerCart');
            if (savedCart) {
                try {
                    DataManager.cart = JSON.parse(savedCart);
                } catch (e) {
                    DataManager.cart = {};
                }
            }
            
            // 현재 페이지 상태에 따라 화면 렌더링
            if (sessionState.currentPage === 'orders') {
                this.showOrders();
            } else if (sessionState.currentPage === 'invoice') {
                this.showInvoiceRequest();
            } else if (sessionState.currentPage === 'invoice-history') {
                this.showInvoiceRequestHistory();
            } else {
                this.renderCustomerCatalog();
            }
        } else {
            this.renderLogin();
        }
    },
    
    // 세션 상태 저장
    saveSessionState() {
        const sessionState = {
            isLoggedIn: !!DataManager.currentUser,
            userType: DataManager.currentUser?.type || null,
            currentUser: DataManager.currentUser,
            currentPage: this.currentPage,
            currentTab: this.currentTab
        };
        localStorage.setItem('appSessionState', JSON.stringify(sessionState));
    },
    
    // 세션 상태 로드
    loadSessionState() {
        try {
            const saved = localStorage.getItem('appSessionState');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    
    // 세션 상태 삭제
    clearSessionState() {
        localStorage.removeItem('appSessionState');
    },
    
    renderLogin() {
        this.currentPage = 'login';
        
        // 저장된 파트너코드 불러오기
        const savedCode = localStorage.getItem('savedCustomerCode') || '';
        const shouldSave = localStorage.getItem('saveCustomerCode') === 'true';
        
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="logo" style="text-align: center; margin-bottom: var(--spacing-3xl);">
                        <h1 style="color: var(--primary-green-800); margin: 0;">수영원예 HUB</h1>
                        <p style="color: var(--neutral-gray-700); margin: var(--spacing-md) 0 0;">파트너 전용 페이지</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">파트너코드 (6자리 숫자)</label>
                        <input type="text" 
                               class="form-input" 
                               id="customerCode" 
                               placeholder="예: 123456"
                               value="${savedCode}"
                               maxlength="6"
                               inputmode="numeric"
                               oninput="App.formatPartnerCode(this)">
                    </div>
                    
                    <div class="form-group" style="margin-bottom: var(--spacing-xl);">
                        <label class="toggle-container">
                            <input type="checkbox" id="saveCodeCheckbox" ${shouldSave ? 'checked' : ''}>
                            <span style="margin-left: var(--spacing-sm);">파트너코드 저장하기</span>
                        </label>
                        <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-xs);">
                            체크하시면 다음에 자동으로 입력됩니다.
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" 
                            style="width: 100%; margin-bottom: var(--spacing-xl);"
                            id="login-btn">
                        입장하기
                    </button>
                    
                    <div style="text-align: center;">
                        <a href="#" 
                           onclick="App.showAdminLogin()" 
                           style="color: var(--primary-green-600); text-decoration: none;">
                            관리자 로그인
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // 이벤트 리스너 추가
        setTimeout(() => {
            const loginBtn = document.getElementById('login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    console.log('버튼 클릭됨 (이벤트 리스너)');
                    this.partnerLogin();
                });
            }
        }, 100);
    },
    
    partnerLogin() {
        try {
            console.log('partnerLogin 메서드 시작');
            
            const code = document.getElementById('customerCode').value.trim();
            const saveCheckbox = document.getElementById('saveCodeCheckbox');
            
            console.log('입력된 코드:', code);
            
            // 6자리 숫자 체크
            if (!/^\d{6}$/.test(code)) {
                alert('파트너코드는 6자리 숫자로 입력해주세요.\n예: 123456');
                return;
            }
            
            // 123456 코드는 바로 허용
            if (code === '123456') {
                const partner = {
                    code: '123456',
                    name: '가나다 플라워',
                    business: '123-45-67890',
                    email: 'contact@ganada.co.kr',
                    phone: '010-1234-5678',
                    url: '/123456'
                };
                
                // 저장 옵션 처리
                if (saveCheckbox && saveCheckbox.checked) {
                    localStorage.setItem('savedCustomerCode', code);
                    localStorage.setItem('saveCustomerCode', 'true');
                } else {
                    localStorage.removeItem('savedCustomerCode');
                    localStorage.removeItem('saveCustomerCode');
                }
                
                DataManager.currentUser = {
                    type: 'partner',
                    data: partner
                };
                
                // 저장된 장바구니 데이터 복원
                const savedCart = localStorage.getItem('partnerCart');
                if (savedCart) {
                    try {
                        DataManager.cart = JSON.parse(savedCart);
                    } catch (e) {
                        console.error('장바구니 데이터 복원 실패:', e);
                        DataManager.cart = {};
                    }
                }
                
                console.log('로그인 성공, 파트너 페이지로 이동');
                this.saveSessionState(); // 세션 상태 저장
                SessionManager.init(); // 세션 타임아웃 시작
                this.renderCustomerCatalog();
                return;
            }
            
            // 다른 코드의 경우
            alert('현재는 123456 코드만 사용 가능합니다.');
            
        } catch (error) {
            console.error('partnerLogin 오류:', error);
            console.error('오류 스택:', error.stack);
            alert('로그인 중 오류가 발생했습니다.\n오류: ' + error.message + '\n\n개발자 도구(F12) Console 탭에서 자세한 내용을 확인해주세요.');
        }
    },
    
    showAdminLogin() {
        this.currentPage = 'admin-login';
        document.getElementById('app').innerHTML = `
            <div class="login-container">
                <div class="login-card">
                    <div class="logo" style="text-align: center; margin-bottom: var(--spacing-3xl);">
                        <h1 style="color: var(--primary-green-800); margin: 0;">수영원예 HUB</h1>
                        <p style="color: var(--neutral-gray-700); margin: var(--spacing-md) 0 0;">관리자 로그인</p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">이메일</label>
                        <input type="email" 
                               class="form-input" 
                               id="adminEmail" 
                               placeholder="예: admin@suyoung.co.kr">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">비밀번호</label>
                        <input type="password" 
                               class="form-input" 
                               id="adminPassword" 
                               placeholder="비밀번호를 입력하세요">
                    </div>
                    
                    <button class="btn btn-primary" 
                            style="width: 100%; margin-bottom: var(--spacing-xl);"
                            onclick="App.adminLogin()">
                        로그인
                    </button>
                    
                    <div style="text-align: center;">
                        <a href="#" 
                           onclick="App.showCustomerLogin()" 
                           style="color: var(--primary-green-600); text-decoration: none; margin-right: var(--spacing-lg);">
                            파트너 로그인
                        </a>
                        <a href="#" 
                           onclick="App.showPasswordReset()" 
                           style="color: var(--neutral-gray-700); text-decoration: none;">
                            비밀번호 변경
                        </a>
                    </div>
                </div>
            </div>
        `;
    },
    
    adminLogin() {
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        
        if ((email === 'admin@suyoung.co.kr' || email === 'admin') && 
            (password === 'admin' || password === '1234')) {
            DataManager.currentUser = {
                type: 'admin',
                data: { email: 'admin@suyoung.co.kr', name: '관리자' }
            };
            // 관리자 로그인 시 세션 매니저 초기화는 AdminApp.init()에서 처리
            AdminApp.init();
        } else {
            alert('이메일 또는 비밀번호가 올바르지 않습니다.');
        }
    },
    
    showCustomerLogin() {
        this.renderLogin();
    },
    
    renderCustomerCatalog() {
        this.currentPage = 'catalog';
        this.saveSessionState(); // 세션 상태 저장
        // 장바구니 백업 후 최신 데이터 로드
        const savedCart = {...DataManager.cart};
        DataManager.load();
        DataManager.cart = savedCart;
        
        document.getElementById('app').innerHTML = `
            <!-- 헤더 -->
            <div class="header">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="color: var(--primary-green-800); margin: 0; cursor: pointer;" onclick="App.renderCustomerCatalog()">수영원예 HUB</h2>
                            <div class="caption" style="color: var(--neutral-gray-700); margin-top: 4px;">
                                ${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                        <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                            <button class="btn btn-ghost" onclick="App.showOrders()">
                                주문내역
                            </button>
                            <button class="btn btn-ghost" onclick="App.logout()">
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="container">
                    <!-- 탭 메뉴 -->
                    <div class="tabs">
                        <button class="tab active" onclick="App.switchTab('lily')" data-tab="lily">
                            백합류
                        </button>
                        <button class="tab" onclick="App.switchTab('other')" data-tab="other">
                            기타
                        </button>
                    </div>
                    
                    <!-- 제품 리스트 -->
                    <div id="product-list">
                        <!-- JavaScript에서 동적 생성 -->
                    </div>
                </div>
            </div>
            
            <!-- 하단 고정 바 -->
            <div class="bottom-bar">
                <div class="bottom-bar-content">
                    <div style="font-size: 18px; font-weight: 600;">
                        총 견적금액: <span id="total-amount">₩0</span>
                    </div>
                    <button class="btn btn-primary" 
                            style="min-width: 120px;"
                            onclick="App.placeOrder()">
                        주문하기
                    </button>
                </div>
            </div>
            
            <!-- 플로팅 계산서 요청 버튼 -->
            <button class="floating-invoice-btn" onclick="App.showInvoiceRequest()" title="계산서 요청">
                📋
            </button>
        `;
        this.renderProducts();
        this.updateTotal();
    },
    
    showOrders() {
        this.currentPage = 'orders';
        this.ordersCurrentPage = 1; // 주문내역 페이지 방문 시 첫 페이지로 리셋
        this.saveSessionState(); // 세션 상태 저장
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="color: var(--primary-green-800); margin: 0; cursor: pointer;" onclick="App.renderCustomerCatalog()">수영원예 HUB</h2>
                        <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                            <button class="btn btn-ghost" onclick="App.renderCustomerCatalog()">
                                주문하기
                            </button>
                            <button class="btn btn-ghost" onclick="App.logout()">
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="container">
                    <h2 style="margin-bottom: var(--spacing-xl);">주문 내역</h2>
                    <div id="orders-list">
                        <!-- JavaScript에서 동적 생성 -->
                    </div>
                    <div id="orders-pagination" style="display: flex; justify-content: center; align-items: center; gap: var(--spacing-md); margin-top: var(--spacing-2xl);">
                        <!-- 페이징 버튼들이 여기에 생성됩니다 -->
                    </div>
                </div>
            </div>
        `;
        this.renderOrdersList();
    },
    
    showInvoiceRequest() {
        this.currentPage = 'invoice';
        this.saveSessionState(); // 세션 상태 저장
        this.selectedPeriod = 'monthly'; // 기본값 설정
        const isAnnualAvailable = this.isAnnualInvoiceAvailable();
        
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="color: var(--primary-green-800); margin: 0; cursor: pointer;" onclick="App.renderCustomerCatalog()">수영원예 HUB</h2>
                        <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                            <button class="btn btn-ghost" onclick="App.renderCustomerCatalog()">
                                주문하기
                            </button>
                            <button class="btn btn-ghost" onclick="App.logout()">
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="container">
                    <h2 style="margin-bottom: var(--spacing-2xl);">계산서 요청</h2>
                    
                    <!-- 기간 선택 탭 -->
                    <div class="tabs" style="margin-bottom: var(--spacing-2xl);">
                        <button class="tab active" onclick="App.setPeriod('monthly')" data-period="monthly">
                            월별
                        </button>
                        <button class="tab" onclick="App.setPeriod('quarterly')" data-period="quarterly">
                            분기별
                        </button>
                        <button class="tab" onclick="App.setPeriod('half')" data-period="half">
                            반기별
                        </button>
                        <button class="tab ${!isAnnualAvailable ? 'disabled' : ''}" 
                                onclick="App.setPeriod('yearly')" 
                                data-period="yearly" 
                                id="yearly-tab"
                                ${!isAnnualAvailable ? 'disabled' : ''}>
                            연간
                        </button>
                    </div>
                    
                    <!-- 선택된 기간 표시 -->
                    <div class="card" style="margin-bottom: var(--spacing-2xl);">
                        <h3 style="margin: 0 0 var(--spacing-md) 0;">선택한 기간</h3>
                        <div id="selected-period" style="font-size: 16px; font-weight: 600; color: var(--primary-green-800);">
                            ${this.getPeriodText('monthly')}
                        </div>
                        <div class="caption" style="color: var(--neutral-gray-700); margin-top: var(--spacing-sm);" id="period-description">
                            결제완료된 주문만 계산서에 포함됩니다.
                        </div>
                    </div>
                    
                    ${!isAnnualAvailable ? `
                        <div class="card" style="background: var(--badge-unpaid-bg); border: 1px solid var(--badge-unpaid-text); margin-bottom: var(--spacing-2xl);">
                            <div style="color: var(--badge-unpaid-text); font-weight: 600;">📋 연간 계산서 신청 안내</div>
                            <div style="color: var(--neutral-gray-700); margin-top: var(--spacing-sm);">
                                연간 계산서는 매년 <strong>12월 15일부터 12월 31일까지</strong>만 신청이 가능합니다.
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- 파트너사 정보 -->
                    <div class="card" style="margin-bottom: var(--spacing-2xl);">
                        <h3 style="margin: 0 0 var(--spacing-lg) 0;">파트너사 정보</h3>
                        <div style="display: grid; gap: var(--spacing-md);">
                            <div style="display: flex; justify-content: space-between;">
                                <span class="form-label">상호</span>
                                <span style="font-weight: 600;">${DataManager.currentUser?.data?.name || ''}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span class="form-label">사업자번호</span>
                                <span style="font-weight: 600;">${DataManager.currentUser?.data?.business || ''}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span class="form-label">이메일</span>
                                <span style="font-weight: 600;">${DataManager.currentUser?.data?.email || ''}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span class="form-label">연락처</span>
                                <span style="font-weight: 600;">${DataManager.currentUser?.data?.phone || ''}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 기존 계산서 요청 목록 -->
                    <div class="card" style="margin-bottom: var(--spacing-2xl);" id="existing-requests">
                        <!-- JavaScript에서 동적 생성 -->
                    </div>
                    
                    <!-- 요청 버튼 -->
                    <button class="btn btn-primary" style="width: 100%;" onclick="App.requestInvoice()">
                        요청 보내기
                    </button>
                </div>
            </div>
        `;
        
        // 기존 계산서 요청 목록 표시
        this.renderExistingInvoiceRequests();
    },
    
    // 기존 계산서 요청 목록 렌더링
    renderExistingInvoiceRequests() {
        const customer = DataManager.currentUser?.data;
        if (!customer) return;
        
        DataManager.load(); // 최신 데이터 로드
        const existingRequests = (DataManager.invoiceRequests || [])
            .filter(request => request.customer === customer.code)
            .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)); // 최신순
        
        const container = document.getElementById('existing-requests');
        if (!container) return;
        
        if (existingRequests.length === 0) {
            container.innerHTML = `
                <h3 style="margin: 0 0 var(--spacing-md) 0;">계산서 요청 내역</h3>
                <div style="text-align: center; color: var(--neutral-gray-700); padding: var(--spacing-xl);">
                    아직 요청한 계산서가 없습니다.
                </div>
            `;
            return;
        }
        
        // 최근 5개만 표시
        const recentRequests = existingRequests.slice(0, 5);
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-lg);">
                <h3 style="margin: 0;">계산서 요청 내역</h3>
                <button class="btn btn-ghost" onclick="App.showInvoiceRequestHistory()" style="font-size: 12px; padding: var(--spacing-xs) var(--spacing-sm);">
                    전체보기 (${existingRequests.length})
                </button>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-md);">
                ${recentRequests.map(request => `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: var(--spacing-sm) var(--spacing-md); background: var(--neutral-gray-50); border-radius: var(--radius-md); gap: var(--spacing-md);">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; margin-bottom: var(--spacing-xs); line-height: 1.3;">${request.period}</div>
                            <div class="caption" style="color: var(--neutral-gray-700); line-height: 1.4; word-wrap: break-word; overflow-wrap: break-word;">
                                요청일: ${request.requestDate}<br>
                                금액: ₩${request.requestAmount.toLocaleString()} | ${request.paidCount}건
                            </div>
                        </div>
                        <div style="flex-shrink: 0;">
                            <span class="badge badge-${request.status === 'completed' ? 'paid' : 'pending'}" style="white-space: nowrap;">
                                ${request.status === 'completed' ? '발행완료' : '처리대기'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },
    
    // 계산서 요청 내역 전체보기 페이지
    showInvoiceRequestHistory() {
        this.currentPage = 'invoice-history';
        this.invoiceRequestsCurrentPage = 1; // 페이지 방문 시 첫 페이지로 리셋
        this.saveSessionState(); // 세션 상태 저장
        
        document.getElementById('app').innerHTML = `
            <div class="header">
                <div class="container">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h2 style="color: var(--primary-green-800); margin: 0; cursor: pointer;" onclick="App.renderCustomerCatalog()">수영원예 HUB</h2>
                        <div style="display: flex; gap: var(--spacing-md); align-items: center;">
                            <button class="btn btn-ghost" onclick="App.showInvoiceRequest()">
                                계산서 요청
                            </button>
                            <button class="btn btn-ghost" onclick="App.logout()">
                                나가기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="main-content">
                <div class="container">
                    <h2 style="margin-bottom: var(--spacing-xl);">계산서 요청 내역</h2>
                    <div id="invoice-requests-list">
                        <!-- JavaScript에서 동적 생성 -->
                    </div>
                    <div id="invoice-requests-pagination" style="display: flex; justify-content: center; align-items: center; gap: var(--spacing-md); margin-top: var(--spacing-2xl);">
                        <!-- 페이징 버튼들이 여기에 생성됩니다 -->
                    </div>
                </div>
            </div>
        `;
        this.renderInvoiceRequestsList();
    },
    
    // 계산서 요청 내역 목록 렌더링 (페이징 포함)
    renderInvoiceRequestsList() {
        const customer = DataManager.currentUser?.data;
        if (!customer) return;
        
        DataManager.load(); // 최신 데이터 로드
        
        // 날짜순으로 정렬 (최신순)
        const customerRequests = (DataManager.invoiceRequests || [])
            .filter(request => request.customer === customer.code)
            .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        
        const requestsList = document.getElementById('invoice-requests-list');
        const pagination = document.getElementById('invoice-requests-pagination');
        
        if (customerRequests.length === 0) {
            requestsList.innerHTML = '<div class="card"><p>계산서 요청 내역이 없습니다.</p></div>';
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        // 페이징 계산
        const totalRequests = customerRequests.length;
        const totalPages = Math.ceil(totalRequests / this.invoiceRequestsPerPage);
        const startIndex = (this.invoiceRequestsCurrentPage - 1) * this.invoiceRequestsPerPage;
        const endIndex = startIndex + this.invoiceRequestsPerPage;
        const currentPageRequests = customerRequests.slice(startIndex, endIndex);
        
        // 요청 목록 렌더링
        requestsList.innerHTML = currentPageRequests.map(request => `
            <div class="card" style="margin-bottom: var(--spacing-lg); padding: var(--spacing-md);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-md); gap: var(--spacing-md);">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 600; margin-bottom: var(--spacing-xs); line-height: 1.3;">${request.period}</div>
                        <div class="caption" style="color: var(--neutral-gray-700); line-height: 1.4;">
                            요청일: ${request.requestDate}
                            ${request.processedDate ? `<br>처리일: ${request.processedDate}` : ''}
                        </div>
                    </div>
                    <div style="text-align: right; flex-shrink: 0;">
                        <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">₩${request.requestAmount.toLocaleString()}</div>
                        <span class="badge badge-${request.status === 'completed' ? 'paid' : 'pending'}" style="white-space: nowrap;">
                            ${request.status === 'completed' ? '발행완료' : '처리대기'}
                        </span>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--neutral-gray-300); padding-top: var(--spacing-md);">
                    <div class="caption" style="color: var(--neutral-gray-700); word-wrap: break-word;">
                        결제완료 주문 ${request.paidCount}건 | ${request.type === 'monthly' ? '월별' : request.type === 'quarterly' ? '분기별' : request.type === 'half' ? '반기별' : '연간'} 계산서
                    </div>
                </div>
            </div>
        `).join('');
        
        // 페이징 버튼 렌더링
        this.renderInvoiceRequestsPagination(totalPages, totalRequests);
    },
    
    // 계산서 요청 내역 페이징 버튼 렌더링
    renderInvoiceRequestsPagination(totalPages, totalRequests) {
        const pagination = document.getElementById('invoice-requests-pagination');
        if (!pagination) return;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 총 개수 표시
        const startNum = (this.invoiceRequestsCurrentPage - 1) * this.invoiceRequestsPerPage + 1;
        const endNum = Math.min(this.invoiceRequestsCurrentPage * this.invoiceRequestsPerPage, totalRequests);
        
        paginationHTML += `
            <div class="caption" style="color: var(--neutral-gray-700);">
                총 ${totalRequests}개 중 ${startNum}-${endNum}개 표시
            </div>
        `;
        
        // 이전 버튼
        if (this.invoiceRequestsCurrentPage > 1) {
            paginationHTML += `
                <button class="btn btn-ghost" onclick="App.goToInvoiceRequestsPage(${this.invoiceRequestsCurrentPage - 1})" style="padding: var(--spacing-xs) var(--spacing-sm);">
                    ‹ 이전
                </button>
            `;
        }
        
        // 페이지 번호들
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.invoiceRequestsCurrentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // 끝부분에서 시작 페이지 조정
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.invoiceRequestsCurrentPage;
            paginationHTML += `
                <button class="btn ${isActive ? 'btn-primary' : 'btn-ghost'}" 
                        onclick="App.goToInvoiceRequestsPage(${i})" 
                        style="padding: var(--spacing-xs) var(--spacing-sm); min-width: 40px;">
                    ${i}
                </button>
            `;
        }
        
        // 다음 버튼
        if (this.invoiceRequestsCurrentPage < totalPages) {
            paginationHTML += `
                <button class="btn btn-ghost" onclick="App.goToInvoiceRequestsPage(${this.invoiceRequestsCurrentPage + 1})" style="padding: var(--spacing-xs) var(--spacing-sm);">
                    다음 ›
                </button>
            `;
        }
        
        pagination.innerHTML = paginationHTML;
    },
    
    // 계산서 요청 내역 페이지 이동
    goToInvoiceRequestsPage(page) {
        this.invoiceRequestsCurrentPage = page;
        this.renderInvoiceRequestsList();
    },
    
    // 탭 전환
    switchTab(category) {
        this.currentTab = category;
        
        // 장바구니 백업 후 최신 데이터 로드
        const savedCart = {...DataManager.cart};
        DataManager.load();
        DataManager.cart = savedCart;
        
        // 탭 버튼 활성화 상태 업데이트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === category) {
                tab.classList.add('active');
            }
        });
        
        this.renderProducts();
    },
    
    // 제품 렌더링
    renderProducts() {
        const products = DataManager.products[this.currentTab] || [];
        const productList = document.getElementById('product-list');
        
        if (productList) {
            productList.innerHTML = products.map(product => 
                Card.productCard(product)
            ).join('');
        }
    },
    
    // 주문 내역 렌더링 (페이징 포함)
    renderOrdersList() {
        const customer = DataManager.currentUser?.data;
        if (!customer) return;
        
        // 날짜순으로 정렬 (최신순)
        const customerOrders = DataManager.orders
            .filter(o => o.customer === customer.code)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const ordersList = document.getElementById('orders-list');
        const pagination = document.getElementById('orders-pagination');
        
        if (customerOrders.length === 0) {
            ordersList.innerHTML = '<div class="card"><p>주문 내역이 없습니다.</p></div>';
            if (pagination) pagination.innerHTML = '';
            return;
        }
        
        // 페이징 계산
        const totalOrders = customerOrders.length;
        const totalPages = Math.ceil(totalOrders / this.ordersPerPage);
        const startIndex = (this.ordersCurrentPage - 1) * this.ordersPerPage;
        const endIndex = startIndex + this.ordersPerPage;
        const currentPageOrders = customerOrders.slice(startIndex, endIndex);
        
        // 주문 목록 렌더링
        ordersList.innerHTML = currentPageOrders.map(order => 
            Card.orderCard(order)
        ).join('');
        
        // 페이징 버튼 렌더링
        this.renderOrdersPagination(totalPages, totalOrders);
    },
    
    // 주문내역 페이징 버튼 렌더링
    renderOrdersPagination(totalPages, totalOrders) {
        const pagination = document.getElementById('orders-pagination');
        if (!pagination) return;
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 총 개수 표시
        const startNum = (this.ordersCurrentPage - 1) * this.ordersPerPage + 1;
        const endNum = Math.min(this.ordersCurrentPage * this.ordersPerPage, totalOrders);
        
        paginationHTML += `
            <div class="caption" style="color: var(--neutral-gray-700);">
                총 ${totalOrders}개 중 ${startNum}-${endNum}개 표시
            </div>
        `;
        
        // 이전 버튼
        if (this.ordersCurrentPage > 1) {
            paginationHTML += `
                <button class="btn btn-ghost" onclick="App.goToOrdersPage(${this.ordersCurrentPage - 1})" style="padding: var(--spacing-xs) var(--spacing-sm);">
                    ‹ 이전
                </button>
            `;
        }
        
        // 페이지 번호들
        const maxVisiblePages = 5;
        let startPage = Math.max(1, this.ordersCurrentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // 끝부분에서 시작 페이지 조정
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const isActive = i === this.ordersCurrentPage;
            paginationHTML += `
                <button class="btn ${isActive ? 'btn-primary' : 'btn-ghost'}" 
                        onclick="App.goToOrdersPage(${i})" 
                        style="padding: var(--spacing-xs) var(--spacing-sm); min-width: 40px;">
                    ${i}
                </button>
            `;
        }
        
        // 다음 버튼
        if (this.ordersCurrentPage < totalPages) {
            paginationHTML += `
                <button class="btn btn-ghost" onclick="App.goToOrdersPage(${this.ordersCurrentPage + 1})" style="padding: var(--spacing-xs) var(--spacing-sm);">
                    다음 ›
                </button>
            `;
        }
        
        pagination.innerHTML = paginationHTML;
    },
    
    // 주문내역 페이지 이동
    goToOrdersPage(page) {
        this.ordersCurrentPage = page;
        this.renderOrdersList();
    },
    
    // 수량 업데이트
    updateQty(productId, change) {
        // 최신 상품 데이터만 로드 (가격/재고 변경사항 반영)
        const savedCart = {...DataManager.cart}; // 장바구니 백업
        DataManager.load();
        DataManager.cart = savedCart; // 장바구니 복원
        
        const product = DataManager.findProduct(productId);
        if (!product) {
            console.error(`상품을 찾을 수 없습니다: ${productId}`);
            return;
        }
        
        if (product.stock <= 0) {
            alert(`${product.name}은(는) 품절되었습니다.`);
            return;
        }
        
        const currentQty = DataManager.cart[productId] || 0;
        let newQty;
        
        if (typeof change === 'number') {
            newQty = Math.max(0, currentQty + change);
        } else {
            newQty = Math.max(0, parseInt(change) || 0);
        }
        
        // 재고 체크
        if (newQty > product.stock) {
            alert(`재고가 부족합니다. (최대 ${product.stock}단)`);
            return;
        }
        
        // 카트 업데이트
        if (newQty === 0) {
            delete DataManager.cart[productId];
        } else {
            DataManager.cart[productId] = newQty;
        }
        
        // 장바구니 상태를 로컬 스토리지에 저장
        localStorage.setItem('partnerCart', JSON.stringify(DataManager.cart));
        
        // UI 업데이트
        this.renderProducts();
        this.updateTotal();
    },
    
    // 총액 업데이트
    updateTotal() {
        // 장바구니 백업 후 최신 가격 데이터 로드
        const savedCart = {...DataManager.cart};
        DataManager.load();
        DataManager.cart = savedCart;
        
        let total = 0;
        
        for (const [productId, qty] of Object.entries(DataManager.cart)) {
            const product = DataManager.findProduct(parseInt(productId));
            if (product && product.price > 0) {
                total += product.price * qty;
            }
        }
        
        const totalElement = document.getElementById('total-amount');
        if (totalElement) {
            totalElement.textContent = '₩' + total.toLocaleString();
        }
    },
    
    // 주문하기
    placeOrder() {
        // 장바구니 백업 후 최신 가격 데이터 로드
        const savedCart = {...DataManager.cart};
        DataManager.load();
        DataManager.cart = savedCart;
        
        if (Object.keys(DataManager.cart).length === 0) {
            alert('상품을 선택해주세요!');
            return;
        }
        
        const customer = DataManager.currentUser?.data;
        if (!customer) {
            alert('로그인이 필요합니다.');
            return;
        }
        
        // 주문 아이템 준비
        const items = [];
        let totalAmount = 0;
        let hasPricePending = false; // 가격미정 상품 포함 여부
        
        for (const [productId, qty] of Object.entries(DataManager.cart)) {
            const product = DataManager.findProduct(parseInt(productId));
            if (product) {
                const subtotal = product.price > 0 ? product.price * qty : 0;
                if (product.price === 0) {
                    hasPricePending = true;
                }
                
                items.push({
                    name: product.name,
                    qty: qty,
                    price: product.price,
                    subtotal: subtotal
                });
                totalAmount += subtotal;
            }
        }
        
        // 재고 감소 처리 (결제 여부와 상관없이)
        for (const [productId, qty] of Object.entries(DataManager.cart)) {
            const product = DataManager.findProduct(parseInt(productId));
            if (product) {
                const newStock = Math.max(0, product.stock - qty);
                DataManager.updateProduct(parseInt(productId), { stock: newStock });
            }
        }
        
        // 주문 생성
        const order = DataManager.addOrder({
            customer: customer.code,
            customerName: customer.name,
            amount: totalAmount,
            items: items
        });
        
        // 디버깅용 로그
        console.log('주문 생성됨:', order);
        console.log('주문 항목:', items);
        console.log('가격미정 상품 포함 여부:', hasPricePending);
        
        // 주문 완료 메시지 생성
        let orderMessage = `주문이 성공적으로 접수되었습니다.\n\n주문번호: ${order.id}\n총 금액: ₩${totalAmount.toLocaleString()}`;
        
        if (hasPricePending) {
            orderMessage += `\n\n⚠️ 가격미정 상품이 포함되어 있습니다.\n최종 금액은 관리자 확인 후 결정됩니다.`;
        }
        
        alert(orderMessage);
        
        // 카트 초기화
        DataManager.cart = {};
        localStorage.removeItem('partnerCart'); // 로컬 스토리지에서도 제거
        this.renderProducts();
        this.updateTotal();
    },
    
    // 로그아웃
    logout() {
        // 세션 매니저 정지
        if (typeof SessionManager !== 'undefined') {
            SessionManager.stop();
        }
        
        DataManager.currentUser = null;
        DataManager.cart = {};
        this.clearSessionState(); // 파트너 세션 상태 삭제
        
        // 관리자 세션 상태도 삭제
        if (typeof AdminApp !== 'undefined' && AdminApp.clearSessionState) {
            AdminApp.clearSessionState();
        }
        
        // 장바구니 데이터는 유지 (재로그인 시 복원용)
        // localStorage.removeItem('partnerCart'); 
        this.renderLogin();
    },
    
    // 기간 설정
    setPeriod(period) {
        // 연간 계산서가 비활성 상태일 때 클릭 방지
        if (period === 'yearly' && !this.isAnnualInvoiceAvailable()) {
            alert('연간 계산서는 12월 15일부터 12월 31일까지만 신청이 가능합니다.');
            return;
        }
        
        this.selectedPeriod = period;
        
        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.period === period) {
                tab.classList.add('active');
            }
        });
        
        // 선택된 기간 텍스트 업데이트
        const selectedPeriodElement = document.getElementById('selected-period');
        if (selectedPeriodElement) {
            selectedPeriodElement.textContent = this.getPeriodText(period);
        }
        
        // 설명 텍스트 업데이트
        const descriptionElement = document.getElementById('period-description');
        if (descriptionElement) {
            if (period === 'yearly') {
                descriptionElement.textContent = '연간 계산서는 매년 12월 15일부터 12월 31일까지만 신청이 가능합니다.';
            } else {
                descriptionElement.textContent = '결제완료된 주문만 계산서에 포함됩니다.';
            }
        }
    },
    
    // 기간 텍스트 생성
    getPeriodText(period) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-11을 1-12로 변환
        
        switch(period) {
            case 'monthly':
                // 전월 기준
                const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const monthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                return `${monthYear}년 ${prevMonth}월`;
            case 'quarterly':
                // 전분기 기준
                const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
                const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
                const quarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
                return `${quarterYear}년 ${prevQuarter}분기`;
            case 'half':
                // 전반기 기준
                const currentHalf = currentMonth <= 6 ? 1 : 2;
                const prevHalf = currentHalf === 1 ? 2 : 1;
                const halfYear = currentHalf === 1 ? currentYear - 1 : currentYear;
                const halfText = prevHalf === 1 ? '상반기' : '하반기';
                return `${halfYear}년 ${halfText}`;
            case 'yearly':
                // 연간은 올해 기준 (12월 15-31일만 신청 가능)
                return `${currentYear}년`;
            default:
                return '';
        }
    },
    
    // 연간 계산서 신청 가능 여부 체크
    isAnnualInvoiceAvailable() {
        const now = new Date();
        const month = now.getMonth() + 1; // 0-11을 1-12로 변환
        const date = now.getDate();
        
        // 12월 15일 ~ 12월 31일
        return month === 12 && date >= 15;
    },
    
    // 기간별 날짜 범위 계산
    getPeriodDateRange(period) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 0-11을 1-12로 변환
        
        switch(period) {
            case 'monthly': {
                // 전월 기준
                const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const monthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                const startDate = `${monthYear}-${prevMonth.toString().padStart(2, '0')}-01`;
                const endDate = `${monthYear}-${prevMonth.toString().padStart(2, '0')}-31`;
                return { startDate, endDate };
            }
            case 'quarterly': {
                // 전분기 기준
                const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;
                const prevQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
                const quarterYear = currentQuarter === 1 ? currentYear - 1 : currentYear;
                
                let startMonth, endMonth;
                switch(prevQuarter) {
                    case 1: startMonth = 1; endMonth = 3; break;
                    case 2: startMonth = 4; endMonth = 6; break;
                    case 3: startMonth = 7; endMonth = 9; break;
                    case 4: startMonth = 10; endMonth = 12; break;
                }
                
                const startDate = `${quarterYear}-${startMonth.toString().padStart(2, '0')}-01`;
                const endDate = `${quarterYear}-${endMonth.toString().padStart(2, '0')}-31`;
                return { startDate, endDate };
            }
            case 'half': {
                // 전반기 기준
                const currentHalf = currentMonth <= 6 ? 1 : 2;
                const prevHalf = currentHalf === 1 ? 2 : 1;
                const halfYear = currentHalf === 1 ? currentYear - 1 : currentYear;
                
                const startDate = prevHalf === 1 ? `${halfYear}-01-01` : `${halfYear}-07-01`;
                const endDate = prevHalf === 1 ? `${halfYear}-06-30` : `${halfYear}-12-31`;
                return { startDate, endDate };
            }
            case 'yearly': {
                // 올해 기준 (12월 15-31일만 신청 가능)
                const startDate = `${currentYear}-01-01`;
                const endDate = `${currentYear}-12-31`;
                return { startDate, endDate };
            }
            default:
                return { startDate: null, endDate: null };
        }
    },
    
    // 계산서 요청
    requestInvoice() {
        const customer = DataManager.currentUser?.data;
        if (!customer) return;
        
        // 선택한 기간의 날짜 범위 계산
        const dateRange = this.getPeriodDateRange(this.selectedPeriod);
        const { startDate, endDate } = dateRange;
        
        console.log(`계산서 요청 기간: ${startDate} ~ ${endDate}`);
        
        // 해당 기간의 결제완료된 주문 찾기
        const customerOrders = DataManager.orders.filter(o => o.customer === customer.code);
        const periodOrders = customerOrders.filter(order => {
            const orderDate = order.date;
            return orderDate >= startDate && orderDate <= endDate && order.status === 'paid';
        });
        
        const paidTotal = periodOrders.reduce((sum, order) => sum + order.amount, 0);
        
        console.log('해당 기간 결제완료 주문:', periodOrders);
        console.log('총 금액:', paidTotal);
        
        if (periodOrders.length === 0) {
            const periodText = this.getPeriodText(this.selectedPeriod);
            alert(`${periodText} 기간에 결제완료된 주문이 없습니다.\n계산서는 결제완료된 주문에 대해서만 발행됩니다.`);
            return;
        }
        
        const periodText = this.getPeriodText(this.selectedPeriod);
        
        // 중복 계산서 요청 체크
        const duplicateRequest = this.checkDuplicateInvoiceRequest(customer.code, periodText, this.selectedPeriod);
        if (duplicateRequest) {
            const statusText = duplicateRequest.status === 'completed' ? '이미 발행완료된' : '처리 대기중인';
            alert(`${statusText} 계산서 요청이 있습니다.\n\n요청 기간: ${duplicateRequest.period}\n요청일: ${duplicateRequest.requestDate}\n상태: ${duplicateRequest.status === 'completed' ? '발행완료' : '처리대기'}\n\n중복 요청은 불가능합니다.`);
            return;
        }
        
        if (confirm(`${periodText} 계산서를 요청하시겠습니까?\n\n결제완료 주문: ${periodOrders.length}건\n총 금액: ₩${paidTotal.toLocaleString()}`)) {
            // 계산서 요청 데이터 추가
            const request = DataManager.addInvoiceRequest({
                customer: customer.code,
                customerName: customer.name,
                period: periodText,
                type: this.selectedPeriod,
                requestAmount: paidTotal,
                paidCount: periodOrders.length
            });
            
            // 디버깅용 로그
            console.log('계산서 요청 생성됨:', request);
            console.log('현재 전체 계산서 요청 목록:', DataManager.invoiceRequests);
            
            // 강화된 저장 검증 및 관리자 페이지 동기화
            setTimeout(() => {
                const saved = localStorage.getItem('suyoungHub');
                if (saved) {
                    const data = JSON.parse(saved);
                    console.log('로컬 스토리지 저장 확인 - 계산서 요청:', data.invoiceRequests);
                    
                    // 관리자 페이지가 열려있다면 강제 새로고침
                    if (typeof AdminApp !== 'undefined' && AdminApp.currentPage === 'invoices') {
                        AdminApp.forceDataSync();
                        AdminApp.renderInvoiceRequestsTable();
                    }
                }
            }, 100);
            
            // 여러번 저장 시도 (안정성 확보)
            setTimeout(() => {
                DataManager.save();
                console.log('계산서 요청 재저장 완료');
            }, 200);
            
            alert('계산서 요청이 완료되었습니다.\n관리자 확인 후 발행됩니다.');
            this.renderCustomerCatalog();
        }
    },
    
    // 중복 계산서 요청 체크
    checkDuplicateInvoiceRequest(customerCode, period, type) {
        // 최신 데이터 로드
        DataManager.load();
        
        const existingRequests = DataManager.invoiceRequests || [];
        
        // 해당 파트너의 동일 기간/유형 계산서 요청 찾기
        // pending(처리대기) 또는 completed(발행완료) 상태 모두 중복으로 간주
        const duplicate = existingRequests.find(request => 
            request.customer === customerCode && 
            request.period === period && 
            request.type === type &&
            (request.status === 'pending' || request.status === 'completed')
        );
        
        console.log('중복 계산서 요청 체크:', {
            customerCode,
            period,
            type,
            existingRequests: existingRequests.length,
            duplicate: duplicate ? `발견됨 (${duplicate.status})` : '없음'
        });
        
        // 특별 케이스: 미결제 상태 주문에 대해서는 재발행 요청 허용
        // (하지만 현재 로직에서는 결제완료 주문만 계산서 발행하므로 이 케이스는 없음)
        
        return duplicate;
    },
    
    // 파트너코드 입력 포맷팅
    formatCustomerCode(input) {
        // Only allow numbers
        input.value = input.value.replace(/[^0-9]/g, '');
        // Limit to 6 digits
        if (input.value.length > 6) {
            input.value = input.value.slice(0, 6);
        }
    },
    
    // 기타 유틸리티 메서드들
    showPasswordReset() {
        alert('관리자에게 문의해주세요.\n이메일: admin@suyoung.co.kr');
    }
};

// 페이지 로드시 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});