// 유틸리티 함수들
const Utils = {
    // 숫자 포맷팅
    formatCurrency(amount) {
        return '₩' + amount.toLocaleString('ko-KR');
    },
    
    // 날짜 포맷팅
    formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },
    
    // 오늘 날짜
    getToday() {
        return this.formatDate(new Date());
    },
    
    // 재고 상태 확인
    getStockStatus(stock) {
        if (stock > 30) return 'plenty';
        if (stock > 0) return 'low';
        return 'out';
    },
    
    // 재고 배지 HTML
    getStockBadge(stock) {
        const status = this.getStockStatus(stock);
        if (status === 'plenty') {
            return '<span class="badge badge-plenty">여유</span>';
        } else if (status === 'low') {
            return `<span class="badge badge-low">${stock}단</span>`;
        } else {
            return '<span class="badge badge-out">품절</span>';
        }
    },
    
    // 가격 표시
    getPriceDisplay(price) {
        if (price > 0) {
            return `<span style="font-weight: 600;">단가: ${this.formatCurrency(price)}</span>`;
        } else {
            return '<span class="badge badge-pending">가격 미정</span>';
        }
    },
    
    // 알림 표시
    showAlert(message, type = 'info') {
        alert(message);
    },
    
    // 확인 대화상자
    showConfirm(message) {
        return confirm(message);
    },
    
    // 요소 표시/숨기기
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    },
    
    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    },
    
    // 모든 섹션 숨기기
    hideAllSections(selector = '.section') {
        document.querySelectorAll(selector).forEach(section => {
            section.classList.remove('active');
        });
    },
    
    // 섹션 표시
    showSection(sectionId) {
        this.hideAllSections();
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
        }
    },
    
    // CSV 내보내기
    exportToCSV(data, filename = 'export.csv') {
        let csv = '';
        
        // 헤더 추가
        if (data.length > 0) {
            csv += Object.keys(data[0]).join(',') + '\n';
        }
        
        // 데이터 추가
        data.forEach(row => {
            csv += Object.values(row).join(',') + '\n';
        });
        
        // 다운로드
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    // 연간 계산서 활성화 체크
    checkAnnualInvoice() {
        const now = new Date();
        const month = now.getMonth(); // 0-11
        const date = now.getDate();
        
        // 12월 15일 ~ 31일
        return month === 11 && date >= 15;
    },
    
    // 기간 텍스트 생성
    getPeriodText(type = 'monthly') {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-11
        
        switch(type) {
            case 'monthly':
                return `${year}년 ${month}월`;
            case 'quarterly':
                const quarter = Math.floor(month / 3);
                return `${year}년 ${quarter}분기`;
            case 'semiannual':
                const half = month < 6 ? '상반기' : '하반기';
                return `${year}년 ${half}`;
            case 'annual':
                return `${year}년`;
            default:
                return '';
        }
    },
    
    // 페이지네이션 생성
    createPagination(totalItems, itemsPerPage = 10, currentPage = 1) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const pages = [];
        
        for (let i = 1; i <= totalPages; i++) {
            pages.push({
                page: i,
                active: i === currentPage
            });
        }
        
        return {
            pages,
            hasPrev: currentPage > 1,
            hasNext: currentPage < totalPages,
            totalPages,
            currentPage
        };
    }
};