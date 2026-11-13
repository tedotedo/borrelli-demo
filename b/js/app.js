/* ==========================================================================
   Borrelli Delicatessen — Concept B Interactive Logic
   Scroll Hairline · 4-Card Photo Reel + Dots · Lightbox · Presets & Balance
   Frosted Dock Auto-Clearance · Live Owner Digital Enquiry Ticket
   ========================================================================== */
(function () {
  'use strict';

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

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function copyText(text, onDone) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone, function () { fallbackCopy(text, onDone); });
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
    try { document.execCommand('copy'); } catch (err) { /* ignore */ }
    document.body.removeChild(ta);
    if (onDone) onDone();
  }

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
      if (d.getDay() === 5) fridays.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return fridays;
  }

  /* 0. 2.5px Scroll-Progress Hairline */
  var progressRail = document.querySelector('[data-scroll-progress]');
  if (progressRail) {
    var scrollTick = false;
    var updateProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      progressRail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      scrollTick = false;
    };
    window.addEventListener('scroll', function () {
      if (!scrollTick) {
        scrollTick = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
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

  /* 2. Horizontal 4-Card Counter Showcase Controls + Active Dots */
  var reel = document.querySelector('[data-counter-reel]');
  var cards = reel ? Array.prototype.slice.call(reel.querySelectorAll('[data-showcase-card]')) : [];
  var prevBtn = document.querySelector('[data-showcase-prev]');
  var nextBtn = document.querySelector('[data-showcase-next]');
  var countEl = document.querySelector('[data-showcase-count]');
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-showcase-dot]'));

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

  function refreshShowcaseState() {
    if (!cards.length) return;
    var idx = activeCardIdx();
    if (countEl) {
      countEl.textContent = String(idx + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    }
    dots.forEach(function (dot, i) {
      var active = i === idx;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function jumpShowcase(idx) {
    if (!reel || !cards.length) return;
    var clamped = Math.max(0, Math.min(cards.length - 1, idx));
    reel.scrollTo({ left: cards[clamped].offsetLeft - reel.offsetLeft, behavior: 'smooth' });
  }

  if (reel) {
    reel.addEventListener('scroll', refreshShowcaseState, { passive: true });
    if (prevBtn) prevBtn.addEventListener('click', function () { jumpShowcase(activeCardIdx() - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { jumpShowcase(activeCardIdx() + 1); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        jumpShowcase(Number(dot.getAttribute('data-showcase-dot')) || 0);
      });
    });
    refreshShowcaseState();
  }

  /* 3. Interactive Tap-to-Build Composer + 1-Tap Presets + Balance Meter */
  var composer = document.querySelector('[data-chip-composer]');
  var formatBtns = composer ? Array.prototype.slice.call(composer.querySelectorAll('[data-composer-format]')) : [];
  var ingChips = composer ? Array.prototype.slice.call(composer.querySelectorAll('[data-ing-chip]')) : [];
  var presetBtns = composer ? Array.prototype.slice.call(composer.querySelectorAll('[data-b-preset]')) : [];
  var compTitle = composer ? composer.querySelector('[data-composer-title]') : null;
  var compItems = composer ? composer.querySelector('[data-composer-items]') : null;
  var loadBtn = composer ? composer.querySelector('[data-load-into-form]') : null;

  var segSal = composer ? composer.querySelector('[data-b-seg-salumi]') : null;
  var segForm = composer ? composer.querySelector('[data-b-seg-formaggi]') : null;
  var segAnti = composer ? composer.querySelector('[data-b-seg-antipasti]') : null;
  var legSal = composer ? composer.querySelector('[data-b-leg-salumi]') : null;
  var legForm = composer ? composer.querySelector('[data-b-leg-formaggi]') : null;
  var legAnti = composer ? composer.querySelector('[data-b-leg-antipasti]') : null;
  var verdictEl = composer ? composer.querySelector('[data-b-verdict]') : null;

  var selectedFormat = 'Chilled Sharing Antipasto Platter';
  var fridayTablePreset = false;

  function setChipSelected(chip, on) {
    chip.classList.toggle('is-selected', on);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    var mark = chip.querySelector('.ing-chip__mark');
    if (mark) mark.textContent = on ? '✓' : '+';
  }

  function getSelectedIngredients() {
    return ingChips
      .filter(function (c) { return c.classList.contains('is-selected'); })
      .map(function (c) { return c.getAttribute('data-ing-chip'); });
  }

  function updateComposerBalance() {
    var sal = 0, form = 0, anti = 0;
    ingChips.forEach(function (c) {
      if (!c.classList.contains('is-selected')) return;
      var cat = c.getAttribute('data-cat');
      if (cat === 'salumi') sal++;
      else if (cat === 'formaggi') form++;
      else anti++;
    });
    var tot = sal + form + anti;
    var pSal = tot ? Math.round((sal / tot) * 100) : 0;
    var pForm = tot ? Math.round((form / tot) * 100) : 0;
    var pAnti = tot ? Math.max(0, 100 - pSal - pForm) : 0;

    if (segSal) segSal.style.width = pSal + '%';
    if (segForm) segForm.style.width = pForm + '%';
    if (segAnti) segAnti.style.width = pAnti + '%';

    if (legSal) legSal.innerHTML = '<i class="b-dot b-dot--salumi"></i> Salumi: ' + (sal ? '✓' : '—');
    if (legForm) legForm.innerHTML = '<i class="b-dot b-dot--formaggi"></i> Formaggi: ' + (form ? '✓' : '—');
    if (legAnti) legAnti.innerHTML = '<i class="b-dot b-dot--antipasti"></i> Antipasti &amp; Pantry: ' + anti;

    if (verdictEl) {
      if (sal && form && anti) verdictEl.textContent = 'Classic Salumeria Trio Balanced';
      else if (!tot) verdictEl.textContent = 'Tap ingredients above to compose';
      else verdictEl.textContent = 'Custom Mix · Add Salumi, Formaggi or Antipasti for full trio';
    }
  }

  function renderComposer() {
    var items = getSelectedIngredients();
    updateComposerBalance();
    if (compTitle) {
      compTitle.textContent = (fridayTablePreset ? 'Friday Antipasto Night Table for 4' : selectedFormat) +
        ' · ' + items.length + (items.length === 1 ? ' item selected' : ' items selected');
    }
    if (compItems) {
      compItems.textContent = items.length ? items.join(' · ') : 'Tap one or more counter ingredients above to include them.';
    }
    if (loadBtn) {
      loadBtn.textContent = fridayTablePreset ? 'Load Friday Table for 4 ↓' : 'Load Into Pre-Order Form ↓';
    }
  }

  function selectFormatPill(fmt) {
    selectedFormat = fmt;
    formatBtns.forEach(function (b) {
      var active = b.getAttribute('data-composer-format') === fmt;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  formatBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      fridayTablePreset = false;
      presetBtns.forEach(function (p) { p.classList.remove('is-active'); });
      selectFormatPill(btn.getAttribute('data-composer-format'));
      renderComposer();
    });
  });

  ingChips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      presetBtns.forEach(function (p) { p.classList.remove('is-active'); });
      setChipSelected(chip, !chip.classList.contains('is-selected'));
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

  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-b-preset');
      presetBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

      if (key === 'friday4') {
        fridayTablePreset = true;
        selectFormatPill('Chilled Sharing Antipasto Platter');
        ingChips.forEach(function (c) {
          var v = c.getAttribute('data-ing-chip');
          setChipSelected(c, /Salumi|Formaggi|Olives|Focaccia/i.test(v));
        });
        setFormMode('friday');
        if (sizeSelect) sizeSelect.value = '4 Guests';
        if (notesArea) notesArea.value = 'Friday Antipasto Night Table for 4 — classic salumi, formaggi, olives & warm focaccia.';
        renderComposer();
        showToast('🍷 Preset ready: Friday Antipasto Night Table for 4');
      } else if (key === 'hamper') {
        fridayTablePreset = false;
        selectFormatPill('Bespoke Wicker Gift Hamper');
        ingChips.forEach(function (c) {
          var v = c.getAttribute('data-ing-chip');
          setChipSelected(c, /Salumi|Formaggi|Olive Oil|Pasta|Cannoli/i.test(v));
        });
        setFormMode('preorder');
        if (optionSelect) optionSelect.value = 'Bespoke Wicker Gift Hamper';
        if (sizeSelect) sizeSelect.value = 'Entertaining / Luxury Size';
        renderComposer();
        showToast('🧺 Preset applied: Bespoke Italian Gift Hamper');
      } else if (key === 'platter') {
        fridayTablePreset = false;
        selectFormatPill('Chilled Sharing Antipasto Platter');
        ingChips.forEach(function (c) {
          var v = c.getAttribute('data-ing-chip');
          setChipSelected(c, /Salumi|Formaggi|Olives|Focaccia/i.test(v));
        });
        setFormMode('preorder');
        if (optionSelect) optionSelect.value = 'Chilled Sharing Antipasto Platter';
        renderComposer();
        showToast('🧀 Preset applied: Weekend Salumi & Formaggi Platter');
      }
    });
  });

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
      var picked = getSelectedIngredients();
      if (fridayTablePreset) {
        setFormMode('friday');
        if (sizeSelect) sizeSelect.value = '4 Guests';
        if (notesArea) {
          notesArea.value = 'Friday Antipasto Night Table for 4 — ' + (picked.length ? picked.join(', ') : 'Classic board') + '.';
        }
        showToast('✓ Loaded Friday Table for 4 into desk below');
      } else {
        setFormMode('preorder');
        if (optionSelect) optionSelect.value = selectedFormat;
        if (notesArea) {
          notesArea.value = 'Composer slip (' + selectedFormat + '): ' + (picked.length ? picked.join(', ') : 'Owner recommendation') + '.';
        }
        showToast('✓ Loaded Counter Slip into pre-order form');
      }
      var resSec = document.getElementById('reserve');
      if (resSec) resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  setFormMode('friday');
  renderComposer();

  /* 5. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('borrelli-lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lbImg = document.getElementById('b-lb-img');
    var lbTitle = document.getElementById('b-lb-title');
    var lbCaption = document.getElementById('b-lb-caption');
    var lbCta = document.getElementById('b-lb-cta');
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
          lbCta.setAttribute('data-lb-mode', btn.getAttribute('data-lightbox-mode') || 'friday');
          lbCta.textContent = btn.getAttribute('data-lightbox-cta') || 'Order or Book →';
        }
        lightbox.showModal();
      });
    });

    if (lbClose) lbClose.addEventListener('click', function () { lightbox.close(); });
    if (lbCta) {
      lbCta.addEventListener('click', function () {
        var m = lbCta.getAttribute('data-lb-mode') || 'friday';
        setFormMode(m);
        lightbox.close();
        var resSec = document.getElementById('reserve');
        if (resSec) resSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', function () {
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    });
  }

  /* 6. Form Validation & Exact Demo Submit Notice + Live Owner Receipt Ticket */
  if (form) {
    var statusBox = form.querySelector('[data-demo-status]');
    var summaryEl = form.querySelector('[data-demo-summary]');
    var ticketMount = form.querySelector('[data-owner-ticket]');

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
      var custName = (fd.get('customer_name') || '').toString().trim();
      var custPhone = (fd.get('customer_phone') || '').toString().trim();
      var custEmail = (fd.get('customer_email') || '').toString().trim();
      var reqMode = (fd.get('request_mode') || '').toString();
      var slotTier = (fd.get('slot_or_tier') || '').toString();
      var sizeQty = (fd.get('size_or_qty') || '').toString();
      var prefDate = (fd.get('preferred_date') || '').toString();
      var notesVal = (fd.get('notes') || '').toString().trim() || 'Standard counter preparation — no extra notes.';

      var isFri = /Friday/i.test(reqMode);
      var refCode = (isFri ? 'BOR-FRI-' : 'BOR-ORD-') + String(Math.floor(1000 + Math.random() * 9000));

      if (summaryEl) {
        summaryEl.textContent = '3 Danby Wynd, Yarm TS15 9SF · Direct Counter Tel: 01642 791888.';
      }

      if (ticketMount) {
        var plainReceipt = [
          'Borrelli Delicatessen — 3 Danby Wynd, Yarm TS15 9SF',
          'Enquiry Ref: ' + refCode,
          'Customer: ' + custName,
          'Contact: ' + custPhone + ' · ' + custEmail,
          'Date / Session: ' + prefDate + ' · ' + slotTier,
          'Selection: ' + reqMode + ' (' + sizeQty + ')',
          'Notes: ' + notesVal
        ].join('\n');

        ticketMount.innerHTML =
          '<div class="zine-owner-ticket__head">' +
            '<h3 class="zine-owner-ticket__title">What Borrelli Delicatessen Receives</h3>' +
            '<span class="zine-owner-ticket__ref">REF · ' + escapeHtml(refCode) + '</span>' +
          '</div>' +
          '<dl class="zine-owner-dl">' +
            '<div><dt>Customer Name</dt><dd>' + escapeHtml(custName) + '</dd></div>' +
            '<div><dt>Phone &amp; Email</dt><dd>' + escapeHtml(custPhone) + ' · ' + escapeHtml(custEmail) + '</dd></div>' +
            '<div><dt>Date &amp; Session</dt><dd>' + escapeHtml(prefDate) + ' · ' + escapeHtml(slotTier) + '</dd></div>' +
            '<div><dt>Board / Hamper / Table</dt><dd>' + escapeHtml(reqMode) + ' · ' + escapeHtml(sizeQty) + '</dd></div>' +
            '<div class="zine-owner-dl__full"><dt>Counter &amp; Dietary Notes</dt><dd>' + escapeHtml(notesVal) + '</dd></div>' +
          '</dl>' +
          '<div class="zine-owner-actions">' +
            '<button class="btn btn--terracotta btn--sm" type="button" data-copy-ticket>Copy Summary</button>' +
            '<button class="btn btn--basil-outline btn--sm" type="button" data-reset-demo>Reset Demo</button>' +
          '</div>';

        var copyBtn = ticketMount.querySelector('[data-copy-ticket]');
        var resetBtn = ticketMount.querySelector('[data-reset-demo]');

        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            copyText(plainReceipt, function () {
              copyBtn.textContent = '✓ Summary Copied';
              showToast('✓ Enquiry summary copied to clipboard');
              window.setTimeout(function () { copyBtn.textContent = 'Copy Summary'; }, 2200);
            });
          });
        }
        if (resetBtn) {
          resetBtn.addEventListener('click', function () {
            form.reset();
            setFormMode('friday');
            statusBox.hidden = true;
            ticketMount.innerHTML = '';
            var firstInput = document.getElementById('b-bor-name');
            if (firstInput) firstInput.focus();
            showToast('↺ Demo form reset');
          });
        }
      }

      if (statusBox) {
        statusBox.hidden = false;
        statusBox.focus();
      }
    });
  }

  /* 7. IntersectionObserver Auto-Clearance for Frosted Mobile Dock */
  var mobileDock = document.querySelector('.zine-mobile-dock');
  if (mobileDock && 'IntersectionObserver' in window) {
    var watchTargets = Array.prototype.slice.call(document.querySelectorAll('form[data-borrelli-form], footer.zine-footer'));
    if (watchTargets.length) {
      var dockVis = new Map();
      var dockObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          dockVis.set(entry.target, entry.isIntersecting);
        });
        var hideDock = false;
        dockVis.forEach(function (v) { if (v) hideDock = true; });
        mobileDock.classList.toggle('is-dock-hidden', hideDock);
      }, { threshold: 0.08 });

      watchTargets.forEach(function (el) { dockObs.observe(el); });
    }
  }

  /* 8. Below-the-Fold Scroll Reveals (never above the fold) */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.wynd-panel, .chip-composer, .candlelit-form-shell');
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    var vh = window.innerHeight || 800;
    revealEls.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh * 0.96) {
        el.classList.add('reveal-ready');
        revObs.observe(el);
      }
    });
  }
})();
