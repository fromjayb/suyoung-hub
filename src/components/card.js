// 카드 컴포넌트 (기획서 4.1 ProductCard 참고)
const Card = {
    // 제품 카드 (기획서 2.2 카탈로그/주문 화면)
    productCard(product) {
        const stockBadge = this.getStockBadge(product.stock);
        const priceBadge = this.getPriceBadge(product.price);
        const currentQty = DataManager.cart[product.id] || 0;
        
        return `
            <div class="card" style="margin-bottom: var(--spacing-lg);">
                <h3 style="margin: 0 0 var(--spacing-md) 0;">${product.name}</h3>
                <div style="margin-bottom: var(--spacing-md);">
                    ${stockBadge}
                </div>
                <div style="margin-bottom: var(--spacing-lg);">
                    ${priceBadge}
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="App.updateQty(${product.id}, -1)" 
                            ${currentQty <= 0 ? 'disabled' : ''}>-</button>
                    <div class="qty-display">${currentQty}</div>
                    <button class="qty-btn" onclick="App.updateQty(${product.id}, 1)"
                            ${product.stock <= 0 ? 'disabled' : ''}>+</button>
                    <button class="qty-btn" onclick="App.updateQty(${product.id}, 5)"
                            ${product.stock <= 0 ? 'disabled' : ''}>+5</button>
                </div>
            </div>
        `;
    },

    // 주문 내역 카드 (기획서 2.3 주문 내역 화면)
    orderCard(order) {
        const statusBadge = order.status === 'paid' ? 
            `<span class="badge badge-paid">결제완료</span>` : 
            `<span class="badge badge-unpaid">미결제</span>`;
        
        // 현재 상품 가격으로 실시간 계산
        let totalAmount = 0;
        let hasPricePending = false;
        
        const updatedItems = order.items.map(item => {
            // 현재 상품 데이터에서 최신 가격 조회
            const currentProduct = DataManager.findProduct(
                [...DataManager.products.lily, ...DataManager.products.other]
                    .find(p => p.name === item.name)?.id
            );
            
            const currentPrice = currentProduct ? currentProduct.price : item.price;
            const currentSubtotal = currentPrice > 0 ? currentPrice * item.qty : 0;
            
            if (currentPrice === 0) {
                hasPricePending = true;
            } else {
                totalAmount += currentSubtotal;
            }
            
            return {
                ...item,
                currentPrice: currentPrice,
                currentSubtotal: currentSubtotal
            };
        });
        
        const displayAmount = hasPricePending && totalAmount === 0 ? 
            '가격미정 포함' : 
            (hasPricePending ? 
                `₩${totalAmount.toLocaleString()} + 가격미정` : 
                `₩${totalAmount.toLocaleString()}`);

        return `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-md);">
                    <div>
                        <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">${order.date}</div>
                        <div class="caption" style="color: var(--neutral-gray-700);">${order.id}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-weight: 600; margin-bottom: var(--spacing-xs);">${displayAmount}</div>
                        ${statusBadge}
                    </div>
                </div>
                <div style="border-top: 1px solid var(--neutral-gray-300); padding-top: var(--spacing-md);">
                    ${updatedItems.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-xs);">
                            <span>${item.name} × ${item.qty}개</span>
                            <span>${item.currentPrice === 0 ? '<span class="badge badge-pending">가격미정</span>' : `₩${item.currentSubtotal.toLocaleString()}`}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // 통계 카드 (기획서 3.3 대시보드)
    statsCard(title, value, subtitle) {
        return `
            <div class="card" style="text-align: center;">
                <div class="caption" style="color: var(--neutral-gray-700); margin-bottom: var(--spacing-sm);">
                    ${title}
                </div>
                <div style="font-size: 32px; font-weight: 700; color: var(--primary-green-800); margin-bottom: var(--spacing-xs);">
                    ${value}
                </div>
                ${subtitle ? `<div class="caption" style="color: var(--neutral-gray-700);">${subtitle}</div>` : ''}
            </div>
        `;
    },

    // 재고 뱃지 (기획서 재고 표시 규칙)
    getStockBadge(stock) {
        if (stock > 30) {
            return `<span class="badge badge-plenty">여유</span>`;
        } else if (stock > 0) {
            return `<span class="badge badge-low">${stock}단</span>`;
        } else {
            return `<span class="badge badge-out">품절</span>`;
        }
    },

    // 가격 뱃지
    getPriceBadge(price) {
        if (price > 0) {
            return `<div style="font-weight: 600;">단가: ₩${price.toLocaleString()}</div>`;
        } else {
            return `<span class="badge badge-pending">가격 미정</span>`;
        }
    }
};