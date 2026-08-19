var screen2Cycle = sessionStorage.getItem('selected_cycle') || 'Monthly';
var screen2PlanType = sessionStorage.getItem('selected_plan_type') || 'POS';
var posTierSelected = sessionStorage.getItem('selected_pos_tier') || 'Lite';
var orderingTierSelected = sessionStorage.getItem('selected_ordering_tier') || 'Fix';
var isGrowth = false;
var addedAddonsMap = {};
var kdsQty = 0;
var tileOrderingTier = 'Fix';
var tilePosTier = 'Lite';
var apiAddons = null;

function fmtMoney(n) {
    if (Math.abs(n - Math.round(n)) < 0.001) return '$' + Math.round(n);
    return '$' + n.toFixed(2).replace(/0$/, '').replace(/\.$/, '');
}

function catalog() {
    return [
        { id: 'oo', name: 'Online Ordering Plan', growthName: 'Online Ordering Fix Plan', desc: 'Predictable cost, unlimited orders.', img: '/Content/images/addons/online_ordering.jpg', monthly: 30, yearlyMo: 25, yearly: 300, hero: 'oo', growth: 300 },
        { id: 'pos', name: 'POS (Point of Sale) Plan', growthName: 'POS Premium Plan', desc: 'Manage billing, inventory, and operations from one powerful POS', img: '/Content/images/addons/online_ordering.jpg', monthlyLite: 10, monthlyPrem: 30, yearlyMoLite: 10, yearlyMoPrem: 25, yearly: 300, hero: 'pos', growth: 300 },
        { id: 'qr', name: 'Qr Digital Menu', desc: 'Contactless digital menu for tables & takeaway', img: '/Content/images/addons/qr_menu.jpg', monthly: 29, yearlyMo: 6.58, yearly: 79, growth: 79 },
        { id: 'kds', name: 'KDS (Kitchen Display System)', desc: 'Kitchen Display System for smooth kitchen ops', img: '/Content/images/addons/kds.jpg', monthly: 20, yearlyMo: 12.5, yearly: 150, stepper: true, growth: 150 },
        { id: 'table', name: 'Table Reservation', desc: 'Accept reservations and manage tables effortlessly.', img: '/Content/images/addons/table_reservation.jpg', monthly: 9, yearlyMo: 8.25, yearly: 99, growth: 99 },
        { id: 'happy', name: 'Happy Hour', desc: 'Boost sales with scheduled discounts and time-based offers.', img: '/Content/images/addons/happy_hour.jpg', monthly: 20.83, yearlyMo: 20.83, yearly: 250, yearlyOnly: true, growth: 250 },
        { id: 'bio', name: 'Bio Link', desc: 'Share all your restaurant links from one branded page.', img: '/Content/images/addons/bio_link.jpg', monthly: 4.08, yearlyMo: 4.08, yearly: 49, yearlyOnly: true, growth: 49 },
        { id: 'menu', name: 'Additional Menu', desc: 'Create and manage multiple menus for every occasion.', img: '/Content/images/addons/additional_menu.jpg', monthly: 8.33, yearlyMo: 8.33, yearly: 100, yearlyOnly: true, growth: 100 },
        { id: 'snap', name: 'SnapDish', desc: 'Turn food photos into stunning, menu-ready images instantly.', img: '/Content/images/addons/snapdish.jpg', monthly: 8.33, yearlyMo: 8.33, yearly: 100, yearlyOnly: true, growth: 100 }
    ];
}

function visibleAddons() {
    var all = catalog();
    if (isGrowth) {
        return [
            all.find(function (a) { return a.id === 'oo'; }),
            all.find(function (a) { return a.id === 'pos'; }),
            all.find(function (a) { return a.id === 'qr'; }),
            all.find(function (a) { return a.id === 'table'; }),
            all.find(function (a) { return a.id === 'happy'; }),
            all.find(function (a) { return a.id === 'kds'; }),
            all.find(function (a) { return a.id === 'menu'; }),
            all.find(function (a) { return a.id === 'snap'; }),
            all.find(function (a) { return a.id === 'bio'; })
        ];
    }
    if (screen2PlanType === 'Ordering') {
        return all.filter(function (a) { return a.id !== 'oo'; });
    }
    return all.filter(function (a) { return a.id !== 'pos'; });
}

function cardPrice(addon) {
    if (isGrowth) return fmtMoney(addon.growth) + ' / Year';
    if (addon.id === 'oo') {
        if (tileOrderingTier === 'Commission') return '$99 / One Time';
        if (screen2Cycle === 'Monthly') return '$30 / Month';
        return '$25 / Month billed annually';
    }
    if (addon.id === 'pos') {
        if (screen2Cycle === 'Monthly') return (tilePosTier === 'Premium' ? '$30' : '$10') + ' / Month';
        return (tilePosTier === 'Premium' ? '$25' : '$10') + ' / Month billed annually';
    }
    if (screen2Cycle === 'Monthly' && !addon.yearlyOnly) {
        var suffix = addon.stepper ? ' / Month Per Terminal' : ' / Month';
        return fmtMoney(addon.monthly) + suffix;
    }
    return fmtMoney(addon.yearlyMo) + ' / Month billed annually';
}

function cartAmount(addon) {
    if (addon.id === 'oo') {
        if (tileOrderingTier === 'Commission') return 99;
        return screen2Cycle === 'Monthly' ? 30 : 300;
    }
    if (addon.id === 'pos') {
        if (tilePosTier === 'Premium') return screen2Cycle === 'Monthly' ? 30 : 300;
        return 10;
    }
    if (addon.stepper) {
        var unit = screen2Cycle === 'Monthly' ? addon.monthly : addon.yearly;
        return unit * kdsQty;
    }
    return screen2Cycle === 'Monthly' ? addon.monthly : addon.yearly;
}

function cartLabel(addon) {
    if (addon.id === 'oo' && tileOrderingTier === 'Commission') return fmtMoney(cartAmount(addon)) + ' / One Time';
    if (screen2Cycle === 'Monthly') {
        return fmtMoney(cartAmount(addon)) + ' / Month';
    }
    return fmtMoney(cartAmount(addon)) + ' / Year';
}

$(document).ready(function () {
    isGrowth = $('.addons-page').data('growth') === true || $('.addons-page').attr('data-growth') === 'true';
    tileOrderingTier = orderingTierSelected;
    tilePosTier = posTierSelected;

    fetchAddOnsFromApi();

    if (isGrowth) {
        screen2Cycle = 'Yearly';
        screen2PlanType = 'Growth';
        renderAddonsGrid();
        updateLiveCartPanel();
        return;
    }

    if (screen2Cycle === 'Yearly') {
        switchAddonsCycle('Yearly');
    } else {
        switchAddonsCycle('Monthly');
    }
});

function fetchAddOnsFromApi() {
    var fetcher = screen2Cycle === 'Yearly' ? ApiClient.getYearlyAddOns() : ApiClient.getMonthlyAddOns();
    fetcher
        .done(function (data) {
            console.log('[AddOns] Loaded from API (' + screen2Cycle + '):', data);
            apiAddons = data;
        })
        .fail(function () {
            console.warn('[AddOns] API call failed, using local catalog');
        });

    if (isGrowth) {
        ApiClient.getGrowthPlanFeatures()
            .done(function (features) {
                console.log('[AddOns] Growth features from API:', features);
            });
    }
}

function switchAddonsCycle(cycle) {
    if (isGrowth) return;
    screen2Cycle = cycle;
    $('.btn-toggle-cycle').removeClass('active');
    if (cycle === 'Monthly') {
        $('#addons-toggle-monthly').addClass('active');
        Object.keys(addedAddonsMap).forEach(function (id) {
            var item = catalog().find(function (a) { return a.id === id; });
            if (item && item.yearlyOnly) delete addedAddonsMap[id];
        });
    } else {
        $('#addons-toggle-yearly').addClass('active');
    }
    fetchAddOnsFromApi();
    renderAddonsGrid();
    updateLiveCartPanel();
}

function renderAddonsGrid() {
    var grid = $('#addons-grid');
    grid.empty();
    var isMonthly = screen2Cycle === 'Monthly';

    visibleAddons().forEach(function (addon) {
        if (!addon) return;
        var isAdded = addedAddonsMap[addon.id] !== undefined;
        var yearlyLocked = isMonthly && addon.yearlyOnly && !isGrowth;
        var extra = '';

        if (addon.hero === 'oo' && !isGrowth) {
            extra += '<div class="internal-toggle-box">' +
                '<button type="button" class="btn-internal-toggle' + (tileOrderingTier === 'Fix' ? ' active' : '') + '" onclick="selectTileOrdering(\'Fix\')">Fix Plan</button>' +
                '<button type="button" class="btn-internal-toggle' + (tileOrderingTier === 'Commission' ? ' active' : '') + '" onclick="selectTileOrdering(\'Commission\')">Commission Plan</button>' +
                '</div>';
            if (tileOrderingTier === 'Commission') {
                extra += '<div class="addon-commission">1.8% Order Commission | $1 Platform Fee</div>';
            }
        }
        if (addon.hero === 'pos' && !isGrowth) {
            extra += '<div class="internal-toggle-box">' +
                '<button type="button" class="btn-internal-toggle' + (tilePosTier === 'Lite' ? ' active' : '') + '" onclick="selectTilePos(\'Lite\')">Lite Plan</button>' +
                '<button type="button" class="btn-internal-toggle' + (tilePosTier === 'Premium' ? ' active' : '') + '" onclick="selectTilePos(\'Premium\')">Premium Plan</button>' +
                '</div>';
        }

        var actionHtml = '';
        if (isGrowth) {
            actionHtml = '<button type="button" class="btn-include-growth">Include in Growth Plan</button>';
        } else if (yearlyLocked) {
            actionHtml = '<button type="button" class="btn-add-tile" disabled>+ Add</button>' +
                '<div class="disabled-yearly-note">This Add-Ons Available on Yearly Plan</div>';
        } else if (addon.stepper) {
            actionHtml = '<div class="qty-stepper-box">' +
                '<button type="button" class="btn-stepper" onclick="stepKdsQty(-1)">&#8722;</button>' +
                '<input type="text" class="input-stepper-val" value="' + kdsQty + '" readonly />' +
                '<button type="button" class="btn-stepper" onclick="stepKdsQty(1)">+</button>' +
                '</div>';
        } else {
            actionHtml = '<button type="button" class="btn-add-tile' + (isAdded ? ' added' : '') + '" onclick="toggleAddonItem(\'' + addon.id + '\')">' +
                (isAdded ? '<i class="fa-solid fa-check"></i> Added' : '+ Add') + '</button>';
        }

        var title = isGrowth ? (addon.growthName || addon.name) : addon.name;
        grid.append(
            '<div class="addon-card-tile">' +
                '<img src="' + addon.img + '" class="addon-mock-img" alt="' + title + '" onerror="this.style.background=\'#e5e7eb\'" />' +
                '<div class="addon-tile-body">' +
                    '<h5 class="addon-tile-title">' + title + '</h5>' +
                    extra +
                    '<p class="addon-tile-desc">' + addon.desc + '</p>' +
                    '<div class="addon-tile-price">' + cardPrice(addon) + '</div>' +
                    actionHtml +
                '</div>' +
            '</div>'
        );
    });
}

function selectTileOrdering(tier) {
    tileOrderingTier = tier;
    if (addedAddonsMap.oo) syncAddon('oo');
    renderAddonsGrid();
    updateLiveCartPanel();
}

function selectTilePos(tier) {
    tilePosTier = tier;
    if (addedAddonsMap.pos) syncAddon('pos');
    renderAddonsGrid();
    updateLiveCartPanel();
}

function syncAddon(id) {
    var addon = catalog().find(function (a) { return a.id === id; });
    addedAddonsMap[id] = { name: addon.name, price: cartAmount(addon), label: cartLabel(addon) };
}

function stepKdsQty(delta) {
    kdsQty += delta;
    if (kdsQty < 0) kdsQty = 0;
    if (kdsQty > 20) kdsQty = 20;
    if (kdsQty > 0) {
        var addon = catalog().find(function (a) { return a.id === 'kds'; });
        addedAddonsMap.kds = { name: 'KDS (' + kdsQty + ' Terminal' + (kdsQty > 1 ? 's' : '') + ')', price: cartAmount(addon), label: cartLabel(addon) };
    } else {
        delete addedAddonsMap.kds;
    }
    renderAddonsGrid();
    updateLiveCartPanel();
}

function toggleAddonItem(id) {
    if (addedAddonsMap[id]) {
        delete addedAddonsMap[id];
    } else {
        syncAddon(id);
    }
    renderAddonsGrid();
    updateLiveCartPanel();
}

function basePlan() {
    if (isGrowth || screen2PlanType === 'Growth') {
        return { title: 'Growth Plan', sub: '', price: 600, label: '$600 / Year' };
    }
    if (screen2PlanType === 'Ordering') {
        if (orderingTierSelected === 'Commission') {
            return { title: 'Online Ordering Plan', sub: '1.8% Order Commission | $1 Platform Fee', price: 99, label: '$99 / One Time' };
        }
        if (screen2Cycle === 'Monthly') {
            return { title: 'Online Ordering Plan', sub: '', price: 300, label: '$300 / Month' };
        }
        return { title: 'Online Ordering Plan', sub: '', price: 300, label: '$300 / Year' };
    }
    var isPrem = posTierSelected === 'Premium';
    if (screen2Cycle === 'Monthly') {
        return {
            title: isPrem ? 'POS Premium Plan' : 'POS Lite Plan',
            sub: 'iOS, Android, Windows',
            price: isPrem ? 30 : 10,
            label: (isPrem ? '$30' : '$10') + ' / Month'
        };
    }
    return {
        title: isPrem ? 'POS Premium Plan' : 'POS Lite Plan',
        sub: 'iOS, Android, Windows',
        price: isPrem ? 300 : 10,
        label: isPrem ? '$300 / Year' : '$10 / Month'
    };
}

function updateLiveCartPanel() {
    var base = basePlan();
    $('#cart-base-plan-title').text(base.title);
    $('#cart-base-plan-sub').text(base.sub);
    $('#cart-base-plan-price').text(base.label);

    var list = $('#cart-addons-list');
    list.empty();
    var addonsTotal = 0;

    if (isGrowth) {
        visibleAddons().forEach(function (addon) {
            if (!addon) return;
            list.append(
                '<div class="cart-line-item"><span class="cart-item-name" style="font-weight:500;color:#6b7280;">' +
                (addon.growthName || addon.name) + '</span><span class="cart-item-price">' +
                fmtMoney(addon.growth) + ' / Year</span></div>'
            );
        });
        $('#cart-total-value').show().text('Total Value: $1,427');
        $('#cart-next-billing-total').text('$600');
        return;
    }

    $('#cart-total-value').hide();
    Object.keys(addedAddonsMap).forEach(function (key) {
        var item = addedAddonsMap[key];
        addonsTotal += item.price;
        list.append(
            '<div class="cart-line-item"><span class="cart-item-name" style="font-weight:500;">' +
            item.name + '</span><span class="cart-item-price">' + item.label + '</span></div>'
        );
    });

    var running = base.price + addonsTotal;
    $('#cart-next-billing-total').text(fmtMoney(running));
}
