/* ==========================================================================
   Subscription Plans Page - Fully Dynamic Database-Driven Script
   ========================================================================== */

var globalCycle = 'Monthly';
var posTier = 'Premium';
var orderingTier = 'Fix';

// In-memory cache for dynamic data from DB
var dbData = {
    plans: [],
    features: [],
    settings: {}
};

// Fallback initial data in case API is temporarily unavailable
var fallbackFeatures = {
    posLite: {
        groups: [
            {
                title: 'Billing & operations',
                items: [
                    'Includes everything in Free plan',
                    'payment methods (cash, UPI, card)',
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
    },
    posPremium: {
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
                    'Dine-in QR code (table-side ordering)'
                ]
            }
        ]
    },
    orderingFix: [
        'Takeaway / Dine-in / Delivery Ordering',
        'Razorpay payment gateway',
        'Online Order Management',
        '$2000 Free Sales Credit',
        'Menu customization',
        'Tax Management',
        'Promo Code / Coupon',
        'Multiple Language',
        'Delivery Integration',
        'Custom Domain',
        'Google Analytics',
        'Coaching Session',
        'SEO Optimization'
    ],
    orderingCommission: [
        'Take Away / Dine In / Delivery',
        'Razorpay payment gateway',
        '1.8 % Order Commission On Every Order',
        '$1 Platform Fee to Customer',
        'Online Order Management',
        '$4000 Free Sales Credit',
        'Menu customization',
        'Tax Management',
        'Promo Code / Coupon',
        'Multiple Language',
        'Own Driver/Porter Delivery Integration',
        'Custom Domain',
        'SEO Optimization'
    ],
    growthBundles: [
        { name: 'Online Ordering Plan', value: 300 },
        { name: 'POS Premium Plan', value: 300 },
        { name: 'Happy Hour', value: 250 },
        { name: 'Bio Link Page', value: 49 },
        { name: 'WhatsApp Automation', value: 300 },
        { name: 'KDS — Kitchen Display', value: 150 },
        { name: 'Additional Menu', value: 100 },
        { name: 'Snap Dish', value: 100 },
        { name: 'Setup and Team Training', value: 350 }
    ]
};

$(document).ready(function () {
    // Initial render with fallback/current state
    renderAll();

    // Fetch dynamic content from DB via API
    loadDynamicDataFromDb();
});

/**
 * Loads all plans, features, and UI settings from the database via API.
 */
function loadDynamicDataFromDb() {
    $.when(
        ApiClient.getPlans(),
        ApiClient.getPlanFeatures(),
        ApiClient.getPageSettings('Subscription')
    ).done(function (plansRes, featuresRes, settingsRes) {
        dbData.plans = (plansRes && plansRes[0]) ? plansRes[0] : (Array.isArray(plansRes) ? plansRes : []);
        dbData.features = (featuresRes && featuresRes[0]) ? featuresRes[0] : (Array.isArray(featuresRes) ? featuresRes : []);
        dbData.settings = (settingsRes && settingsRes[0]) ? settingsRes[0] : (settingsRes || {});

        // Re-render UI with dynamic database data
        applyDynamicSettings();
        renderAll();
    }).fail(function (err) {
        console.warn('Could not load dynamic DB settings, using fallback UI:', err);
    });
}

/**
 * Applies header and page-level dynamic settings from DB.
 */
function applyDynamicSettings() {
    var s = dbData.settings;
    if (s.header_title) $('#page-header-title').text(s.header_title);
    if (s.header_subtitle) $('#page-header-subtitle').text(s.header_subtitle);
    if (s.cycle_discount_badge) $('#cycle-discount-badge').text(s.cycle_discount_badge);
    if (s.cycle_toggle_monthly_label) $('#label-cycle-monthly').text(s.cycle_toggle_monthly_label);
    if (s.cycle_toggle_yearly_label) $('#label-cycle-yearly').text(s.cycle_toggle_yearly_label);
    if (s.growth_guarantee_text) $('#growth-guarantee-banner').text(s.growth_guarantee_text);
    if (s.growth_yearly_note) $('#growth-yearly-note').text(s.growth_yearly_note);
    if (s.growth_all_features_note) $('#growth-subtitle').text(s.growth_all_features_note);
}

/**
 * Re-renders all 3 pricing cards based on current state & DB data.
 */
function renderAll() {
    renderPosCard();
    renderGrowthCard();
    renderOrderingCard();
}

/**
 * Gets plan record from DB by planType and tierName.
 */
function getDbPlan(planType, tierName) {
    if (!dbData.plans || !dbData.plans.length) return null;
    return dbData.plans.find(function (p) {
        return (p.planType || '').toLowerCase() === (planType || '').toLowerCase() &&
               (!tierName || (p.tierName || '').toLowerCase() === (tierName || '').toLowerCase());
    });
}

/**
 * Gets features for a given plan and tier from DB, grouped by category.
 */
function getDbFeaturesGrouped(planType, tierName) {
    if (!dbData.features || !dbData.features.length) return null;
    var filtered = dbData.features.filter(function (f) {
        return (f.planType || '').toLowerCase() === (planType || '').toLowerCase() &&
               (!tierName || (f.tierName || '').toLowerCase() === (tierName || '').toLowerCase());
    });

    if (!filtered.length) return null;

    // Check if any features have a category
    var hasCategories = filtered.some(function (f) { return !!f.categoryName; });
    if (!hasCategories) {
        return filtered.map(function (f) { return f.featureName; });
    }

    var groupMap = {};
    var groups = [];
    filtered.forEach(function (f) {
        var cat = f.categoryName || 'General Features';
        if (!groupMap[cat]) {
            groupMap[cat] = { title: cat, items: [] };
            groups.push(groupMap[cat]);
        }
        groupMap[cat].items.push(f.featureName);
    });

    return { groups: groups };
}

/**
 * 1. Renders POS Card
 */
function renderPosCard() {
    var plan = getDbPlan('POS', posTier);

    // Title
    if (plan && plan.planName) {
        // Strip out any trailing '- Lite' / '- Premium' if present in planName
        var cleanTitle = plan.planName.split(' - ')[0];
        $('#pos-plan-title').text(cleanTitle || 'POS (Point of Sale) Plan');
    }

    // Tiers buttons & active states
    $('#pos-tier-lite, #pos-tier-premium').removeClass('active');
    if (posTier === 'Lite') {
        $('#pos-tier-lite').addClass('active');
    } else {
        $('#pos-tier-premium').addClass('active');
    }

    // Badge on Premium tab
    var premiumPlan = getDbPlan('POS', 'Premium');
    var badgeText = (premiumPlan && premiumPlan.badgeText) ? premiumPlan.badgeText : 'Most Recommended';
    $('#pos-badge-recommended').text(badgeText);

    // Description
    var desc = plan && plan.description ? plan.description : 'Everything a single-outlet restaurant needs to start billing today.';
    $('#pos-desc').text(desc);

    // Pricing
    var priceVal = 10;
    var periodVal = ' / Month';

    if (globalCycle === 'Monthly') {
        if (posTier === 'Lite') {
            priceVal = plan ? (plan.monthlyPrice || plan.price) : 10;
        } else {
            priceVal = plan ? (plan.monthlyPrice || plan.price) : 30;
        }
        periodVal = ' / Month';
    } else {
        if (posTier === 'Lite') {
            priceVal = plan ? (plan.yearlyPrice || plan.price) : 10;
            periodVal = ' / Month billed annually';
        } else {
            priceVal = plan ? (plan.yearlyPrice || plan.price) : 25;
            periodVal = ' / Month billed annually';
        }
    }
    $('#pos-price-val').text('$' + Number(priceVal).toFixed(0));
    $('#pos-period-val').text(periodVal);

    // CTA & Learn More
    if (plan && plan.ctaText) $('#pos-cta-btn').text(plan.ctaText);
    if (plan && plan.learnMoreUrl) $('#pos-learn-more').attr('href', plan.learnMoreUrl);

    // Features List
    var featData = getDbFeaturesGrouped('POS', posTier);
    if (!featData) {
        featData = posTier === 'Lite' ? fallbackFeatures.posLite : fallbackFeatures.posPremium;
    }

    var html = '';
    if (featData && featData.groups) {
        featData.groups.forEach(function (g) {
            html += '<li class="group-label">' + g.title + '</li>';
            g.items.forEach(function (item) {
                html += '<li><i class="check-icon"></i> ' + item + '</li>';
            });
        });
    }
    $('#pos-feature-list').html(html);
}

/**
 * 2. Renders Growth Card
 */
function renderGrowthCard() {
    var plan = getDbPlan('Growth', 'Growth');

    // Title & Badge
    if (plan && plan.planName) $('#growth-title').text(plan.planName);
    if (plan && plan.badgeText) $('#growth-badge').text(plan.badgeText);

    // Pricing
    var struckPrice = (plan && plan.originalPrice > 0) ? plan.originalPrice : 1899;
    var priceVal = plan ? (plan.yearlyPrice || plan.price || 600) : 600;
    $('#growth-price-struck').text('$' + Number(struckPrice).toLocaleString());
    $('#growth-price-val').text('$' + Number(priceVal).toLocaleString());
    $('#growth-price-period').text('/ Year');

    // Subtitle & notes
    if (plan && plan.tagline) $('#growth-subtitle').text(plan.tagline);

    // CTA Button logic (Only enabled in Yearly mode)
    if (globalCycle === 'Monthly') {
        $('#growth-cta-box').html(
            '<button type="button" class="btn-growth-disabled" id="growth-cta-btn" disabled>' +
            (plan && plan.ctaText ? plan.ctaText : 'Start 14 Day Free Trial') +
            '</button>'
        );
        $('#growth-yearly-note').css('visibility', 'visible');
    } else {
        $('#growth-cta-box').html(
            '<button type="button" class="btn-growth-gradient" id="growth-cta-btn" onclick="selectAndNavigatePlan(\'Growth\')">' +
            (plan && plan.ctaText ? plan.ctaText : 'Start 14 Day Free Trial') +
            '</button>'
        );
        $('#growth-yearly-note').css('visibility', 'hidden');
    }

    // Bundled Features List with values
    var growthFeatures = [];
    if (dbData.features && dbData.features.length) {
        growthFeatures = dbData.features.filter(function (f) {
            return (f.planType || '').toLowerCase() === 'growth';
        }).map(function (f) {
            return { name: f.featureName, value: Number(f.featureValue || 0) };
        });
    }

    if (!growthFeatures.length) {
        growthFeatures = fallbackFeatures.growthBundles;
    }

    var totalVal = 0;
    var bundleHtml = '';
    growthFeatures.forEach(function (b) {
        totalVal += Number(b.value || 0);
        bundleHtml += '<div class="bundle-row"><span>' + b.name + '</span><span class="badge-value">Value: $' + Number(b.value).toFixed(0) + '</span></div>';
    });
    $('#growth-bundled-wrapper').html(bundleHtml);

    // Total Value & Savings banner calculation
    var calculatedTotal = totalVal > 0 ? totalVal : struckPrice;
    var savingsAmount = calculatedTotal - priceVal;
    $('#growth-total-value').text('TOTAL VALUE: $' + Number(calculatedTotal).toLocaleString());
    $('#growth-savings').html('<div class="savings-title">You save with Growth Plan</div><div class="savings-amount">$' + Number(savingsAmount).toLocaleString() + '</div>');
}

/**
 * 3. Renders Online Ordering Card
 */
function renderOrderingCard() {
    var plan = getDbPlan('Ordering', orderingTier);

    // Title
    if (plan && plan.planName) {
        var cleanTitle = plan.planName.split(' - ')[0];
        $('#ordering-plan-title').text(cleanTitle || 'Online Ordering Plan');
    }

    // Tiers buttons & active states
    $('#ordering-tier-fix, #ordering-tier-commission').removeClass('active');
    if (orderingTier === 'Fix') {
        $('#ordering-tier-fix').addClass('active');
    } else {
        $('#ordering-tier-commission').addClass('active');
    }

    // Description
    var desc = 'Predictable cost, unlimited orders.';
    if (orderingTier === 'Commission') {
        desc = plan && plan.description ? plan.description : 'Lifetime plan • One-time payment';
    } else {
        desc = plan && plan.description ? plan.description : 'Predictable cost, unlimited orders.';
    }
    $('#ordering-desc').html(desc);

    // Pricing
    if (orderingTier === 'Fix') {
        if (globalCycle === 'Monthly') {
            var price = plan ? (plan.monthlyPrice || plan.price) : 30;
            $('#ordering-price-val').text('$' + Number(price).toFixed(0));
            $('#ordering-period-val').text(' / Month');
        } else {
            var price = plan ? (plan.yearlyPrice || 25) : 25;
            $('#ordering-price-val').text('$' + Number(price).toFixed(0));
            $('#ordering-period-val').text(' / Month billed annually');
        }
    } else {
        var price = plan ? (plan.oneTimePrice || plan.price || 99) : 99;
        $('#ordering-price-val').text('$' + Number(price).toFixed(0));
        $('#ordering-period-val').text(' / One Time');
    }

    // CTA & Learn More
    if (plan && plan.ctaText) $('#ordering-cta-btn').text(plan.ctaText);
    if (plan && plan.learnMoreUrl) $('#ordering-learn-more').attr('href', plan.learnMoreUrl);

    // Features List
    var featData = getDbFeaturesGrouped('Ordering', orderingTier);
    var list = [];
    if (featData && Array.isArray(featData)) {
        list = featData;
    } else if (featData && featData.groups) {
        featData.groups.forEach(function (g) { list = list.concat(g.items); });
    } else {
        list = orderingTier === 'Fix' ? fallbackFeatures.orderingFix : fallbackFeatures.orderingCommission;
    }

    var html = '';
    list.forEach(function (item) {
        html += '<li><i class="check-icon"></i> ' + item + '</li>';
    });
    $('#ordering-feature-list').html(html);
}

/**
 * Handles global billing cycle switch (Monthly / Yearly).
 */
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
    renderAll();
}

/**
 * Handles POS tier switch (Lite / Premium).
 */
function selectPosTier(tier) {
    posTier = tier;
    renderPosCard();
}

/**
 * Handles Ordering tier switch (Fix / Commission).
 */
function selectOrderingTier(tier) {
    orderingTier = tier;
    renderOrderingCard();
}

/**
 * Navigates to AddOns/Checkout flow based on selected plan.
 */
function selectAndNavigatePlan(planType) {
    sessionStorage.setItem('selected_cycle', globalCycle);
    sessionStorage.setItem('selected_plan_type', planType);
    sessionStorage.setItem('selected_pos_tier', posTier);
    sessionStorage.setItem('selected_ordering_tier', orderingTier);

    var targetPlan = getDbPlan(planType, planType === 'POS' ? posTier : (planType === 'Ordering' ? orderingTier : 'Growth'));
    var planId = targetPlan ? targetPlan.planId : (planType === 'Growth' ? 3 : (planType === 'Ordering' ? 4 : 1));

    if (planType === 'Growth') {
        window.location.href = '/Subscription/GrowthAddOns?planId=' + planId;
    } else if (planType === 'Ordering') {
        window.location.href = '/Subscription/PosAddOns?planId=' + planId;
    } else {
        window.location.href = '/Subscription/PosAddOns?planId=' + planId;
    }
}
