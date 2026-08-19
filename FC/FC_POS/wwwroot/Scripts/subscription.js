var globalCycle = 'Yearly';
var posTier = 'Premium';
var orderingTier = 'Fix';

var liteFeatures = {
    groups: [
        {
            title: 'Billing & operations',
            items: [
                'Includes everything in Free plan',
                'Payment methods (cash, UPI, card)',
                'Address customization for delivery',
                'Service charges & tax setup',
                'Multi-user with role permissions',
                'Item notes & item codes',
                'Expense tracking & daily reports'
            ]
        },
        {
            title: 'Setup & customization',
            items: [
                'Printer customization (KOT & receipt)',
                'Table reservation',
                'Cloud sync across devices',
                'Font & theme settings',
                'Email & WhatsApp support',
                'Support'
            ]
        }
    ]
};

var premiumFeatures = {
    groups: [
        {
            title: 'Everything in Lite, plus',
            items: [
                'Meal deals & combo builder',
                'Split bill & split payment',
                'Multiple menus (lunch, dinner, party)',
                'Item-level cost & profit estimates',
                'Multi-user with role permissions',
                'Item notes & item codes',
                'Expense tracking & daily reports'
            ]
        },
        {
            title: 'Online & QR ordering',
            items: [
                'Auto-print online orders to KOT',
                'Online order auto-accept rules',
                'Coupons & promo codes',
                'Coupons & promo codes',
                'Dine-in QR code (table-side ordering)'
            ]
        }
    ]
};

$(document).ready(function () {
    renderPosFeatures();
    updateScreen1Prices();
    loadPlansFromApi();
});

function loadPlansFromApi() {
    $.when(ApiClient.getPlans(), ApiClient.getGrowthPlanFeatures())
        .done(function (plansResult, featuresResult) {
            var plans = plansResult[0] || [];
            var features = featuresResult[0] || [];
            var posPlan = plans.find(function (plan) { return plan.planType === 'POS'; });
            var growthPlan = plans.find(function (plan) { return plan.planType === 'Growth'; });
            var orderingPlan = plans.find(function (plan) { return plan.planType === 'Ordering'; });

            if (posPlan) {
            }
            if (growthPlan) {
                $('.growth-price').text('$' + Number(growthPlan.price).toFixed(0) + ' / ' + growthPlan.billingCycle);
            }
            if (orderingPlan) {
            }
            if (features.length) {
                var growthTotal = 0;
                features.forEach(function (feature) {
                    var key = String(feature.featureName || '').toLowerCase();
                    var row = $('.bundle-row[data-feature="' + key + '"]');
                    if (!row.length && key === 'kitchen display system') {
                        row = $('.bundle-row[data-feature="kitchen display system"]');
                    }
                    if (!row.length && key === 'team training') {
                        row = $('.bundle-row[data-feature="team training"]');
                    }
                    if (row.length) {
                        row.find('.badge-value').text('Value: $' + Number(feature.featureValue).toFixed(0));
                        growthTotal += Number(feature.featureValue || 0);
                    }
                });
                $('#growth-total-value').text('TOTAL VALUE: $' + growthTotal.toFixed(0));
                $('#growth-savings').text('You save with Growth Plan — $' + (growthTotal - 600).toFixed(0));
            }
        });
}

function switchGlobalCycle(cycle) {
    globalCycle = cycle;
    $('.billing-option').removeClass('active');
    $('#billing-cycle-switch').toggleClass('yearly-selected', cycle === 'Yearly');
    if (cycle === 'Monthly') {
        $('#global-toggle-monthly').addClass('active');
        $('#global-toggle-monthly input').prop('checked', true);
    } else {
        $('#global-toggle-yearly').addClass('active');
        $('#global-toggle-yearly input').prop('checked', true);
    }
    updateScreen1Prices();
}

function selectPosTier(tier) {
    posTier = tier;
    $('#pos-tier-lite, #pos-tier-premium').removeClass('active');
    if (tier === 'Lite') {
        $('#pos-tier-lite').addClass('active');
        $('#pos-desc').text('Everything a single-outlet restaurant needs to start billing today.');
    } else {
        $('#pos-tier-premium').addClass('active');
        $('#pos-desc').text('Everything a single-outlet restaurant needs to start billing today.');
    }
    renderPosFeatures();
    updateScreen1Prices();
}

function selectOrderingTier(tier) {
    orderingTier = tier;
    $('#ordering-tier-fix, #ordering-tier-commission').removeClass('active');
    if (tier === 'Fix') {
        $('#ordering-tier-fix').addClass('active');
        $('#ordering-desc').text('Predictable cost, unlimited orders.');
    } else {
        $('#ordering-tier-commission').addClass('active');
        $('#ordering-desc').text('Pay as you grow with a small commission per order.');
    }
    updateScreen1Prices();
}

function renderPosFeatures() {
    var data = posTier === 'Lite' ? liteFeatures : premiumFeatures;
    var html = '';
    data.groups.forEach(function (g) {
        html += '<li class="group-label">' + g.title + '</li>';
        g.items.forEach(function (item) {
            html += '<li><i class="fa-solid fa-circle-check check-icon"></i> ' + item + '</li>';
        });
    });
    $('#pos-feature-list').html(html);
}

function updateScreen1Prices() {
    if (globalCycle === 'Monthly') {
        if (posTier === 'Lite') {
            $('#pos-price-val').text('$10');
            $('#pos-period-val').text(' / Month');
        } else {
            $('#pos-price-val').text('$30');
            $('#pos-period-val').text(' / Month');
        }
    } else {
        if (posTier === 'Lite') {
            $('#pos-price-val').text('$10');
            $('#pos-period-val').text(' / Month billed annually');
        } else {
            $('#pos-price-val').text('$25');
            $('#pos-period-val').text(' / Month billed annually');
        }
    }

    $('#growth-price-area').html(
        '<div class="growth-price-row"><span class="price-struck">$1,899</span><span class="growth-price">$600 / Year</span></div>'
    );
    $('#growth-cta-box').html(
        '<button type="button" class="btn-growth-gradient" onclick="selectAndNavigatePlan(\'Growth\')">Start 14 Day Free Trial</button>'
    );

    if (orderingTier === 'Fix') {
        $('#ordering-commission-note').hide();
        if (globalCycle === 'Monthly') {
            $('#ordering-price-val').text('$30');
            $('#ordering-period-val').text(' / Month');
        } else {
            $('#ordering-price-val').text('$25');
            $('#ordering-period-val').text(' / Month billed annually');
        }
    } else {
        $('#ordering-commission-note').show();
        $('#ordering-price-val').text('$99');
        $('#ordering-period-val').text(' / One Time');
    }
}

function selectAndNavigatePlan(planType) {
    sessionStorage.setItem('selected_cycle', globalCycle);
    sessionStorage.setItem('selected_plan_type', planType);
    sessionStorage.setItem('selected_pos_tier', posTier);
    sessionStorage.setItem('selected_ordering_tier', orderingTier);

    if (planType === 'Growth') {
        window.location.href = '/Subscription/GrowthAddOns?planId=2';
    } else if (planType === 'Ordering') {
        window.location.href = '/Subscription/PosAddOns?planId=3';
    } else {
        window.location.href = '/Subscription/PosAddOns?planId=1';
    }
}
