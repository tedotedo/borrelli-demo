/* ==========================================================================
   Borrelli Delicatessen — Interactive Counter Customiser, Tabs & Demo Forms
   Zero external network calls · Salumeria Platter & Hamper Pre-Order Sync
   ========================================================================== */

(function () {
  'use strict';

  var STORAGE_KEY = 'borrelli_counter_selection';

  /* 1. Keyboard-Accessible Mobile Navigation */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var siteNav = document.querySelector('[data-site-nav]');

  function closeNav(returnFocus) {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('is-open');
    if (returnFocus) {
      navToggle.focus();
    }
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

  /* 2. Accessible Tab Switchers (Menu/Deli & Dual Booking/Order Forms) */
  var tablists = document.querySelectorAll('[role="tablist"]');

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
      try {
        var sp = new URLSearchParams(window.location.search);
        isPreorderQuery = sp.get('preorder') === '1';
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
          (isPreorderQuery && panelId === 'panel-preorder')
        ) {
          activateTab(tab, false);
        }
      });
    }

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
  });

  /* 3. Interactive "Build Your Custom Sharing Board or Gift Hamper" Counter Selector */
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
    var statusText = builder.querySelector('[data-builder-status]');
    var itemsText = builder.querySelector('[data-builder-items-preview]');
    var sendLink = builder.querySelector('[data-send-preorder]');

    /* Restore prior selection if present */
    var existing = loadSavedSelection();
    if (existing && existing.format && Array.isArray(existing.items)) {
      formatRadios.forEach(function (r) {
        r.checked = r.value === existing.format;
      });
      itemChecks.forEach(function (c) {
        c.checked = existing.items.indexOf(c.value) !== -1;
      });
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

      var count = chosenItems.length;
      var noun = count === 1 ? '1 counter selection' : count + ' counter selections';

      if (statusText) {
        statusText.textContent = 'Your Counter Selection: ' + chosenFormat + ' · ' + noun;
      }

      if (itemsText) {
        itemsText.textContent = count > 0
          ? 'Included: ' + chosenItems.join(' · ')
          : 'Tick one or more counter favourites above to pre-fill your pre-order notes.';
      }

      if (sendLink) {
        var qs = new URLSearchParams();
        qs.set('preorder', '1');
        qs.set('format', chosenFormat);
        if (count > 0) {
          qs.set('items', chosenItems.join(', '));
        }
        sendLink.setAttribute('href', 'orders-bookings.html?' + qs.toString() + '#hamper-preorder');
      }

      return { format: chosenFormat, items: chosenItems };
    }

    computeState();

    formatRadios.forEach(function (r) {
      r.addEventListener('change', function () {
        saveSelection(computeState());
      });
    });

    itemChecks.forEach(function (c) {
      c.addEventListener('change', function () {
        saveSelection(computeState());
      });
    });

    if (sendLink) {
      sendLink.addEventListener('click', function () {
        saveSelection(computeState());
      });
    }
  });

  /* 4. Pre-Populate Counter Pre-Order Form on orders-bookings.html */
  var ordTier = document.getElementById('ord-tier');
  var ordNotes = document.getElementById('ord-notes');
  var prefillBanner = document.querySelector('[data-prefill-banner]');
  var prefillText = document.querySelector('[data-prefill-text]');
  var clearPrefillBtn = document.querySelector('[data-clear-prefill]');

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
        if (prefillBanner) {
          prefillBanner.hidden = true;
        }
        ordTier.focus();
      });
    }
  }

  /* 5. Date Inputs & Upcoming Friday Helper Chips */
  var now = new Date();
  var todayIso = now.toISOString().split('T')[0];

  document.querySelectorAll('input[type="date"]').forEach(function (input) {
    if (!input.getAttribute('min')) {
      input.setAttribute('min', todayIso);
    }
  });

  var fridayChipMount = document.querySelector('[data-friday-chips]');
  var fridayDateInput = document.getElementById('anti-date');

  if (fridayChipMount && fridayDateInput) {
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

  /* 6. Accessible Client-Side Form Validation & Exact Demo Status Message */
  var demoForms = document.querySelectorAll('[data-demo-form]');

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
    var controls = Array.prototype.slice.call(
      form.querySelectorAll('input, select, textarea')
    );
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryBox = form.querySelector('[data-demo-summary]');

    controls.forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') {
          validateField(ctrl);
        }
      });
      ctrl.addEventListener('change', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') {
          validateField(ctrl);
        }
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = null;
      controls.forEach(function (ctrl) {
        var ok = validateField(ctrl);
        if (!ok && !firstBad) {
          firstBad = ctrl;
        }
      });

      if (firstBad) {
        if (statusBox) {
          statusBox.hidden = true;
        }
        firstBad.focus();
        return;
      }

      if (statusBox) {
        if (summaryBox) {
          var nameInput = form.querySelector('[name="customer_name"]');
          var dateInput = form.querySelector('[name="preferred_date"], [name="collection_date"]');
          var detailSelect = form.querySelector('[name="party_size"], [name="order_tier"]');

          var bits = [];
          if (nameInput && nameInput.value.trim()) {
            bits.push('Prepared for ' + nameInput.value.trim());
          }
          if (detailSelect && detailSelect.value) {
            bits.push(
              detailSelect.options
                ? detailSelect.options[detailSelect.selectedIndex].text
                : detailSelect.value
            );
          }
          if (dateInput && dateInput.value) {
            bits.push('Date: ' + dateInput.value);
          }

          summaryBox.textContent = bits.length
            ? 'Request preview: ' + bits.join(' · ') + '. For immediate counter enquiries at 3 Danby Wynd, call 01642 791888.'
            : 'For immediate counter enquiries at 3 Danby Wynd, call 01642 791888.';
        }

        statusBox.hidden = false;
        statusBox.focus();
      }
    });
  });
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

    // 2. Choreographed Below-the-Fold Scroll Reveals (Godly / SiteInspire)
    if (!reduced && 'IntersectionObserver' in window) {
      var targets = document.querySelectorAll('.counter-card, .hamper-card, .deli-board-card, .wynd-card, .perforated-ticket');
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
        if (rect.top > vh * 0.94) {
          el.style.setProperty('--reveal-delay', ((staggerIdx % 3) * 55) + 'ms');
          staggerIdx++;
          el.classList.add('reveal-ready');
          obs.observe(el);
        }
      });

      // Safety fallback on hash jump so targeted sections reveal immediately
      window.addEventListener('hashchange', function () {
        document.querySelectorAll('.reveal-ready:not(.is-revealed)').forEach(function (el) {
          if (el.getBoundingClientRect().top < window.innerHeight * 1.1) {
            el.classList.add('is-revealed');
          }
        });
      });
    }

    // 3. Mobbin Smart Date Defaults + 1-Tap Quick Date Chips
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
      if (!input.min) {
        input.min = todayIso;
      }
      var fieldWrap = input.parentElement;
      if (!fieldWrap || fieldWrap.querySelector('[data-friday-chips]') || fieldWrap.querySelector('.quick-date-chips')) {
        return;
      }
      var isReturn = input.id === 'return-date';
      var chipRow = document.createElement('div');
      chipRow.className = 'quick-date-chips';
      chipRow.setAttribute('aria-label', 'Quick date options');

      var presets = [];
      if (isReturn) {
        presets = [
          { label: 'Same Day', calc: function () { var o = document.getElementById('outbound-date'); return (o && o.value) ? o.value : todayIso; } },
          { label: '+2 Days', calc: function () {
            var o = document.getElementById('outbound-date');
            var base = (o && o.value) ? new Date(o.value + 'T12:00:00') : today;
            return toIso(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 2));
          } }
        ];
      } else {
        var tmrw = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        var fri = today.getDay() === 5 ? today : nextWeekday(today, 5);
        var sat = today.getDay() === 6 ? today : nextWeekday(today, 6);
        presets = [
          { label: 'Tomorrow', iso: toIso(tmrw) },
          { label: (today.getDay() === 5 ? 'Tonight (Fri)' : 'This Friday'), iso: toIso(fri) },
          { label: (today.getDay() === 6 ? 'Today (Sat)' : 'This Saturday'), iso: toIso(sat) }
        ];
      }

      presets.forEach(function (p) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quick-date-chip';
        btn.textContent = p.label;
        btn.addEventListener('click', function () {
          var val = p.calc ? p.calc() : p.iso;
          input.value = val;
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
  (function () {
    var kicker = document.querySelector('.perforated-ticket__kicker');
    if (!kicker) return;
    var now = new Date();
    var day = now.getDay();
    if (day === 5) {
      kicker.textContent = '✦ Tonight · Every Friday Evening';
    } else {
      var daysUntilFri = (5 - day + 7) % 7 || 7;
      var nextFri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilFri);
      var fmt = nextFri.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      kicker.textContent = 'Every Friday · Next: Fri ' + fmt;
    }
  })();

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryPolish);
  } else {
    initGalleryPolish();
  }
})();
