/* ==========================================================================
   Borrelli Delicatessen — Concept C App Logic
   Scroll Hairline · 1-Tap Counter Presets · Balance Meter · Lightbox
   3-Step Counter Stepper · Frosted Dock Auto-Clearance · Owner Ticket
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
    var list = [];
    var d = new Date(today);
    while (list.length < count) {
      if (d.getDay() === 5) list.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return list;
  }

  /* 0. 2.5px Brand Scroll-Progress Hairline */
  var progressRail = document.querySelector('[data-scroll-progress]');
  if (progressRail) {
    var ticking = false;
    var updateProgress = function () {
      var docH = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = docH > 40 ? Math.min(1, Math.max(0, window.scrollY / docH)) : 0;
      progressRail.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateProgress);
      }
    }, { passive: true });
    updateProgress();
  }

  var upcomingFridays = getUpcomingFridays(4);
  var fridayKicker = document.querySelector('[data-c-friday-kicker]');
  if (fridayKicker && upcomingFridays.length) {
    var isTodayFriday = new Date().getDay() === 5;
    fridayKicker.textContent = isTodayFriday
      ? 'Tonight · ' + formatShortDate(upcomingFridays[0])
      : 'Next: ' + formatShortDate(upcomingFridays[0]);
  }

  /* 1. Sticky Pill Nav Active State */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('[data-c-nav] a'));
  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.forEach(function (l) { l.classList.toggle('is-active', l === link); });
    });
  });

  /* 2. Tappable Deli Counter Selector Pills + 1-Tap Presets + Balance Meter */
  var deliPills = Array.prototype.slice.call(document.querySelectorAll('[data-deli-item]'));
  var presetBtns = Array.prototype.slice.call(document.querySelectorAll('[data-c-preset]'));
  var countBadge = document.querySelector('[data-pill-count]');
  var previewLine = document.querySelector('[data-pill-preview]');
  var jumpHamperBtn = document.querySelector('[data-jump-hamper-step]');

  var segSal = document.querySelector('[data-c-seg-salumi]');
  var segForm = document.querySelector('[data-c-seg-formaggi]');
  var segAnti = document.querySelector('[data-c-seg-antipasti]');
  var legSal = document.querySelector('[data-c-leg-salumi]');
  var legForm = document.querySelector('[data-c-leg-formaggi]');
  var legAnti = document.querySelector('[data-c-leg-antipasti]');
  var verdictEl = document.querySelector('[data-c-verdict]');
  var activePresetMode = 'hamper';

  function setDeliPill(pill, on) {
    pill.classList.toggle('is-on', on);
    pill.setAttribute('aria-pressed', on ? 'true' : 'false');
    var icon = pill.querySelector('.deli-pill__icon');
    if (icon) icon.textContent = on ? '✓' : '+';
  }

  function getSelectedDeliItems() {
    return deliPills
      .filter(function (p) { return p.classList.contains('is-on'); })
      .map(function (p) { return p.getAttribute('data-deli-item'); });
  }

  function refreshBalanceMeter() {
    var sal = 0, form = 0, anti = 0;
    deliPills.forEach(function (p) {
      if (!p.classList.contains('is-on')) return;
      var cat = p.getAttribute('data-cat');
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

    if (legSal) legSal.innerHTML = '<i class="c-dot c-dot--salumi"></i> Salumi: ' + (sal ? '✓' : '—');
    if (legForm) legForm.innerHTML = '<i class="c-dot c-dot--formaggi"></i> Formaggi: ' + (form ? '✓' : '—');
    if (legAnti) legAnti.innerHTML = '<i class="c-dot c-dot--antipasti"></i> Antipasti &amp; Pantry: ' + anti;

    if (verdictEl) {
      if (sal && form && anti) verdictEl.textContent = 'Classic Salumeria Trio Balanced';
      else if (!tot) verdictEl.textContent = 'Tap counter pills above to compose';
      else verdictEl.textContent = 'Bespoke Mix · Add Salumi, Formaggi or Antipasti for full trio';
    }
  }

  function refreshDeliSelector() {
    var items = getSelectedDeliItems();
    refreshBalanceMeter();
    if (countBadge) {
      countBadge.textContent = items.length + (items.length === 1 ? ' item selected' : ' items selected');
    }
    if (previewLine) {
      previewLine.textContent = items.length
        ? 'Attached: ' + items.join(' · ')
        : 'No counter items tapped yet — tap any pills above to attach them to a board or hamper.';
    }
    if (jumpHamperBtn) {
      jumpHamperBtn.textContent = activePresetMode === 'friday4'
        ? 'Book Friday Table for 4 →'
        : 'Pre-Order With These Items →';
    }
  }

  deliPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      presetBtns.forEach(function (b) { b.classList.remove('is-active'); });
      setDeliPill(pill, !pill.classList.contains('is-on'));
      refreshDeliSelector();
    });
  });

  /* 3. Mobbin 3-Step Counter Stepper */
  var form = document.querySelector('[data-c-borrelli-stepper]');
  var stepController = null;

  if (form) {
    var panes = Array.prototype.slice.call(form.querySelectorAll('[data-c-pane]'));
    var stepIndicators = Array.prototype.slice.call(document.querySelectorAll('[data-c-step-ind]'));
    var dateLabel = form.querySelector('[data-c-date-label]');
    var sizeLabel = form.querySelector('[data-c-size-label]');
    var slotLabel = form.querySelector('[data-c-slot-label]');
    var dateInput = document.getElementById('c-bor-date');
    var sizeSelect = document.getElementById('c-bor-size');
    var slotSelect = document.getElementById('c-bor-slot');
    var notesInput = document.getElementById('c-bor-notes');
    var fridayChipsWrap = form.querySelector('[data-c-friday-chips]');
    var recapText = form.querySelector('[data-c-recap-text]');
    var demoBanner = form.querySelector('[data-demo-status]');
    var demoDetail = form.querySelector('[data-demo-summary]');
    var ticketMount = form.querySelector('[data-owner-ticket]');
    var activeStep = 1;

    function setOptions(sel, arr) {
      if (!sel) return;
      sel.innerHTML = '';
      arr.forEach(function (o, i) {
        var el = document.createElement('option');
        el.value = o.value;
        el.textContent = o.label;
        if (i === 0) el.selected = true;
        sel.appendChild(el);
      });
    }

    function getExperience() {
      var checked = form.querySelector('input[name="experience_type"]:checked');
      return checked ? checked.value : 'Friday Piatto Di Antipasto Night Table';
    }

    function adaptStepTwoFields() {
      var exp = getExperience();
      var isFridayTable = exp.indexOf('Friday') === 0;

      if (dateLabel) {
        dateLabel.innerHTML = (isFridayTable ? 'Preferred Friday Date ' : 'Preferred Collection Date (3 Danby Wynd) ') + '<span class="req" aria-hidden="true">*</span>';
      }
      if (sizeLabel) {
        sizeLabel.innerHTML = (isFridayTable ? 'Party Size ' : 'Board / Hamper Tier ') + '<span class="req" aria-hidden="true">*</span>';
      }
      if (slotLabel) {
        slotLabel.innerHTML = (isFridayTable ? 'Friday Sitting Time ' : 'Collection Window ') + '<span class="req" aria-hidden="true">*</span>';
      }

      if (isFridayTable) {
        setOptions(sizeSelect, [
          { value: '2 Guests', label: '2 Guests' },
          { value: '3 Guests', label: '3 Guests' },
          { value: '4 Guests', label: '4 Guests' },
          { value: '5 Guests', label: '5 Guests' },
          { value: '6 Guests', label: '6 Guests' },
          { value: '7+ Group', label: '7+ Guests (Enquire)' }
        ]);
        setOptions(slotSelect, [
          { value: 'Main Friday Sitting', label: 'Main Friday Sitting [Time – owner to confirm]' },
          { value: 'Early Friday Sitting', label: 'Early Friday Sitting [Time – owner to confirm]' },
          { value: 'Later Friday Sitting', label: 'Later Friday Sitting [Time – owner to confirm]' }
        ]);
      } else {
        setOptions(sizeSelect, [
          { value: 'Classic / For Two', label: 'Classic / For Two [Size & price – owner to confirm]' },
          { value: 'Large Entertaining / Luxury', label: 'Large Entertaining / Luxury Wicker [Price – owner to confirm]' },
          { value: 'Bespoke / Corporate', label: 'Bespoke Budget or Corporate Multi-Order' }
        ]);
        setOptions(slotSelect, [
          { value: 'Morning Counter Collection', label: 'Morning Collection [Hours – owner to confirm]' },
          { value: 'Afternoon Counter Collection', label: 'Afternoon Collection [Hours – owner to confirm]' },
          { value: 'Friday Collection', label: 'Friday Collection at 3 Danby Wynd' }
        ]);
      }

      if (fridayChipsWrap && dateInput) {
        fridayChipsWrap.innerHTML = '';
        var today = new Date();
        today.setHours(12, 0, 0, 0);
        dateInput.min = formatISODate(today);

        var chipBtns = [];
        upcomingFridays.forEach(function (fri, idx) {
          var isTonight = idx === 0 && today.getDay() === 5;
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'c-fri-chip' + (idx === 0 ? ' is-selected' : '');
          btn.textContent = (isTonight ? 'Tonight · ' : '') + formatShortDate(fri);
          var iso = formatISODate(fri);
          btn.setAttribute('data-iso', iso);
          btn.addEventListener('click', function () {
            dateInput.value = iso;
            validateInput(dateInput);
            chipBtns.forEach(function (b) { b.classList.toggle('is-selected', b === btn); });
          });
          fridayChipsWrap.appendChild(btn);
          chipBtns.push(btn);
        });

        if (upcomingFridays[0]) {
          dateInput.value = formatISODate(upcomingFridays[0]);
        }
      }
    }

    form.querySelectorAll('input[name="experience_type"]').forEach(function (r) {
      r.addEventListener('change', adaptStepTwoFields);
    });
    adaptStepTwoFields();

    function validateInput(ctrl) {
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

    function validateStepPane(num) {
      var pane = form.querySelector('[data-c-pane="' + num + '"]');
      if (!pane) return true;
      var ctrls = Array.prototype.slice.call(pane.querySelectorAll('input, select, textarea'));
      var bad = null;
      ctrls.forEach(function (c) {
        if (!validateInput(c) && !bad) bad = c;
      });
      if (bad) {
        bad.focus();
        return false;
      }
      return true;
    }

    function syncStepThreeRecap() {
      var exp = getExperience();
      var isPreorder = exp.indexOf('Friday') !== 0;
      var pickedItems = getSelectedDeliItems();
      var parts = [
        exp,
        sizeSelect ? sizeSelect.value : '',
        dateInput ? dateInput.value : ''
      ];
      if (isPreorder && pickedItems.length) {
        parts.push(pickedItems.length + ' counter items');
        if (notesInput && !notesInput.value.trim()) {
          notesInput.value = 'Selected counter favourites: ' + pickedItems.join(', ') + '.';
        }
      }
      if (recapText) recapText.textContent = parts.filter(Boolean).join(' · ');
    }

    function goToStep(target) {
      activeStep = target;
      panes.forEach(function (p) {
        p.hidden = Number(p.getAttribute('data-c-pane')) !== activeStep;
      });
      stepIndicators.forEach(function (ind) {
        var n = Number(ind.getAttribute('data-c-step-ind'));
        ind.classList.toggle('is-current', n === activeStep);
        ind.classList.toggle('is-done', n < activeStep);
      });
      if (activeStep === 3) syncStepThreeRecap();
    }

    stepController = {
      selectRadioAndJump: function (radioId, sizeVal, stepNum) {
        var r = document.getElementById(radioId);
        if (r) {
          r.checked = true;
          adaptStepTwoFields();
          if (sizeVal && sizeSelect) sizeSelect.value = sizeVal;
        }
        goToStep(stepNum || 2);
      }
    };

    if (jumpHamperBtn) {
      jumpHamperBtn.addEventListener('click', function () {
        if (activePresetMode === 'friday4') {
          stepController.selectRadioAndJump('exp-friday', '4 Guests', 2);
        } else if (activePresetMode === 'platter') {
          stepController.selectRadioAndJump('exp-board', 'Large Entertaining / Luxury', 2);
        } else {
          stepController.selectRadioAndJump('exp-hamper', 'Large Entertaining / Luxury', 2);
        }
        var sec = document.getElementById('order-book');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    form.querySelectorAll('[data-c-next]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = Number(btn.getAttribute('data-c-next'));
        if (!validateStepPane(activeStep)) return;
        goToStep(target);
      });
    });

    form.querySelectorAll('[data-c-prev]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToStep(Number(btn.getAttribute('data-c-prev')));
      });
    });

    document.querySelectorAll('[data-c-goto]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = Number(btn.getAttribute('data-c-goto'));
        if (target > activeStep && !validateStepPane(activeStep)) return;
        goToStep(target);
      });
    });

    form.querySelectorAll('input, select, textarea').forEach(function (ctrl) {
      ctrl.addEventListener('input', function () {
        if (ctrl.getAttribute('aria-invalid') === 'true') validateInput(ctrl);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateStepPane(1) || !validateStepPane(2) || !validateStepPane(3)) {
        if (demoBanner) demoBanner.hidden = true;
        return;
      }

      var fd = new FormData(form);
      var custName = (fd.get('customer_name') || '').toString().trim();
      var custPhone = (fd.get('customer_phone') || '').toString().trim();
      var custEmail = (fd.get('customer_email') || '').toString().trim();
      var expType = (fd.get('experience_type') || '').toString();
      var partyTier = (fd.get('party_or_tier') || '').toString();
      var prefDate = (fd.get('preferred_date') || '').toString();
      var sitWin = (fd.get('sitting_or_window') || '').toString();
      var notesVal = (fd.get('notes') || '').toString().trim() || 'Standard counter preparation — no extra notes.';

      var isFri = /^Friday/i.test(expType);
      var refCode = (isFri ? 'BOR-FRI-' : 'BOR-ORD-') + String(Math.floor(1000 + Math.random() * 9000));

      if (demoDetail) {
        demoDetail.textContent = '3 Danby Wynd, Yarm TS15 9SF · Direct Counter Tel: 01642 791888.';
      }

      if (ticketMount) {
        var plainReceipt = [
          'Borrelli Delicatessen — 3 Danby Wynd, Yarm TS15 9SF',
          'Enquiry Ref: ' + refCode,
          'Customer: ' + custName,
          'Contact: ' + custPhone + ' · ' + custEmail,
          'Date / Window: ' + prefDate + ' · ' + sitWin,
          'Experience: ' + expType + ' (' + partyTier + ')',
          'Notes: ' + notesVal
        ].join('\n');

        ticketMount.innerHTML =
          '<div class="c-owner-ticket__head">' +
            '<h4 class="c-owner-ticket__title">What Borrelli Delicatessen Receives</h4>' +
            '<span class="c-owner-ticket__ref">REF · ' + escapeHtml(refCode) + '</span>' +
          '</div>' +
          '<dl class="c-owner-dl">' +
            '<div><dt>Customer Name</dt><dd>' + escapeHtml(custName) + '</dd></div>' +
            '<div><dt>Phone &amp; Email</dt><dd>' + escapeHtml(custPhone) + ' · ' + escapeHtml(custEmail) + '</dd></div>' +
            '<div><dt>Date &amp; Session</dt><dd>' + escapeHtml(prefDate) + ' · ' + escapeHtml(sitWin) + '</dd></div>' +
            '<div><dt>Board / Hamper / Table</dt><dd>' + escapeHtml(expType) + ' · ' + escapeHtml(partyTier) + '</dd></div>' +
            '<div class="c-owner-dl__full"><dt>Counter &amp; Dietary Notes</dt><dd>' + escapeHtml(notesVal) + '</dd></div>' +
          '</dl>' +
          '<div class="c-owner-actions">' +
            '<button class="btn btn--basil" type="button" data-copy-ticket>Copy Summary</button>' +
            '<button class="btn btn--outline" type="button" data-reset-demo>Reset Demo</button>' +
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
            adaptStepTwoFields();
            demoBanner.hidden = true;
            ticketMount.innerHTML = '';
            goToStep(1);
            showToast('↺ Demo stepper reset');
          });
        }
      }

      if (demoBanner) {
        demoBanner.hidden = false;
        demoBanner.focus();
      }
    });
  }

  /* 1-Tap Counter Presets Wiring */
  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-c-preset');
      activePresetMode = key;
      presetBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

      if (key === 'friday4') {
        deliPills.forEach(function (p) {
          var v = p.getAttribute('data-deli-item');
          setDeliPill(p, /Salumi|Cheeses|Olives|Focaccia/i.test(v));
        });
        if (stepController) stepController.selectRadioAndJump('exp-friday', '4 Guests', 1);
        refreshDeliSelector();
        showToast('🍷 Preset ready: Friday Antipasto Night Table for 4');
      } else if (key === 'hamper') {
        deliPills.forEach(function (p) {
          var v = p.getAttribute('data-deli-item');
          setDeliPill(p, /Salumi|Cheeses|Pasta|Cannoli|Panettone/i.test(v));
        });
        if (stepController) stepController.selectRadioAndJump('exp-hamper', 'Large Entertaining / Luxury', 1);
        refreshDeliSelector();
        showToast('🧺 Preset applied: Bespoke Italian Gift Hamper');
      } else if (key === 'platter') {
        deliPills.forEach(function (p) {
          var v = p.getAttribute('data-deli-item');
          setDeliPill(p, /Salumi|Cheeses|Olives|Focaccia/i.test(v));
        });
        if (stepController) stepController.selectRadioAndJump('exp-board', 'Large Entertaining / Luxury', 1);
        refreshDeliSelector();
        showToast('🧀 Preset applied: Weekend Salumi & Formaggi Platter');
      }
    });
  });

  refreshDeliSelector();

  /* 4. Native <dialog> Photo Lightbox */
  var lightbox = document.getElementById('borrelli-lightbox');
  if (lightbox && typeof lightbox.showModal === 'function') {
    var lbImg = document.getElementById('c-lb-img');
    var lbTitle = document.getElementById('c-lb-title');
    var lbCaption = document.getElementById('c-lb-caption');
    var lbCta = document.getElementById('c-lb-cta');
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
          lbCta.setAttribute('data-lb-exp', btn.getAttribute('data-lightbox-exp') || 'exp-friday');
          lbCta.textContent = btn.getAttribute('data-lightbox-cta') || 'Order / Book →';
        }
        lightbox.showModal();
      });
    });

    if (lbClose) lbClose.addEventListener('click', function () { lightbox.close(); });
    if (lbCta) {
      lbCta.addEventListener('click', function () {
        var expId = lbCta.getAttribute('data-lb-exp') || 'exp-friday';
        if (stepController) stepController.selectRadioAndJump(expId, null, 2);
        lightbox.close();
        var sec = document.getElementById('order-book');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) lightbox.close();
    });
    lightbox.addEventListener('close', function () {
      if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    });
  }

  /* 5. IntersectionObserver Auto-Clearance for Frosted Mobile Dock */
  var mobileBar = document.querySelector('.counter-bottom-bar');
  if (mobileBar && 'IntersectionObserver' in window) {
    var watchTargets = Array.prototype.slice.call(document.querySelectorAll('form[data-c-borrelli-stepper], footer.counter-footer'));
    if (watchTargets.length) {
      var visMap = new Map();
      var dockObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          visMap.set(entry.target, entry.isIntersecting);
        });
        var hideDock = false;
        visMap.forEach(function (v) { if (v) hideDock = true; });
        mobileBar.classList.toggle('is-dock-hidden', hideDock);
      }, { threshold: 0.08 });

      watchTargets.forEach(function (el) { dockObs.observe(el); });
    }
  }

  /* 6. Below-the-Fold Scroll Reveals (never above the fold) */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    var revealEls = document.querySelectorAll('.clean-deli-box, .selector-app-card, .counter-stepper-card, .wynd-app-card');
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
