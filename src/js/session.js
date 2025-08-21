// 세션 타임아웃 관리 모듈
const SessionManager = {
    TIMEOUT_DURATION: 6 * 60 * 60 * 1000, // 6시간 (밀리초)
    WARNING_TIME: 5 * 60 * 1000, // 5분 전 경고 (밀리초)
    
    timeoutId: null,
    warningId: null,
    lastActivity: Date.now(),
    isWarningShown: false,
    
    // 세션 타임아웃 초기화
    init() {
        console.log('SessionManager 초기화 - 6시간 타임아웃 설정');
        this.lastActivity = Date.now();
        this.startTimeout();
        this.bindActivityEvents();
    },
    
    // 사용자 활동 이벤트 바인딩
    bindActivityEvents() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity();
            }, true);
        });
        
        // 페이지 포커스/블러 이벤트
        window.addEventListener('focus', () => {
            this.updateActivity();
        });
        
        console.log('세션 활동 감지 이벤트 바인딩 완료');
    },
    
    // 사용자 활동 업데이트
    updateActivity() {
        this.lastActivity = Date.now();
        
        // 기존 타임아웃 취소하고 새로 시작
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        if (this.warningId) {
            clearTimeout(this.warningId);
        }
        
        // 경고 상태 초기화
        if (this.isWarningShown) {
            this.hideWarning();
        }
        
        this.startTimeout();
    },
    
    // 타임아웃 시작
    startTimeout() {
        // 5분 전 경고 타이머
        this.warningId = setTimeout(() => {
            this.showWarning();
        }, this.TIMEOUT_DURATION - this.WARNING_TIME);
        
        // 세션 만료 타이머
        this.timeoutId = setTimeout(() => {
            this.handleTimeout();
        }, this.TIMEOUT_DURATION);
    },
    
    // 세션 만료 경고 표시
    showWarning() {
        if (this.isWarningShown) return;
        
        this.isWarningShown = true;
        const remainingTime = Math.ceil(this.WARNING_TIME / 60000); // 분 단위
        
        const warningModal = document.createElement('div');
        warningModal.id = 'session-warning-modal';
        warningModal.innerHTML = `
            <div class="modal active" style="z-index: 9999;">
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3 style="margin: 0; color: var(--semantic-error);">⏰ 세션 만료 경고</h3>
                    </div>
                    <div style="margin: var(--spacing-lg) 0;">
                        <p>비활성 상태가 계속되고 있습니다.</p>
                        <p><strong>${remainingTime}분 후</strong> 자동으로 로그아웃됩니다.</p>
                        <p>계속 사용하시려면 "세션 연장" 버튼을 클릭해주세요.</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="SessionManager.extendSession()">
                            세션 연장
                        </button>
                        <button class="btn btn-ghost" onclick="SessionManager.logout()">
                            로그아웃
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(warningModal);
        
        console.log(`세션 만료 경고 표시 - ${remainingTime}분 후 자동 로그아웃`);
    },
    
    // 경고 모달 숨김
    hideWarning() {
        const warningModal = document.getElementById('session-warning-modal');
        if (warningModal) {
            warningModal.remove();
        }
        this.isWarningShown = false;
    },
    
    // 세션 연장
    extendSession() {
        console.log('세션 연장 요청');
        this.hideWarning();
        this.updateActivity();
    },
    
    // 세션 타임아웃 처리
    handleTimeout() {
        console.log('세션 타임아웃 - 자동 로그아웃 실행');
        this.hideWarning();
        
        // 세션 데이터 정리
        this.clearSession();
        
        // 타임아웃 알림
        alert('6시간 동안 활동이 없어 자동으로 로그아웃되었습니다.\n보안을 위해 다시 로그인해주세요.');
        
        // 로그아웃 처리
        this.logout();
    },
    
    // 수동 로그아웃
    logout() {
        console.log('세션 로그아웃 처리');
        this.clearSession();
        
        // 파트너 또는 관리자 로그아웃 처리
        if (typeof App !== 'undefined' && App.logout) {
            App.logout();
        } else if (typeof AdminApp !== 'undefined' && AdminApp.logout) {
            AdminApp.logout();
        } else {
            // 기본 로그아웃 처리
            window.location.reload();
        }
    },
    
    // 세션 데이터 정리
    clearSession() {
        // 타이머 정리
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        if (this.warningId) {
            clearTimeout(this.warningId);
            this.warningId = null;
        }
        
        // 경고 모달 제거
        this.hideWarning();
        
        // 세션 상태 초기화
        this.lastActivity = null;
        this.isWarningShown = false;
        
        console.log('세션 데이터 정리 완료');
    },
    
    // 세션 상태 확인
    getSessionInfo() {
        const now = Date.now();
        const timeElapsed = now - this.lastActivity;
        const timeRemaining = this.TIMEOUT_DURATION - timeElapsed;
        
        return {
            isActive: timeRemaining > 0,
            timeElapsed: Math.floor(timeElapsed / 1000), // 초 단위
            timeRemaining: Math.floor(timeRemaining / 1000), // 초 단위
            lastActivity: new Date(this.lastActivity)
        };
    },
    
    // 세션 정지 (로그아웃 시 호출)
    stop() {
        console.log('세션 매니저 정지');
        this.clearSession();
    }
};