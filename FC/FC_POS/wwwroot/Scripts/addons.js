var screen2Cycle = sessionStorage.getItem('selected_cycle') || 'Monthly';
var screen2PlanType = sessionStorage.getItem('selected_plan_type') || 'POS';
var posTierSelected = sessionStorage.getItem('selected_pos_tier') || 'Lite';
var orderingTierSelected = sessionStorage.getItem('selected_ordering_tier') || 'Fix';
var isGrowth = false;
var addedAddonsMap = {};
var kdsQty = 0;
var tileOrderingTier = 'Fix';
var tilePosTier = 'Lite';
var apiAddons = [];

var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtMoney(n) {
    if (Math.abs(n - Math.round(n)) < 0.001) return '$' + Math.round(n);
    var s = n.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
    return '$' + s;
}

function catalog() {
    var localCatalog = [
        { id: 'oo', name: 'Online Ordering Plan', growthName: 'Online Ordering Fix Plan', desc: 'Predictable cost, unlimited orders.', img: '/Content/images/addons/online_ordering.png', monthly: 30, yearlyMo: 25, yearly: 300, hero: 'oo', growth: 300 },
        { id: 'pos', name: 'POS (Point of Sale) Plan', growthName: 'POS Premium Plan', desc: 'Manage billing, inventory, and operations from one powerful POS', img: '/Content/images/addons/premium_pos_plan.png', monthlyLite: 10, monthlyPrem: 30, yearlyMoLite: 10, yearlyMoPrem: 25, yearly: 300, hero: 'pos', growth: 300 },
        { id: 'qr', name: 'Qr Digital Menu', desc: 'Contactless digital menu for tables & takeaway', img: '/Content/images/addons/qr_menu.png', monthly: 29, yearlyMo: 6.58, yearly: 79, growth: 79 },
        { id: 'kds', name: 'KDS (Kitchen Display System)', desc: 'Kitchen Display System for smooth kitchen ops', img: '/Content/images/addons/kds.png', monthly: 20, yearlyMo: 12.5, yearly: 150, stepper: true, growth: 150 },
        { id: 'table', name: 'Table Reservation', desc: 'Accept reservations and manage tables effortlessly.', img: '/Content/images/addons/table_reservation.png', monthly: 9, yearlyMo: 8.25, yearly: 99, growth: 99 },
        { id: 'happy', name: 'Happy Hour', desc: 'Boost sales with scheduled discounts and time-based offers.', img: '/Content/images/addons/happy_hour.png', monthly: 20.83, yearlyMo: 20.83, yearly: 250, yearlyOnly: true, growth: 250 },
        { id: 'bio', name: 'Bio Link', desc: 'Share all your restaurant links from one branded page.', img: '/Content/images/addons/bio_link.png', monthly: 4.08, yearlyMo: 4.08, yearly: 49, yearlyOnly: true, growth: 49 },
        { id: 'menu', name: 'Additional Menu', desc: 'Create and manage multiple menus for every occasion.', img: '/Content/images/addons/additional_menu.png', monthly: 8.33, yearlyMo: 8.33, yearly: 100, yearlyOnly: true, growth: 100 },
        { id: 'snap', name: 'SnapDish', desc: 'Turn food photos into stunning, menu-ready images instantly.', img: '/Content/images/addons/snapdish.png', monthly: 8.33, yearlyMo: 8.33, yearly: 100, yearlyOnly: true, growth: 100 }
    ];

    apiAddons.forEach(function (apiAddon) {
        var localAddon = localCatalog.find(function (addon) {
            return addon.name.toLowerCase().indexOf((apiAddon.addOnName || '').toLowerCase()) !== -1 ||
                (apiAddon.addOnName || '').toLowerCase().indexOf(addon.name.toLowerCase()) !== -1;
        });
        if (!localAddon) return;
        localAddon.name = apiAddon.addOnName || localAddon.name;
        localAddon.desc = apiAddon.description || localAddon.desc;
        localAddon.img = localAddon.img;
        localAddon.monthly = Number(apiAddon.monthlyPrice || localAddon.monthly);
        localAddon.yearly = Number(apiAddon.yearlyPrice || localAddon.yearly);
        localAddon.yearlyMo = localAddon.yearly / 12;
        localAddon.growth = Number(apiAddon.yearlyPrice || localAddon.growth);
    });
    return localCatalog;
}

function loadAddonsFromApi() {
    $.when(ApiClient.getMonthlyAddOns(), ApiClient.getYearlyAddOns())
        .done(function (monthlyResult, yearlyResult) {
            apiAddons = (monthlyResult[0] || []).concat(yearlyResult[0] || [])
                .filter(function (addon, index, all) {
                    return all.findIndex(function (item) { return item.addOnId === addon.addOnId; }) === index;
                });
            renderAddonsGrid();
            updateLiveSelectionPanel();
            $('#addons-api-status').text(apiAddons.length + ' add-ons loaded from API');
        });
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

function selectionAmount(addon) {
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

function selectionLabel(addon) {
    if (addon.id === 'oo' && tileOrderingTier === 'Commission') return fmtMoney(selectionAmount(addon)) + ' / One Time';
    if (screen2Cycle === 'Monthly') {
        return fmtMoney(selectionAmount(addon)) + (addon.stepper ? ' / Month' : ' / Month');
    }
    return fmtMoney(selectionAmount(addon)) + ' / Year';
}

$(document).ready(function () {
    isGrowth = $('.addons-page').data('growth') === true || $('.addons-page').attr('data-growth') === 'true';
    tileOrderingTier = orderingTierSelected;
    tilePosTier = posTierSelected;

    // Remember which plan is being purchased so the payment modal's
    // subscription-creation call (checkout.js) targets the right plan
    // instead of always defaulting to plan id 1.
    var currentPlanId = $('.addons-page').data('plan-id');
    if (currentPlanId) {
        sessionStorage.setItem('selected_plan_id', String(currentPlanId));
    }

    if (isGrowth) {
        screen2Cycle = 'Yearly';
        screen2PlanType = 'Growth';
        renderAddonsGrid();
        updateLiveSelectionPanel();
        loadAddonsFromApi();
        return;
    }

    if (screen2Cycle === 'Yearly') {
        switchAddonsCycle('Yearly');
    } else {
        switchAddonsCycle('Monthly');
    }
    loadAddonsFromApi();
});

function switchAddonsCycle(cycle) {
    if (isGrowth) return;
    screen2Cycle = cycle;
    $('.billing-option').removeClass('active');
    $('#addons-cycle-switch').toggleClass('yearly-selected', cycle === 'Yearly');
    if (cycle === 'Monthly') {
        $('#addons-toggle-monthly').addClass('active');
        $('#addons-toggle-monthly input').prop('checked', true);
        Object.keys(addedAddonsMap).forEach(function (id) {
            var item = catalog().find(function (a) { return a.id === id; });
            if (item && item.yearlyOnly) delete addedAddonsMap[id];
        });
    } else {
        $('#addons-toggle-yearly').addClass('active');
        $('#addons-toggle-yearly input').prop('checked', true);
    }
    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function renderAddonsGrid() {
    var grid = $('#addons-grid');
    grid.empty();
    var isMonthly = screen2Cycle === 'Monthly';

    visibleAddons().forEach(function (addon) {
        if (!addon) return;
        var addonQuantity = addedAddonsMap[addon.id] ? addedAddonsMap[addon.id].quantity : 0;
        var addonSelected = addedAddonsMap[addon.id] !== undefined;
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
            var isGrowthIncluded = addedAddonsMap[addon.id] !== undefined;
            actionHtml = '<button type="button" class="btn-include-growth' + (isGrowthIncluded ? ' included' : '') + '" ' +
                'onclick="toggleGrowthAddon(\'' + addon.id + '\')">' +
                (isGrowthIncluded ? 'Included in Growth Plan' : 'Include in Growth Plan') + '</button>';
        } else if (yearlyLocked) {
            actionHtml = '<button type="button" class="btn-add-tile" disabled>+ Add</button>' +
                '<div class="disabled-yearly-note">This Add-Ons Available on Yearly Plan</div>';
        } else if (addon.stepper && kdsQty === 0) {
            actionHtml = '<button type="button" class="btn-add-tile" onclick="stepKdsQty(1)">+ Add</button>';
        } else if (addon.stepper) {
            actionHtml = '<div class="qty-stepper-box">' +
                '<button type="button" class="btn-stepper" onclick="stepKdsQty(-1)">-</button>' +
                '<input type="text" class="input-stepper-val" value="' + kdsQty + '" readonly />' +
                '<button type="button" class="btn-stepper" onclick="stepKdsQty(1)">+</button>' +
                '</div>';
        } else {
            actionHtml = addonQuantity === 0
                ? '<button type="button" class="btn-add-tile" onclick="changeAddonQuantity(\'' + addon.id + '\', 1)">+ Add</button>'
                : '<div class="classic-add-counter" aria-label="Select ' + titleForAddon(addon) + ' quantity">' +
                  '<button type="button" class="counter-button" onclick="changeAddonQuantity(\'' + addon.id + '\', -1)" aria-label="Decrease quantity">-</button>' +
                  '<span class="counter-value">' + addonQuantity + '</span>' +
                  '<button type="button" class="counter-button" onclick="changeAddonQuantity(\'' + addon.id + '\', 1)" aria-label="Increase quantity">+</button>' +
                  '</div>';
        }

        var title = titleForAddon(addon);
        grid.append(
            '<div class="addon-card-tile' + (addonSelected ? ' selected' : '') + '">' +
                '<img src="' + addon.img + '" class="addon-mock-img" alt="' + title + '" />' +
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

function titleForAddon(addon) {
    return isGrowth ? (addon.growthName || addon.name) : addon.name;
}

function toggleGrowthAddon(id) {
    var addon = catalog().find(function (item) { return item.id === id; });
    if (!addon) return;

    if (addedAddonsMap[id]) {
        delete addedAddonsMap[id];
    } else {
        addedAddonsMap[id] = {
            name: titleForAddon(addon),
            quantity: 1,
            price: Number(addon.growth || 0),
            label: 'Value: ' + fmtMoney(Number(addon.growth || 0))
        };
    }

    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function selectTileOrdering(tier) {
    tileOrderingTier = tier;
    if (addedAddonsMap.oo) syncAddon('oo');
    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function selectTilePos(tier) {
    tilePosTier = tier;
    if (addedAddonsMap.pos) syncAddon('pos');
    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function syncAddon(id) {
    var addon = catalog().find(function (a) { return a.id === id; });
    var quantity = addedAddonsMap[id] ? addedAddonsMap[id].quantity || 1 : 1;
    addedAddonsMap[id] = { name: addon.name, quantity: quantity, price: selectionAmount(addon) * quantity, label: selectionLabel(addon) + ' x' + quantity };
}

function stepKdsQty(delta) {
    kdsQty += delta;
    if (kdsQty < 0) kdsQty = 0;
    if (kdsQty > 20) kdsQty = 20;
    if (kdsQty > 0) {
        var addon = catalog().find(function (a) { return a.id === 'kds'; });
        addedAddonsMap.kds = { name: 'KDS (' + kdsQty + ' Terminal' + (kdsQty > 1 ? 's' : '') + ')', price: selectionAmount(addon), label: selectionLabel(addon) };
    } else {
        delete addedAddonsMap.kds;
    }
    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function toggleAddonItem(id) {
    if (addedAddonsMap[id]) {
        delete addedAddonsMap[id];
    } else {
        syncAddon(id);
    }
    renderAddonsGrid();
    updateLiveSelectionPanel();
}

function changeAddonQuantity(id, delta) {
    var addon = catalog().find(function (item) { return item.id === id; });
    if (!addon) return;

    var currentQuantity = addedAddonsMap[id] ? addedAddonsMap[id].quantity : 0;
    var nextQuantity = Math.max(0, Math.min(20, currentQuantity + delta));

    if (nextQuantity === 0) {
        delete addedAddonsMap[id];
    } else {
        addedAddonsMap[id] = {
            name: addon.name,
            quantity: nextQuantity,
            price: selectionAmount(addon) * nextQuantity,
            label: selectionLabel(addon) + ' x' + nextQuantity
        };
    }

    renderAddonsGrid();
    updateLiveSelectionPanel();
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
            return { title: 'Online Ordering Plan', sub: '', price: 30, label: '$30 / Month' };
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

function updateLiveSelectionPanel() {
    var base = basePlan();
    $('#selection-base-plan-title').text(base.title);
    $('#selection-base-plan-sub').text(base.sub);
    $('#selection-base-plan-price').text(base.label);

    var list = $('#selection-addons-list');
    list.empty();
    var addonsTotal = 0;

    if (isGrowth) {
        var growthValue = 0;
        Object.keys(addedAddonsMap).forEach(function (key) {
            var item = addedAddonsMap[key];
            growthValue += Number(item.price || 0);
            list.append(
                '<div class="selection-line-item"><span class="selection-item-name" style="font-weight:500;color:#6b7280;">' +
                item.name + '</span><span class="selection-item-price">' +
                item.label + '</span></div>'
            );
        });
        $('#selection-total-value').toggle(growthValue > 0).text('Total Value: ' + fmtMoney(growthValue));
        $('#selection-next-billing-total').text('$600');
        return;
    }

    $('#selection-total-value').hide();
    Object.keys(addedAddonsMap).forEach(function (key) {
        var item = addedAddonsMap[key];
        addonsTotal += item.price;
        list.append(
            '<div class="selection-line-item"><span class="selection-item-name" style="font-weight:500;">' +
            item.name + '</span><span class="selection-item-price">' + item.label + '</span></div>'
        );
    });

    var running = base.price + addonsTotal;
    $('#selection-next-billing-total').text(fmtMoney(running));
}
