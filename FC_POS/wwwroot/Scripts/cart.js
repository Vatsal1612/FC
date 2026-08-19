/* ==========================================================================
   Module 4 JS: Cart Logic & AJAX (cart.js)
   ========================================================================== */

var cartId = parseInt($('#cart-id-input').val() || localStorage.getItem('fc_cart_id') || '0');

$(document).ready(function () {
    if (cartId > 0) {
        loadCartDetails(cartId);
    } else {
        renderEmptyCart();
    }
});

function loadCartDetails(id) {
    ApiClient.getCart(id)
        .done(function (cart) {
            renderCartView(cart);
        })
        .fail(function () {
            renderEmptyCart();
        });
}

function renderCartView(cart) {
    var wrapper = $('#cart-content-wrapper');
    wrapper.empty();

    if (!cart || (!cart.items || cart.items.length === 0 && cart.planPrice === 0)) {
        renderEmptyCart();
        return;
    }

    var itemsRows = '';
    if (cart.items && cart.items.length > 0) {
        cart.items.forEach(function (item) {
            var itemTitle = item.addOnName || 'Add-on';
            if (item.optionName) {
                itemTitle += ' (' + item.optionName + ')';
            }

            var itemTotal = (item.price * item.quantity).toFixed(2);

            var qtyControl = item.quantityEnabled ? `
                <div class="quantity-control">
                    <button class="btn-qty" type="button" onclick="updateCartItemQty(${item.itemId}, ${cart.cartId}, ${item.quantity - 1})">-</button>
                    <input type="text" class="input-qty" value="${item.quantity}" readonly />
                    <button class="btn-qty" type="button" onclick="updateCartItemQty(${item.itemId}, ${cart.cartId}, ${item.quantity + 1})">+</button>
                </div>
            ` : `<span class="fw-bold">${item.quantity}</span>`;

            itemsRows += `
                <tr>
                    <td>
                        <div class="fw-bold text-dark">${itemTitle}</div>
                        <small class="text-muted">Unit Price: $${parseFloat(item.price).toFixed(2)}</small>
                    </td>
                    <td class="text-center">${qtyControl}</td>
                    <td class="text-end fw-bold text-dark">$${itemTotal}</td>
                    <td class="text-center">
                        <button class="btn btn-link text-danger btn-sm p-0" onclick="removeCartItem(${item.itemId}, ${cart.cartId})">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    } else {
        itemsRows = `<tr><td colspan="4" class="text-center text-muted py-3">No additional add-ons selected.</td></tr>`;
    }

    var html = `
        <div class="col-lg-8">
            <div class="card shadow-sm border-0 rounded-3 mb-4">
                <div class="card-header bg-white py-3 border-bottom">
                    <h5 class="fw-bold m-0"><i class="fa-solid fa-layer-group me-2 text-primary"></i> Selected Subscription &amp; Add-ons</h5>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table cart-table align-middle m-0">
                            <thead>
                                <tr>
                                    <th>Item / Description</th>
                                    <th class="text-center">Quantity</th>
                                    <th class="text-end">Total Price</th>
                                    <th class="text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="table-light">
                                    <td>
                                        <div class="fw-bold text-primary">${cart.planName || 'POS Subscription Plan'}</div>
                                        <small class="text-muted">Base Plan (${cart.billingCycle || 'Monthly'})</small>
                                    </td>
                                    <td class="text-center"><span class="badge bg-secondary">Included</span></td>
                                    <td class="text-end fw-bold text-dark">$${parseFloat(cart.planPrice || 0).toFixed(2)}</td>
                                    <td class="text-center">-</td>
                                </tr>
                                ${itemsRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-lg-4">
            <div class="card shadow-sm border-0 rounded-3">
                <div class="card-header bg-white py-3 border-bottom">
                    <h5 class="fw-bold m-0"><i class="fa-solid fa-receipt me-2 text-success"></i> Order Summary</h5>
                </div>
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Base Plan Price:</span>
                        <span class="fw-semibold">$${parseFloat(cart.planPrice || 0).toFixed(2)}</span>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span class="text-muted">Add-ons Subtotal:</span>
                        <span class="fw-semibold">$${parseFloat((cart.totalAmount || 0) - (cart.planPrice || 0)).toFixed(2)}</span>
                    </div>
                    <div class="alert alert-success border-0 py-2 px-3 small my-3 rounded-3">
                        <i class="fa-solid fa-gift me-1"></i> <strong>14-Day Free Trial Included</strong>
                    </div>
                    <hr />
                    <div class="d-flex justify-content-between mb-4 fs-5">
                        <span class="fw-bold">Total Estimated:</span>
                        <span class="fw-extrabold text-primary">$${parseFloat(cart.totalAmount || 0).toFixed(2)}</span>
                    </div>

                    <a href="/Subscription/Checkout?cartId=${cart.cartId}" class="btn btn-primary btn-lg w-100 py-3 shadow-sm">
                        <i class="fa-solid fa-lock me-1"></i> Proceed to Checkout
                    </a>
                </div>
            </div>
        </div>
    `;
    wrapper.html(html);
}

function renderEmptyCart() {
    var wrapper = $('#cart-content-wrapper');
    wrapper.html(`
        <div class="col-12 text-center py-5">
            <div class="empty-cart-box max-w-600 mx-auto">
                <i class="fa-solid fa-cart-arrow-down fs-1 text-muted mb-3"></i>
                <h3 class="fw-bold">Your Cart is Currently Empty</h3>
                <p class="text-muted mb-4">You have not selected a plan or add-ons yet.</p>
                <a href="/Subscription" class="btn btn-primary btn-lg px-4"><i class="fa-solid fa-tags me-1"></i> View Subscription Plans</a>
            </div>
        </div>
    `);
}

function updateCartItemQty(itemId, cId, newQty) {
    if (newQty < 1) {
        removeCartItem(itemId, cId);
        return;
    }

    ApiClient.updateCartItem(itemId, cId, newQty)
        .done(function (cart) {
            renderCartView(cart);
        });
}

function removeCartItem(itemId, cId) {
    ApiClient.removeCartItem(itemId, cId)
        .done(function (cart) {
            renderCartView(cart);
        });
}
