var modalTotalAmount = 138.00;

function openPaymentModal(customTotal) {
    if (customTotal && customTotal > 0) {
        modalTotalAmount = customTotal;
    } else {
        var text = $('#cart-next-billing-total').text();
        if (text) {
            var parsed = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) {
                modalTotalAmount = parsed;
            }
        }
    }

    $('#modal-summary-total').text('$' + modalTotalAmount.toFixed(2));
    sessionStorage.setItem('checkout_total', String(modalTotalAmount));

    console.log('[Checkout] Opening payment modal — total: $' + modalTotalAmount.toFixed(2));

    var modal = new bootstrap.Modal(document.getElementById('paymentModal'));
    modal.show();
}

function confirmModalPayment() {
    var btn = $('#btn-modal-continue');
    btn.prop('disabled', true).html('<i class="fa-solid fa-spinner fa-spin me-2"></i> Processing...');

    var planId = parseInt(sessionStorage.getItem('selected_plan_id') || '1');
    console.log('[Checkout] Starting payment flow — planId:', planId, 'amount:', modalTotalAmount);

    ApiClient.createSubscription(1, planId, modalTotalAmount)
        .done(function (subscription) {
            console.log('[Checkout] Subscription created:', subscription);
            var subId = subscription ? (subscription.subscriptionId || subscription.SubscriptionId) : 0;

            if (!subId) {
                console.error('[Checkout] No subscriptionId returned');
                btn.prop('disabled', false).html('Continue');
                return;
            }

            ApiClient.createPaymentOrder(subId, modalTotalAmount, 'razor_order_' + Date.now())
                .done(function (payment) {
                    console.log('[Checkout] Payment order created:', payment);
                    var payId = payment ? (payment.paymentId || payment.PaymentId) : 0;

                    if (!payId) {
                        console.error('[Checkout] No paymentId returned');
                        window.location.href = '/Subscription/Failed?subscriptionId=' + subId + '&error=No+payment+ID';
                        return;
                    }

                    ApiClient.verifyPayment(payId, subId, 'razor_pay_' + Date.now(), 'Success')
                        .done(function (result) {
                            console.log('[Checkout] Payment verified:', result);
                            localStorage.removeItem('fc_cart_id');
                            window.location.href = '/Subscription/Success?subscriptionId=' + subId;
                        })
                        .fail(function (xhr) {
                            console.error('[Checkout] Verify failed:', xhr.responseText);
                            window.location.href = '/Subscription/Failed?subscriptionId=' + subId + '&error=Payment+verification+failed';
                        });
                })
                .fail(function (xhr) {
                    console.error('[Checkout] Payment order failed:', xhr.responseText);
                    window.location.href = '/Subscription/Failed?subscriptionId=' + subId + '&error=Payment+order+creation+failed';
                });
        })
        .fail(function (xhr) {
            console.error('[Checkout] Subscription creation failed:', xhr.status, xhr.responseText);
            btn.prop('disabled', false).html('Continue');
            alert('Failed to create subscription. Make sure the API server is running on port 5041.');
        });
}
