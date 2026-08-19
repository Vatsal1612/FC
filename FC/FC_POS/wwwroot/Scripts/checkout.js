/* ==========================================================================
   Screen 3 JS: Shared Common Payment Modal Logic (checkout.js)
   ========================================================================== */

var modalTotalAmount = 138.00;

function openPaymentModal(customTotal) {
    if (customTotal && customTotal > 0) {
        modalTotalAmount = customTotal;
    } else {
        // Read running total from cart panel if present
        var text = $('#selection-next-billing-total').text();
        if (text) {
            var parsed = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) {
                modalTotalAmount = parsed;
            }
        }
    }

    $('#modal-summary-total').text('$' + modalTotalAmount.toFixed(2));
    sessionStorage.setItem('checkout_total', String(modalTotalAmount));

    // Reset the Continue button + always land on the "Cards" tab first,
    // matching the default state shown in the payment options screen.
    $('#btn-modal-continue').prop('disabled', false).html('Continue');
    selectPaymentMethod('cards');

    var modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

// Switches which payment method's detail panel is shown on the right
// side of the modal (UPI / Cards / Netbanking / Wallet), mirroring the
// real Razorpay checkout's left-nav + detail-pane layout.
function selectPaymentMethod(method) {
    $('.rzp-method-nav-item').removeClass('active');
    $('.rzp-method-nav-item[data-panel="' + method + '"]').addClass('active');

    $('.rzp-detail-panel').attr('hidden', true).removeClass('active');
    $('.rzp-detail-panel[data-panel="' + method + '"]').removeAttr('hidden').addClass('active');
}

function confirmModalPayment() {
    var btn = $('#btn-modal-continue');
    btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin me-2"></i> Activating Subscription...');

    var planId = parseInt(sessionStorage.getItem('selected_plan_id') || '1');
    var restaurantDetails = {
        name: $('#restaurantName').val() || 'Demo Bistro',
        email: $('#restaurantEmail').val() || 'demo@bistro.com',
        phone: $('#restaurantPhone').val() || '+1234567890',
        address: $('#restaurantAddress').val() || '123 Gourmet St'
    };

    // 1. Create Subscription via Web API
    ApiClient.createSubscription(0, planId, modalTotalAmount, restaurantDetails)
        .done(function (subscription) {
            var subId = subscription ? subscription.subscriptionId : 1;

            // 2. Create Payment Order via Web API
            ApiClient.createPaymentOrder(subId, modalTotalAmount, 'razor_order_' + Math.floor(Math.random() * 1000000))
                .done(function (payment) {
                    var payId = payment ? payment.paymentId : 1;

                    // 3. Verify Payment & Activate Subscription
                    ApiClient.verifyPayment(payId, subId, 'razor_pay_' + Math.floor(Math.random() * 1000000), 'Success')
                        .done(function () {
                            localStorage.removeItem('fc_cart_id');
                            window.location.href = '/Subscription/Success?subscriptionId=' + subId;
                        })
                        .fail(function () {
                            window.location.href = '/Subscription/Failed?subscriptionId=' + subId + '&error=Payment+verification+failed';
                        });
                })
                .fail(function () {
                    window.location.href = '/Subscription/Failed?subscriptionId=' + subId + '&error=Payment+order+creation+failed';
                });
        })
        .fail(function () {
            btn.prop('disabled', false).html('Continue');
            alert('Failed to process payment. Please verify Web API server connectivity.');
        });
}
