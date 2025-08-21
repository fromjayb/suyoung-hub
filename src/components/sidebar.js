// 사이드바 컴포넌트 (기획서 3.2 관리자 레이아웃 참고)
const Sidebar = {
    render(currentPage = 'dashboard') {
        const menuItems = [
            { id: 'dashboard', label: '대시보드', icon: '' },
            { id: 'inventory', label: '재고관리', icon: '' },
            { id: 'products', label: '상품관리', icon: '' },
            { id: 'customers', label: '파트너관리', icon: '' },
            { id: 'orders', label: '주문관리', icon: '' },
            { id: 'invoices', label: '계산서관리', icon: '' },
            { id: 'settings', label: '설정', icon: '' },
            { id: 'logout', label: '로그아웃', icon: '', isLogout: true }
        ];

        return `
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h2 style="color: var(--primary-green-800); margin: 0;">수영원예 HUB</h2>
                    <div class="caption" style="color: var(--neutral-gray-700);">관리자</div>
                </div>
                <nav class="sidebar-nav">
                    ${menuItems.map(item => `
                        <a href="#" 
                           class="sidebar-item ${item.id === currentPage ? 'active' : ''} ${item.isLogout ? 'logout-item' : ''}" 
                           onclick="${item.isLogout ? 'App.logout(); Sidebar.closeSidebar();' : `AdminApp.showPage('${item.id}'); Sidebar.closeSidebar();`}">
                            <span style="margin-right: var(--spacing-md);">${item.icon}</span>
                            ${item.label}
                        </a>
                    `).join('')}
                </nav>
            </div>
            
            <div class="sidebar-toggle" onclick="Sidebar.toggle()">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
    },
    
    toggle() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
        
        if (overlay) {
            overlay.classList.toggle('active');
        }
        
        // 모바일에서만 오버레이 기능 활성화
        if (window.innerWidth <= 768) {
            if (sidebar && sidebar.classList.contains('active')) {
                // 사이드바가 열릴 때 body 스크롤 방지
                document.body.style.overflow = 'hidden';
            } else {
                // 사이드바가 닫힐 때 body 스크롤 복원
                document.body.style.overflow = 'auto';
            }
        }
    },
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        // 사이드바와 오버레이가 활성화되어 있으면 닫기
        if (sidebar && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        
        if (overlay && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
        
        // body 스크롤 복원 (모바일)
        if (window.innerWidth <= 768) {
            document.body.style.overflow = 'auto';
        }
    }
};