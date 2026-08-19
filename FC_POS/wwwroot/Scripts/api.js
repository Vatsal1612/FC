var ApiClient = (function () {
    var API_BASE_URL = 'http://localhost:5041';

    if (window.API_OVERRIDE_URL) {
        API_BASE_URL = window.API_OVERRIDE_URL;
    }

    function ajaxRequest(endpoint, method, data) {
        var targetUrl = (endpoint.startsWith('http://') || endpoint.startsWith('https://'))
            ? endpoint
            : API_BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);

        console.log('[API] ' + (method || 'GET') + ' ' + targetUrl, data || '');

        return $.ajax({
            url: targetUrl,
            type: method || 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: data ? (method === 'GET' ? data : JSON.stringify(data)) : null,
            crossDomain: true,
            xhrFields: { withCredentials: false }
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error('[API] FAILED ' + endpoint, textStatus, errorThrown, jqXHR.status, jqXHR.responseText);
        });
    }

    return {
        getBaseUrl: function () { return API_BASE_URL; },

        getPlans: function () { return ajaxRequest('/api/plans', 'GET'); },
        getPlanById: function (id) { return ajaxRequest('/api/plans/' + id, 'GET'); },
        getGrowthPlanFeatures: function () { return ajaxRequest('/api/plans/growth/features', 'GET'); },

        getMonthlyAddOns: function () { return ajaxRequest('/api/addons/monthly', 'GET'); },
        getYearlyAddOns: function () { return ajaxRequest('/api/addons/yearly', 'GET'); },
        getAddOnById: function (id) { return ajaxRequest('/api/addons/' + id, 'GET'); },
        getAddOnOptions: function (id, billingCycle) {
            var url = '/api/addons/options/' + id + (billingCycle ? '?billingCycle=' + encodeURIComponent(billingCycle) : '');
            return ajaxRequest(url, 'GET');
        },

        createCart: function (restaurantId, planId, billingCycle) {
            return ajaxRequest('/api/cart', 'POST', {
                restaurantId: restaurantId || 1,
                planId: planId,
                billingCycle: billingCycle || 'Monthly'
            });
        },
        getCart: function (cartId) { return ajaxRequest('/api/cart/' + cartId, 'GET'); },
        addCartItem: function (cartId, addonId, optionId, quantity, price) {
            return ajaxRequest('/api/cart/add', 'POST', {
                cartId: cartId,
                addOnId: addonId,
                optionId: optionId || null,
                quantity: quantity || 1,
                price: price
            });
        },
        updateCartItem: function (itemId, cartId, quantity) {
            return ajaxRequest('/api/cart/update', 'PUT', {
                itemId: itemId, cartId: cartId, quantity: quantity
            });
        },
        removeCartItem: function (itemId, cartId) {
            return ajaxRequest('/api/cart/remove/' + itemId + '?cartId=' + cartId, 'DELETE');
        },

        createSubscription: function (restaurantId, planId, amount) {
            return ajaxRequest('/api/subscription', 'POST', {
                restaurantId: restaurantId || 1,
                planId: planId,
                amount: amount
            });
        },
        getSubscription: function (id) { return ajaxRequest('/api/subscription/' + id, 'GET'); },

        createPaymentOrder: function (subscriptionId, amount, razorpayOrderId) {
            return ajaxRequest('/api/payment/order', 'POST', {
                subscriptionId: subscriptionId,
                amount: amount,
                razorpayOrderId: razorpayOrderId || null
            });
        },
        verifyPayment: function (paymentId, subscriptionId, razorpayPaymentId, status) {
            return ajaxRequest('/api/payment/verify', 'POST', {
                paymentId: paymentId,
                subscriptionId: subscriptionId,
                razorpayPaymentId: razorpayPaymentId || ('pay_' + Math.random().toString(36).substring(2, 11)),
                status: status || 'Success'
            });
        }
    };
})();
