/* ==========================================================================
   API Client - AJAX Communication Layer for FC_POS -> FC_POS_API
   ========================================================================== */

var ApiClient = (function () {
    // Dynamic API Base URL configuration.
    //
    // BUG FIX: the previous logic always fell back to a hard-coded
    // 'http://localhost:5041' regardless of the protocol the page itself
    // was served over. When FC_POS was loaded over https (e.g. the
    // https launch profile, or any reverse-proxied/https host), the browser
    // silently blocks an http:// XHR/fetch call as "mixed content" -
    // the request never leaves the browser, so it never shows up in the
    // Network panel and every ApiClient call appears to just hang/fail.
    //
    // Fix: match the API port to the *current page's* protocol so the
    // request is always same-scheme, and only fall back to a hard-coded
    // value if nothing better can be inferred.
    function resolveBaseUrl() {
        if (window.API_OVERRIDE_URL) {
            return window.API_OVERRIDE_URL;
        }

        var origin = window.location.origin;

        // Already running on the API host itself (e.g. Swagger/local testing).
        if (origin.indexOf(':5041') !== -1 || origin.indexOf(':7072') !== -1) {
            return origin;
        }

        // FC_POS_API's launchSettings expose both an http (5041) and an
        // https (7072) endpoint at the same time, so pick whichever one
        // matches the current page's scheme to stay same-protocol.
        var isSecure = window.location.protocol === 'https:';
        var apiPort = isSecure ? '7072' : '5041';
        return window.location.protocol + '//' + window.location.hostname + ':' + apiPort;
    }

    var API_BASE_URL = resolveBaseUrl();

    // Helper for AJAX requests
    function ajaxRequest(endpoint, method, data) {
        // Fallback to relative URL if same host, else full API_BASE_URL
        var targetUrl = (endpoint.indexOf('http://') === 0 || endpoint.indexOf('https://') === 0)
            ? endpoint
            : API_BASE_URL + (endpoint.indexOf('/') === 0 ? endpoint : '/' + endpoint);

        return $.ajax({
            url: targetUrl,
            type: method || 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: data ? (method === 'GET' ? data : JSON.stringify(data)) : null,
            crossDomain: true
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.warn('API Endpoint request failed:', endpoint, textStatus, errorThrown);
        });
    }

    return {
        // Base URL getter
        getBaseUrl: function () {
            return API_BASE_URL;
        },

        // Plans API
        getPlans: function () {
            return ajaxRequest('/api/plans', 'GET');
        },
        getPlanById: function (id) {
            return ajaxRequest('/api/plans/' + id, 'GET');
        },
        getPlanFeatures: function (planType, tierName) {
            var params = [];
            if (planType) params.push('planType=' + encodeURIComponent(planType));
            if (tierName) params.push('tierName=' + encodeURIComponent(tierName));
            var url = '/api/plans/features' + (params.length ? '?' + params.join('&') : '');
            return ajaxRequest(url, 'GET');
        },
        getGrowthPlanFeatures: function () {
            return ajaxRequest('/api/plans/growth/features', 'GET');
        },
        getPageSettings: function (pageName) {
            var url = '/api/plans/settings' + (pageName ? '?pageName=' + encodeURIComponent(pageName) : '');
            return ajaxRequest(url, 'GET');
        },

        // AddOns API
        getMonthlyAddOns: function () {
            return ajaxRequest('/api/addons/monthly', 'GET');
        },
        getYearlyAddOns: function () {
            return ajaxRequest('/api/addons/yearly', 'GET');
        },
        getAddOnById: function (id) {
            return ajaxRequest('/api/addons/' + id, 'GET');
        },
        getAddOnOptions: function (id, billingCycle) {
            var url = '/api/addons/options/' + id + (billingCycle ? '?billingCycle=' + encodeURIComponent(billingCycle) : '');
            return ajaxRequest(url, 'GET');
        },

        // Subscription API
        createSubscription: function (restaurantId, planId, amount, restaurantDetails) {
            return ajaxRequest('/api/subscription', 'POST', {
                restaurantId: restaurantId || 0,
                planId: planId,
                amount: amount,
                restaurantName: restaurantDetails ? restaurantDetails.name : null,
                restaurantEmail: restaurantDetails ? restaurantDetails.email : null,
                restaurantPhone: restaurantDetails ? restaurantDetails.phone : null,
                restaurantAddress: restaurantDetails ? restaurantDetails.address : null
            });
        },
        getSubscription: function (id) {
            return ajaxRequest('/api/subscription/' + id, 'GET');
        },

        // Payment API
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
