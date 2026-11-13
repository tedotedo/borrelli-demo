/* ==========================================================================
   Borrelli Delicatessen — Set A Interactive Logic
   Counter Presets · Live Balance Meter · Lightbox · Micro-Toast · Owner Ticket
   Zero external network calls · Salumeria Platter & Hamper Pre-Order Sync
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'borrelli_counter_selection';
  var toastTimer = null;

  function showToast(msg) {
    var toast = document.getElementById('borrelli-toast');
    if (!toast || !msg) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function copyToClipboard(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () {
        fallbackCopy(text, onDone);
      });
    } else {
      fallbackCopy(text, onDone);
    }
  }

  function fallbackCopy(text, onDone) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      /* ignore */
    }
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  function closeNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    if (returnFocus) navToggle.focus();
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      siteNav.classList.toggle('is-open', !expanded);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        closeNav(true);
      }
    });

    document.addEventListener('click', function (e) {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !siteNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeNav(false);
      }
    });

    siteNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeNav(false);
      });
    });
  }

  /* 2. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('borrelli-lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lbImg = document.getElementById('lightbox-img');
    var lbTitle = document.getElementById('lightbox-title');
    var lbCaption = document.getElementById('lightbox-caption');
    var lbCta = document.getElementById('lightbox-cta');
    var lbClose = lightbox.querySelector('[data-lightbox-close]');
    var lastTrigger = null;

    document.querySelectorAll('[data-lightbox-src]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        lastTrigger = btn;
        if (lbImg) {
          lbImg.src = btn.getAttribute('data-lightbox-src') || '';
          lbImg.alt = btn.getAttribute('data-lightbox-alt') || '';
        }
        if (lbTitle) lbTitle.textContent = btn.getAttribute('data-lightbox-title') || 'Borrelli Delicatessen';
        if (lbCaption) lbCaption.textContent = btn.getAttribute('data-lightbox-caption') || '';
        if (lbCta) {
          lbCta.setAttribute('href', btn.getAttribute('data-lightbox-cta-href') || 'orders-bookings.html');
          lbCta.textContent = btn.getAttribute('data-lightbox-cta-label') || 'Order or Book →';
        }
        lightbox.showModal();
      });
    });

    if (lbClose) {
      lbClose.addEventListener('click', function () {
        lightbox.close();
      });
    }

    if (lbCta) {
      lbCta.addEventListener('click', function () {
        lightbox.close();
      });
    }

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        lightbox.close();
      }
    });

    lightbox.addEventListener('close', function () {
      if (lastTrigger && typeof lastTrigger.focus === 'function') {
        lastTrigger.focus();
      }
    });
  }

  /* 3. Accessible Tab Switchers (Menu/Deli & Dual Booking/Order Forms) */
  var tablists = document.querySelectorAll('[role="tablist"]');
  var tabActivators = {};

  tablists.forEach(function (tablist) {
    var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));

    function activateTab(targetTab, moveFocus) {
      tabs.forEach(function (tab) {
        var isSelected = tab === targetTab;
        var panelId = tab.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;

        tab.setAttribute('aria-selected', String(isSelected));
        tab.setAttribute('tabindex', isSelected ? '0' : '-1');

        if (panel) {
          panel.hidden = !isSelected;
        }
      });

      if (moveFocus) {
        targetTab.focus();
      }
    }

    tabs.forEach(function (tab, index) {
      tabActivators[tab.id] = function () {
        activateTab(tab, false);
      };

      tab.addEventListener('click', function () {
        activateTab(tab, false);
      });

      tab.addEventListener('keydown', function (e) {
        var nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          nextIndex = (index + 1) % tabs.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (e.key === 'Home') {
          nextIndex = 0;
        } else if (e.key === 'End') {
          nextIndex = tabs.length - 1;
        }

        if (nextIndex !== null) {
          e.preventDefault();
          activateTab(tabs[nextIndex], true);
        }
      });
    });

    function syncFromUrl() {
      var hash = window.location.hash ? window.location.hash.slice(1) : '';
      var isPreorderQuery = false;
      var isFridayQuery = false;
      try {
        var sp = new URLSearchParams(window.location.search);
        isPreorderQuery = sp.get('preorder') === '1';
        isFridayQuery = Boolean(sp.get('friday_party'));
      } catch (err) {
        /* ignore */
      }

      tabs.forEach(function (tab) {
        var panelId = tab.getAttribute('aria-controls');
        var dataHash = tab.getAttribute('data-hash');
        if (
          hash === panelId ||
          hash === dataHash ||
          hash === tab.id ||
          (isPreorderQuery && panelId === 'panel-preorder') ||
          (isFridayQuery && panelId === 'panel-antipasto')
        ) {
          activateTab(tab, false);
        }
      });
    }

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
  });

  /* 4. Interactive Counter Builder + 1-Tap Presets + Live Counter Balance Meter */
  var builders = document.querySelectorAll('[data-counter-builder]');

  function loadSavedSelection() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (err) {
      /* ignore */
    }
    return null;
  }

  function saveSelection(data) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      /* ignore */
    }
  }

  builders.forEach(function (builder) {
    var formatRadios = Array.prototype.slice.call(
      builder.querySelectorAll('input[type="radio"][data-builder-format]')
    );
    var itemChecks = Array.prototype.slice.call(
      builder.querySelectorAll('input[type="checkbox"][data-builder-item]')
    );
    var presetBtns = Array.prototype.slice.call(
      builder.querySelectorAll('[data-counter-preset]')
    );
    var statusText = builder.querySelector('[data-builder-status]');
    var itemsText = builder.querySelector('[data-builder-items-preview]');
    var sendLink = builder.querySelector('[data-send-preorder]');

    var segSalumi = builder.querySelector('[data-seg-salumi]');
    var segFormaggi = builder.querySelector('[data-seg-formaggi]');
    var segAntipasti = builder.querySelector('[data-seg-antipasti]');
    var pillSalumi = builder.querySelector('[data-pill-salumi]');
    var pillFormaggi = builder.querySelector('[data-pill-formaggi]');
    var pillAntipasti = builder.querySelector('[data-pill-antipasti]');
    var verdictEl = builder.querySelector('[data-balance-verdict]');
    var fridayModeActive = false;

    var existing = loadSavedSelection();
    if (existing && existing.format && Array.isArray(existing.items)) {
      formatRadios.forEach(function (r) {
        r.checked = r.value === existing.format;
      });
      itemChecks.forEach(function (c) {
        c.checked = existing.items.indexOf(c.value) !== -1;
      });
    }

    function updateBalanceMeter() {
      var sal = 0;
      var form = 0;
      var anti = 0;

      itemChecks.forEach(function (c) {
        if (!c.checked) return;
        var cat = c.getAttribute('data-category');
        if (cat === 'salumi') sal++;
        else if (cat === 'formaggi') form++;
        else anti++;
      });

      var total = sal + form + anti;
      var pSal = total ? Math.round((sal / total) * 100) : 0;
      var pForm = total ? Math.round((form / total) * 100) : 0;
      var pAnti = total ? Math.max(0, 100 - pSal - pForm) : 0;

      if (segSalumi) segSalumi.style.width = pSal + '%';
      if (segFormaggi) segFormaggi.style.width = pForm + '%';
      if (segAntipasti) segAntipasti.style.width = pAnti + '%';

      if (pillSalumi) {
        pillSalumi.innerHTML = '<span class="balance-pill__dot balance-pill__dot--salumi"></span> Salumi: ' + (sal ? '✓ Included' : 'Not ticked');
      }
      if (pillFormaggi) {
        pillFormaggi.innerHTML = '<span class="balance-pill__dot balance-pill__dot--formaggi"></span> Formaggi: ' + (form ? '✓ Included' : 'Not ticked');
      }
      if (pillAntipasti) {
        pillAntipasti.innerHTML = '<span class="balance-pill__dot balance-pill__dot--antipasti"></span> Antipasti &amp; Pantry: ' + anti + ' selected';
      }

      if (verdictEl) {
        if (sal > 0 && form > 0 && anti > 0) {
          verdictEl.textContent = 'Classic Salumeria Trio Balanced';
        } else if (total === 0) {
          verdictEl.textContent = 'Select counter favourites above';
        } else {
          verdictEl.textContent = 'Bespoke Mix · Add Salumi, Formaggi or Antipasti for a full trio';
        }
      }
    }

    function computeState() {
      var chosenFormat = 'Sharing Antipasto Board';
      formatRadios.forEach(function (r) {
        if (r.checked) chosenFormat = r.value;
      });

      var chosenItems = [];
      itemChecks.forEach(function (c) {
        if (c.checked) chosenItems.push(c.value);
      });

      updateBalanceMeter();

      var count = chosenItems.length;
      var noun = count === 1 ? '1 counter selection' : count + ' counter selections';

      if (statusText) {
        statusText.textContent = fridayModeActive
          ? 'Friday Antipasto Night Table for 4 · ' + noun
          : 'Your Counter Selection: ' + chosenFormat + ' · ' + noun;
      }

      if (itemsText) {
        itemsText.textContent = count > 0
          ? 'Included: ' + chosenItems.join(' · ')
          : 'Tick one or more counter favourites above to pre-fill your pre-order notes.';
      }

      if (sendLink) {
        if (fridayModeActive) {
          sendLink.textContent = 'Pull Friday Table Ticket for 4 →';
          sendLink.setAttribute('href', 'orders-bookings.html?friday_party=4#antipasto-booking');
        } else {
          sendLink.textContent = 'Send Selection to Counter Pre-Order →';
          var qs = new URLSearchParams();
          qs.set('preorder', '1');
          qs.set('format', chosenFormat);
          if (count > 0) {
            qs.set('items', chosenItems.join(', '));
          }
          sendLink.setAttribute('href', 'orders-bookings.html?' + qs.toString() + '#hamper-preorder');
        }
      }

      return { format: chosenFormat, items: chosenItems };
    }

    presetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-counter-preset');
        presetBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

        if (key === 'friday4') {
          fridayModeActive = true;
          formatRadios.forEach(function (r) { r.checked = r.value === 'Sharing Antipasto Board'; });
          itemChecks.forEach(function (c) {
            c.checked = /Salumi|Cheeses|Olives/i.test(c.value);
          });
          saveSelection(computeState());
          showToast('🍷 Preset ready: Friday Antipasto Night Table for 4');
        } else if (key === 'hamper') {
          fridayModeActive = false;
          formatRadios.forEach(function (r) { r.checked = r.value === 'Bespoke Gift Hamper'; });
          itemChecks.forEach(function (c) {
            c.checked = /Salumi|Cheeses|Pasta|Biscotti/i.test(c.value);
          });
          saveSelection(computeState());
          showToast('🧺 Preset applied: Bespoke Italian Gift Hamper');
        } else if (key === 'platter') {
          fridayModeActive = false;
          formatRadios.forEach(function (r) { r.checked = r.value === 'Sharing Antipasto Board'; });
          itemChecks.forEach(function (c) {
            c.checked = /Salumi|Cheeses|Olives/i.test(c.value);
          });
          saveSelection(computeState());
          showToast('🧀 Preset applied: Weekend Salumi & Formaggi Platter');
        }
      });
    });

    computeState();

    formatRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        fridayModeActive = false;
        presetBtns.forEach(function (b) { b.classList.remove('is-active'); });
        saveSelection(computeState());
      });
    });

    itemChecks.forEach(function (c) {
      c.addEventListener('change', function () {
        presetBtns.forEach(function (b) { b.classList.remove('is-active'); });
        saveSelection(computeState());
      });
    });

    if (sendLink) {
      sendLink.addEventListener('click', function () {
        saveSelection(computeState());
      });
    }
  });

  /* 5. Date Inputs, Upcoming Friday Helper Chips & Booking Page Presets */
  var now = new Date();
  var todayIso = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('-');

  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.getAttribute('min')) {
      input.setAttribute('min', todayIso);
    }
  });

  var fridayChipMount = document.querySelector('[data-friday-chips]');
  var fridayDateInput = document.getElementById('anti-date');
  var upcomingFridayIsos = [];

  if (fridayDateInput) {
    var cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var daysUntilFriday = (5 - cursor.getDay() + 7) % 7;
    cursor.setDate(cursor.getDate() + daysUntilFriday);

    var shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (var i = 0; i < 3; i++) {
      var d = new Date(cursor.getTime());
      d.setDate(cursor.getDate() + i * 7);
      var yyyy = d.getFullYear();
      var mm = String(d.getMonth() + 1).padStart(2, '0');
      var dd = String(d.getDate()).padStart(2, '0');
      var iso = yyyy + '-' + mm + '-' + dd;
      upcomingFridayIsos.push(iso);

      if (fridayChipMount) {
        var label = 'Fri ' + d.getDate() + ' ' + shortMonths[d.getMonth()];
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'friday-chip';
        btn.setAttribute('data-iso', iso);
        btn.textContent = label;
        btn.addEventListener('click', function (ev) {
          var chosen = ev.currentTarget.getAttribute('data-iso');
          fridayDateInput.value = chosen;
          fridayDateInput.dispatchEvent(new Event('change'));
        });
        fridayChipMount.appendChild(btn);
      }
    }
  }

  /* Pre-Populate Counter Pre-Order or Friday Preset on orders-bookings.html */
  var ordTier = document.getElementById('ord-tier');
  var ordDate = document.getElementById('ord-date');
  var ordNotes = document.getElementById('ord-notes');
  var antiParty = document.getElementById('anti-party');
  var antiTime = document.getElementById('anti-time');
  var antiNotes = document.getElementById('anti-notes');
  var prefillBanner = document.querySelector('[data-prefill-banner]');
  var prefillText = document.querySelector('[data-prefill-text]');
  var clearPrefillBtn = document.querySelector('[data-clear-prefill]');

  try {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('friday_party') === '4' && antiParty) {
      if (tabActivators['tab-antipasto']) tabActivators['tab-antipasto']();
      antiParty.value = '4 Guests';
      if (antiTime && !antiTime.value) antiTime.value = 'mid-friday';
      if (fridayDateInput && upcomingFridayIsos[0]) fridayDateInput.value = upcomingFridayIsos[0];
      if (antiNotes && !antiNotes.value.trim()) {
        antiNotes.value = 'Friday Piatto Di Antipasto Night table for 4 guests — classic salumi, formaggi & marinated antipasti boards.';
      }
    }
  } catch (err) {
    /* ignore */
  }

  if (ordTier && ordNotes) {
    var payload = null;

    try {
      var q = new URLSearchParams(window.location.search);
      if (q.get('format') || q.get('items')) {
        payload = {
          format: q.get('format') || 'Sharing Antipasto Board',
          items: q.get('items') ? q.get('items').split(', ').filter(Boolean) : []
        };
      }
    } catch (err) {
      /* ignore */
    }

    if (!payload) {
      payload = loadSavedSelection();
    }

    if (payload && (payload.format || (payload.items && payload.items.length))) {
      var isHamper = /hamper/i.test(payload.format || '');
      if (!ordTier.value) {
        ordTier.value = isHamper ? 'Classic Gift Hamper' : 'Sharing Platter (Entertaining)';
      }

      if (!ordNotes.value.trim()) {
        var itemLine = payload.items && payload.items.length
          ? 'Requested counter items: ' + payload.items.join(', ') + '.'
          : 'No specific counter items ticked yet.';
        ordNotes.value =
          'Counter Customiser (' + (payload.format || 'Custom Selection') + ') — ' +
          itemLine + ' ';
      }

      if (prefillBanner && prefillText) {
        var countLabel = payload.items ? payload.items.length : 0;
        prefillText.textContent =
          '✓ Loaded your Counter Customiser selection: ' +
          (payload.format || 'Custom Selection') +
          ' (' + countLabel + (countLabel === 1 ? ' item' : ' items') + ' pre-filled below).';
        prefillBanner.hidden = false;
      }
    }

    if (clearPrefillBtn) {
      clearPrefillBtn.addEventListener('click', function () {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (err) {
          /* ignore */
        }
        ordTier.value = '';
        ordNotes.value = '';
        if (prefillBanner) prefillBanner.hidden = true;
        ordTier.focus();
        showToast('↺ Cleared custom counter selection');
      });
    }
  }

  /* 1-Tap Presets on orders-bookings.html */
  var orderPresetBtns = Array.prototype.slice.call(document.querySelectorAll('[data-order-preset]'));
  orderPresetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-order-preset');
      orderPresetBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

      if (key === 'friday4') {
        if (tabActivators['tab-antipasto']) tabActivators['tab-antipasto']();
        if (fridayDateInput && upcomingFridayIsos[0]) fridayDateInput.value = upcomingFridayIsos[0];
        if (antiTime) antiTime.value = 'mid-friday';
        if (antiParty) antiParty.value = '4 Guests';
        if (antiNotes) {
          antiNotes.value = 'Friday Piatto Di Antipasto Night table for 4 — cured salumi, aged formaggi & marinated olives.';
        }
        showToast('🍷 Pre-filled Friday Antipasto Table for 4');
      } else if (key === 'hamper') {
        if (tabActivators['tab-preorder']) tabActivators['tab-preorder']();
        if (ordTier) ordTier.value = 'Luxury Wicker Hamper';
        if (ordDate && upcomingFridayIsos[0]) ordDate.value = upcomingFridayIsos[0];
        if (ordNotes) {
          ordNotes.value = 'Bespoke Italian Gift Hamper — extra-virgin olive oil, bronze-die pasta, aged cheeses, salumi & sweet cantucci biscotti.';
        }
        showToast('🧺 Pre-filled Bespoke Italian Gift Hamper');
      } else if (key === 'platter') {
        if (tabActivators['tab-preorder']) tabActivators['tab-preorder']();
        if (ordTier) ordTier.value = 'Sharing Platter (Entertaining)';
        if (ordDate && upcomingFridayIsos[0]) ordDate.value = upcomingFridayIsos[0];
        if (ordNotes) {
          ordNotes.value = 'Weekend Salumi & Formaggi Grazing Platter — sliced prosciutto, regional salame, aged Italian cheeses & Nocellara olives.';
        }
        showToast('🧀 Pre-filled Weekend Salumi & Formaggi Platter');
      }
    });
  });

  /* 6. Client-Side Validation & Live Digital Enquiry Ticket */
  var demoForms = document.querySelectorAll('[data-demo-form]');

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function validateField(field) {
    var errId = field.getAttribute('aria-describedby');
    var errEl = errId ? document.getElementById(errId) : null;
    var val = (field.value || '').trim();
    var msg = '';

    if (field.hasAttribute('required') && !val) {
      msg = field.getAttribute('data-error-empty') || 'Please complete this field.';
    } else if (val && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      msg = 'Please enter a valid email address.';
    }

    if (msg) {
      field.setAttribute('aria-invalid', 'true');
      if (errEl) {
        errEl.textContent = msg;
        errEl.hidden = false;
      }
      return false;
    } else {
      field.setAttribute('aria-invalid', 'false');
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      return true;
    }
  }

  demoForms.forEach(function (form) {
    var controls = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryBox = form.querySelector('[data-demo-summary]');
    var ticketMount = form.querySelector('[data-owner-ticket]');

    controls.forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateField(ctrl);
      });
      ctrl.addEventListener('change', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateField(ctrl);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      controls.forEach(function (ctrl) {
        var ok = validateField(ctrl);
        if (!ok && !firstBad) firstBad = ctrl;
      });

      if (firstBad) {
        if (statusBox) statusBox.hidden = true;
        firstBad.focus();
        return;
      }

      if (statusBox) {
        var nameInput = form.querySelector('[name="customer_name"]');
        var phoneInput = form.querySelector('[name="customer_phone"]');
        var emailInput = form.querySelector('[name="customer_email"]');
        var dateInput = form.querySelector('[name="preferred_date"], [name="collection_date"]');
        var timeSelect = form.querySelector('[name="seating_time"]');
        var detailSelect = form.querySelector('[name="party_size"], [name="order_tier"]');
        var notesField = form.querySelector('textarea');

        var custName = nameInput ? nameInput.value.trim() : 'Guest';
        var custPhone = phoneInput ? phoneInput.value.trim() : '';
        var custEmail = emailInput ? emailInput.value.trim() : '';
        var dateVal = dateInput ? dateInput.value : '';
        var timeVal = timeSelect && timeSelect.selectedIndex >= 0
          ? timeSelect.options[timeSelect.selectedIndex].text
          : '3 Danby Wynd Counter Collection';
        var detailVal = detailSelect && detailSelect.selectedIndex >= 0
          ? detailSelect.options[detailSelect.selectedIndex].text
          : '';
        var notesVal = notesField && notesField.value.trim()
          ? notesField.value.trim()
          : 'Standard counter preparation — no extra notes.';

        var isFridayForm = Boolean(timeSelect);
        var refCode = (isFridayForm ? 'BOR-FRI-' : 'BOR-ORD-') + String(Math.floor(1000 + Math.random() * 9000));

        if (summaryBox) {
          summaryBox.textContent = 'For immediate counter enquiries at 3 Danby Wynd, Yarm, call 01642 791888.';
        }

        if (ticketMount) {
          var plainReceipt = [
            'Borrelli Delicatessen — 3 Danby Wynd, Yarm TS15 9SF',
            'Enquiry Ref: ' + refCode,
            'Customer: ' + custName,
            'Contact: ' + custPhone + ' · ' + custEmail,
            'Date / Session: ' + dateVal + ' · ' + timeVal,
            'Request: ' + detailVal,
            'Notes: ' + notesVal
          ].join('\n');

          ticketMount.innerHTML =
            '<div class="owner-receipt-card__head">' +
              '<h3 class="owner-receipt-card__title">What Borrelli Delicatessen Receives</h3>' +
              '<span class="owner-receipt-card__ref">REF · ' + escapeHtml(refCode) + '</span>' +
            '</div>' +
            '<dl class="owner-receipt-dl">' +
              '<div><dt>Customer Name</dt><dd>' + escapeHtml(custName) + '</dd></div>' +
              '<div><dt>Phone &amp; Email</dt><dd>' + escapeHtml(custPhone) + ' · ' + escapeHtml(custEmail) + '</dd></div>' +
              '<div><dt>Date &amp; Session</dt><dd>' + escapeHtml(dateVal) + ' · ' + escapeHtml(timeVal) + '</dd></div>' +
              '<div><dt>Table / Counter Selection</dt><dd>' + escapeHtml(detailVal) + '</dd></div>' +
              '<div class="owner-receipt-dl__full"><dt>Dietary, Gift Tag &amp; Counter Notes</dt><dd>' + escapeHtml(notesVal) + '</dd></div>' +
            '</dl>' +
            '<div class="owner-receipt-actions">' +
              '<button class="btn btn--receipt-copy" type="button" data-copy-ticket>Copy Summary</button>' +
              '<button class="btn btn--receipt-reset" type="button" data-reset-demo>Reset Demo</button>' +
            '</div>';

          var copyBtn = ticketMount.querySelector('[data-copy-ticket]');
          var resetBtn = ticketMount.querySelector('[data-reset-demo]');

          if (copyBtn) {
            copyBtn.addEventListener('click', function () {
              copyToClipboard(plainReceipt, function () {
                copyBtn.textContent = '✓ Summary Copied';
                showToast('✓ Enquiry summary copied to clipboard');
                window.setTimeout(function () {
                  copyBtn.textContent = 'Copy Summary';
                }, 2200);
              });
            });
          }

          if (resetBtn) {
            resetBtn.addEventListener('click', function () {
              form.reset();
              controls.forEach(function (c) { c.setAttribute('aria-invalid', 'false'); });
              statusBox.hidden = true;
              ticketMount.innerHTML = '';
              if (controls[0]) controls[0].focus();
              showToast('↺ Demo form reset');
            });
          }
        }

        statusBox.hidden = false;
        statusBox.focus();
      }
    });
  });

  /* 7. Smart Form / Footer Auto-Clearance for Mobile Action Bar */
  var mobileBar = document.querySelector('.mobile-action-bar');
  if (mobileBar && 'IntersectionObserver' in window) {
    var watchEls = Array.prototype.slice.call(document.querySelectorAll('form[data-demo-form], footer.site-footer'));
    if (watchEls.length) {
      var visMap = new Map();
      var barObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visMap.set(entry.target, entry.isIntersecting);
        });
        var anyVisible = false;
        visMap.forEach(function (v) { if (v) anyVisible = true; });
        mobileBar.classList.toggle('is-dock-hidden', anyVisible);
      }, { threshold: 0.08 });

      watchEls.forEach(function (el) { barObs.observe(el); });
    }
  }
})();

// === Gallery Inspiration Polish (Awwwards / Godly / Mobbin) ===
(function () {
  'use strict';

  function initGalleryPolish() {
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Subtle Top Header Reading-Progress Hairline
    var hdr = document.querySelector('header');
    if (hdr && !hdr.querySelector('.scroll-progress-rail')) {
      var cs = window.getComputedStyle(hdr);
      if (cs.position === 'static') {
        hdr.style.position = 'relative';
      }
      var rail = document.createElement('div');
      rail.className = 'scroll-progress-rail';
      rail.setAttribute('aria-hidden', 'true');
      hdr.appendChild(rail);
      var ticking = false;
      var updateRail = function () {
        var docH = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
        rail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        ticking = false;
      };
      window.addEventListener('scroll', function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateRail);
        }
      }, { passive: true });
      updateRail();
    }

    // 2. Choreographed Below-the-Fold Scroll Reveals (never above the fold)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.deli-card, .perforated-ticket');
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            obs.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      var vh = window.innerHeight || 800;
      var staggerIdx = 0;
      targets.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.top > vh * 0.96) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Quick Date Chips for Collection Date
    function toIso(d) {
      var m = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return d.getFullYear() + '-' + m + '-' + day;
    }
    function nextWeekday(base, targetDow) {
      var diff = (targetDow - base.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      return new Date(base.getFullYear(), base.getMonth(), base.getDate() + diff);
    }

    var today = new Date();
    var todayIso = toIso(today);
    document.querySelectorAll('input[type="date"]').forEach(function (input) {
      if (!input.min) input.min = todayIso;
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
      var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
      var presets = [
        { label: 'Tomorrow', iso: toIso(tmrw) },
        { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
        { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
      ];

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          input.value = p.iso;
          chipRow.querySelectorAll('.quick-date-chip').forEach(function (c) { c.classList.remove('is-selected'); });
          btn.classList.add('is-selected');
          input.dispatchEvent(new Event('change', { bubbles: true }));
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        chipRow.appendChild(btn);
      });

      input.insertAdjacentElement('afterend', chipRow);
    });

    // Live factual Friday Antipasto Night counter ticket indicator
    var kicker = document.querySelector('.perforated-ticket__kicker');
    if (kicker) {
      var day = today.getDay();
      if (day === 5) {
        kicker.textContent = '✦ Tonight · Every Friday Evening';
      } else {
        var daysUntilFri = (5 - day + 7) % 7 || 7;
        var nextFri = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysUntilFri);
        var fmt = nextFri.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
        kicker.textContent = 'Every Friday · Next: Fri ' + fmt;
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
