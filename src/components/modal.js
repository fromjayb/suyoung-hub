// 모달 컴포넌트 (기획서 1.4 공통 컴포넌트 참고)
const Modal = {
    show(title, content, actions = []) {
        const modalHTML = `
            <div class="modal active" id="modal" onclick="Modal.handleBackdropClick(event)">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 style="margin: 0;">${title}</h3>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        ${actions.map(action => `
                            <button class="btn ${action.class || 'btn-secondary'}" 
                                    onclick="${action.onclick}">
                                ${action.text}
                            </button>
                        `).join('')}
                        <button class="btn btn-ghost" onclick="Modal.hide()">닫기</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },

    hide() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.remove();
        }
    },

    handleBackdropClick(event) {
        if (event.target === event.currentTarget) {
            this.hide();
        }
    },

    confirm(title, message, onConfirm, onCancel) {
        this.show(title, `<p>${message}</p>`, [
            {
                text: '확인',
                class: 'btn-primary',
                onclick: `Modal.hide(); (${onConfirm.toString()})()`
            },
            {
                text: '취소', 
                onclick: onCancel ? `Modal.hide(); (${onCancel.toString()})()` : 'Modal.hide()'
            }
        ]);
    }
};