/* ==========================================================================
   Borrelli Delicatessen — Concept B Interactive Logic
   Live Friday Badge · 5-Card Reel · Chip Composer · Dual Candlelit Form
   ========================================================================== */
(function () {
  'use strict';

  function formatISODate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatShortDate(date) {
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  function getUpcomingFridays(count) {
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var fridays = [];
    var d = new Date(today);
    while (fridays.length < count) {
      if (d.getDay() === 5) {
        fridays.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
    }
    return fridays;
  }

  /* 1. Live Calendar-Aware Friday Antipasto Night Hero Badge */
  var liveBadge = document.querySelector('[data-friday-live-badge]');
  var liveBadgeText = document.querySelector('[data-friday-badge-text]');
  var nextFridays = getUpcomingFridays(4);

  if (liveBadge && liveBadgeText && nextFridays.length) {
    var now = new Date();
    var isFriday = now.getDay() === 5;
    if (isFriday) {
      liveBadge.classList.add('is-tonight');
      liveBadgeText.textContent = 'Tonight · Piatto Di Antipasto Night (' + formatShortDate(now) + ')';
    } else {
      liveBadge.classList.remove('is-tonight');
      liveBadgeText.textContent = 'Next: ' + formatShortDate(nextFridays[0]) + ' · Piatto Di Antipasto Night';
    }
  }

  /* 2. Horizontal 5-Card Counter Showcase Controls */
  var reel = document.querySelector('[data-counter-reel]');
  var cards = reel ? Array.prototype.slice.call(reel.querySelectorAll('[data-showcase-card]')) : [];
  var prevBtn = document.querySelector('[data-showcase-prev]');
  var nextBtn = document.querySelector('[data-showcase-next]');
  var countEl = document.querySelector('[data-showcase-count]');

  function activeCardIdx() {
    if (!reel || !cards.length) return 0;
    var sl = reel.scrollLeft;
    var best = 0;
    var bestDiff = Infinity;
    cards.forEach(function (c, i) {
      var diff = Math.abs(c.offsetLeft - reel.offsetLeft - sl);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    });
    return best;
  }

  function refreshShowcaseCount() {
    if (!countEl || !cards.length) return;
    countEl.textContent = String(activeCardIdx() + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
  }

  function jumpShowcase(idx) {
    if (!reel || !cards.length) return;
    var clamped = Math.max(0, Math.min(cards.length - 1, idx));
    reel.scrollTo({ left: cards[clamped].offsetLeft - reel.offsetLeft, behavior: 'smooth' });
  }

  if (reel) {
    reel.addEventListener('scroll', refreshShowcaseCount, { passive: true });
    if (prevBtn) prevBtn.addEventListener('click', function () { jumpShowcase(activeCardIdx() - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { jumpShowcase(activeCardIdx() + 1); });
    refreshShowcaseCount();
  }

  /* 3. Interactive Tap-to-Build Antipasto & Hamper Chip Composer */
  var composer = document.querySelector('[data-chip-composer]');
  var formatBtns = composer ? Array.prototype.slice.call(composer.querySelectorAll('[data-composer-format]')) : [];
  var ingChips = composer ? Array.prototype.slice.call(composer.querySelectorAll('[data-ing-chip]')) : [];
  var compTitle = composer ? composer.querySelector('[data-composer-title]') : null;
  var compItems = composer ? composer.querySelector('[data-composer-items]') : null;
  var loadBtn = composer ? composer.querySelector('[data-load-into-form]') : null;
  var selectedFormat = 'Chilled Sharing Antipasto Platter';

  function getSelectedIngredients() {
    return ingChips
      .filter(function (c) { return c.classList.contains('is-selected'); })
      .map(function (c) { return c.getAttribute('data-ing-chip'); });
  }

  function renderComposer() {
    var items = getSelectedIngredients();
    if (compTitle) {
      compTitle.textContent = selectedFormat + ' · ' + items.length + (items.length === 1 ? ' item selected' : ' items selected');
    }
    if (compItems) {
      compItems.textContent = items.length ? items.join(' · ') : 'Tap one or more counter ingredients above to include them.';
    }
  }

  formatBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      selectedFormat = btn.getAttribute('data-composer-format');
      formatBtns.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      renderComposer();
    });
  });

  ingChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var next = !chip.classList.contains('is-selected');
      chip.classList.toggle('is-selected', next);
      chip.setAttribute('aria-pressed', next ? 'true' : 'false');
      var mark = chip.querySelector('.ing-chip__mark');
      if (mark) mark.textContent = next ? '✓' : '+';
      renderComposer();
    });
  });

  /* 4. Candlelit Friday Table / Pre-Order Form & Mode Switcher */
  var form = document.querySelector('[data-borrelli-form]');
  var modeBtns = Array.prototype.slice.call(document.querySelectorAll('[data-form-mode]'));
  var modeInput = document.getElementById('b-request-mode');
  var dateLabel = document.querySelector('[data-date-label]');
  var optionLabel = document.querySelector('[data-option-label]');
  var sizeLabel = document.querySelector('[data-size-label]');
  var notesLabel = document.querySelector('[data-notes-label]');
  var submitBtn = document.querySelector('[data-submit-label]');
  var dateInput = document.getElementById('b-bor-date');
  var optionSelect = document.getElementById('b-bor-option');
  var sizeSelect = document.getElementById('b-bor-size');
  var notesArea = document.getElementById('b-bor-notes');
  var chipsContainer = document.querySelector('[data-b-friday-chips]');

  function populateSelect(selectEl, items) {
    if (!selectEl) return;
    selectEl.innerHTML = '';
    items.forEach(function (it, idx) {
      var opt = document.createElement('option');
      opt.value = it.value;
      opt.textContent = it.label;
      if (idx === 0) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function renderDateChips(mode) {
    if (!chipsContainer || !dateInput) return;
    chipsContainer.innerHTML = '';
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    dateInput.min = formatISODate(today);

    var list = [];
    if (mode === 'friday') {
      nextFridays.forEach(function (f, i) {
        var isTodayFri = i === 0 && today.getDay() === 5;
        list.push({
          label: (isTodayFri ? 'Tonight · ' : '') + formatShortDate(f),
          iso: formatISODate(f)
        });
      });
    } else {
      for (var offset = 1; offset <= 4; offset++) {
        var d = new Date(today);
        d.setDate(today.getDate() + offset);
        list.push({ label: formatShortDate(d), iso: formatISODate(d) });
      }
    }

    var btns = [];
    list.forEach(function (entry, idx) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fri-chip' + (idx === 0 ? ' is-selected' : '');
      b.textContent = entry.label;
      b.setAttribute('data-iso', entry.iso);
      b.addEventListener('click', function () {
        dateInput.value = entry.iso;
        btns.forEach(function (el) { el.classList.toggle('is-selected', el === b); });
      });
      chipsContainer.appendChild(b);
      btns.push(b);
    });

    if (list[0]) dateInput.value = list[0].iso;
  }

  function setFormMode(mode) {
    var isFri = mode === 'friday';
    modeBtns.forEach(function (b) {
      var active = b.getAttribute('data-form-mode') === mode;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (modeInput) {
      modeInput.value = isFri ? 'Friday Piatto Di Antipasto Night Table' : 'Danby Wynd Platter / Hamper Pre-Order';
    }
    if (dateLabel) dateLabel.innerHTML = (isFri ? 'Preferred Friday Date ' : 'Preferred Collection Date (3 Danby Wynd) ') + '<span class="req" aria-hidden="true">*</span>';
    if (optionLabel) optionLabel.innerHTML = (isFri ? 'Friday Sitting Slot ' : 'Platter or Hamper Selection ') + '<span class="req" aria-hidden="true">*</span>';
    if (sizeLabel) sizeLabel.innerHTML = (isFri ? 'Party Size ' : 'Tier / Quantity ') + '<span class="req" aria-hidden="true">*</span>';
    if (notesLabel) notesLabel.textContent = isFri ? 'Dietary Notes or Table Requests (Optional)' : 'Selected Counter Ingredients, Gift Card Message & Dietary Notes';
    if (submitBtn) submitBtn.textContent = isFri ? 'Request Friday Antipasto Table' : 'Send Platter / Hamper Pre-Order';

    if (isFri) {
      populateSelect(optionSelect, [
        { value: 'Main Friday Sitting', label: 'Main Friday Evening Sitting [Time – owner to confirm]' },
        { value: 'Early Friday Sitting', label: 'Early Friday Evening Sitting [Time – owner to confirm]' },
        { value: 'Later Friday Sitting', label: 'Later Friday Sitting [Time – owner to confirm]' }
      ]);
      populateSelect(sizeSelect, [
        { value: '2 Guests', label: '2 Guests' },
        { value: '3 Guests', label: '3 Guests' },
        { value: '4 Guests', label: '4 Guests' },
        { value: '5 Guests', label: '5 Guests' },
        { value: '6 Guests', label: '6 Guests' },
        { value: '7+ Group', label: '7+ Guests (Enquire)' }
      ]);
    } else {
      populateSelect(optionSelect, [
        { value: 'Chilled Sharing Antipasto Platter', label: 'Chilled Sharing Antipasto Platter [Price – owner to confirm]' },
        { value: 'Bespoke Wicker Gift Hamper', label: 'Bespoke Wicker Gift Hamper [Price – owner to confirm]' },
        { value: 'Corporate / Seasonal Multi-Hamper', label: 'Corporate / Seasonal Multi-Hamper Order' }
      ]);
      populateSelect(sizeSelect, [
        { value: 'For Two / Classic Size', label: 'For Two / Classic Tier [Sizes – owner to confirm]' },
        { value: 'Entertaining / Luxury Size', label: 'Entertaining / Luxury Wicker Tier [Sizes – owner to confirm]' },
        { value: 'Custom Budget', label: 'Custom Budget (Specify in notes)' }
      ]);
    }

    renderDateChips(mode);
  }

  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setFormMode(btn.getAttribute('data-form-mode'));
    });
  });

  document.querySelectorAll('[data-open-mode]').forEach(function (link) {
    link.addEventListener('click', function () {
      setFormMode(link.getAttribute('data-open-mode'));
    });
  });

  if (loadBtn) {
    loadBtn.addEventListener('click', function () {
      setFormMode('preorder');
      if (optionSelect) {
        optionSelect.value = selectedFormat;
      }
      var picked = getSelectedIngredients();
      if (notesArea) {
        notesArea.value = 'Composer slip (' + selectedFormat + '): ' + (picked.length ? picked.join(', ') : 'Owner recommendation') + '.';
      }
      var resSec = document.getElementById('reserve');
      if (resSec) resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  setFormMode('friday');

  /* Form Validation & Exact Demo Submit Notice */
  if (form) {
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryEl = form.querySelector('[data-demo-summary]');

    function checkControl(ctrl) {
      var errId = ctrl.getAttribute('aria-describedby');
      var errEl = errId ? document.getElementById(errId) : null;
      var val = (ctrl.value || '').trim();
      var msg = '';

      if (ctrl.hasAttribute('required') && !val) {
        msg = ctrl.getAttribute('data-error-empty') || 'Please complete this field.';
      } else if (ctrl.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg = 'Please enter a valid email address.';
      }

      if (msg) {
        ctrl.setAttribute('aria-invalid', 'true');
        if (errEl) {
          errEl.textContent = msg;
          errEl.hidden = false;
        }
        return false;
      }
      ctrl.removeAttribute('aria-invalid');
      if (errEl) {
        errEl.textContent = '';
        errEl.hidden = true;
      }
      return true;
    }

    form.querySelectorAll('input, select, textarea').forEach(function (c) {
      c.addEventListener('input', function () {
        if (c.getAttribute('aria-invalid') === 'true') checkControl(c);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ctrls = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'));
      var bad = null;
      ctrls.forEach(function (c) {
        if (!checkControl(c) && !bad) bad = c;
      });
      if (bad) {
        if (statusBox) statusBox.hidden = true;
        bad.focus();
        return;
      }

      var fd = new FormData(form);
      var recap = [
        fd.get('customer_name'),
        fd.get('request_mode'),
        fd.get('slot_or_tier'),
        fd.get('size_or_qty'),
        fd.get('preferred_date')
      ].filter(Boolean).join(' · ');

      if (summaryEl) {
        summaryEl.textContent = 'Preview slip: ' + recap + ' — 3 Danby Wynd, Yarm (01642 791888).';
      }
      if (statusBox) {
        statusBox.hidden = false;
        statusBox.focus();
      }
    });
  }
})();
