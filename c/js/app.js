/* ==========================================================================
   Borrelli Delicatessen — Concept C App Logic
   Tappable Counter Pills + Live Count · 3-Step Counter Stepper · Friday Chips
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
    var list = [];
    var d = new Date(today);
    while (list.length < count) {
      if (d.getDay() === 5) list.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return list;
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

  /* 2. Tappable Deli Counter & Hamper Item Selector Pills + Live Badge Count */
  var deliPills = Array.prototype.slice.call(document.querySelectorAll('[data-deli-item]'));
  var countBadge = document.querySelector('[data-pill-count]');
  var previewLine = document.querySelector('[data-pill-preview]');
  var jumpHamperBtn = document.querySelector('[data-jump-hamper-step]');

  function getSelectedDeliItems() {
    return deliPills
      .filter(function (p) { return p.classList.contains('is-on'); })
      .map(function (p) { return p.getAttribute('data-deli-item'); });
  }

  function refreshDeliSelector() {
    var items = getSelectedDeliItems();
    if (countBadge) {
      countBadge.textContent = items.length + (items.length === 1 ? ' item selected' : ' items selected');
    }
    if (previewLine) {
      previewLine.textContent = items.length
        ? 'Attached: ' + items.join(' · ')
        : 'No counter items tapped yet — tap any pills above to attach them to a board or hamper.';
    }
  }

  deliPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var on = !pill.classList.contains('is-on');
      pill.classList.toggle('is-on', on);
      pill.setAttribute('aria-pressed', on ? 'true' : 'false');
      var icon = pill.querySelector('.deli-pill__icon');
      if (icon) icon.textContent = on ? '✓' : '+';
      refreshDeliSelector();
    });
  });

  /* 3. Mobbin 3-Step Counter Stepper */
  var form = document.querySelector('[data-c-borrelli-stepper]');
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

      /* Populate upcoming Friday chips */
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

    if (jumpHamperBtn) {
      jumpHamperBtn.addEventListener('click', function () {
        var hamperRadio = document.getElementById('exp-hamper');
        if (hamperRadio) {
          hamperRadio.checked = true;
          adaptStepTwoFields();
        }
        goToStep(2);
        var sec = document.getElementById('order-book');
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

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
      var summary = [
        fd.get('customer_name'),
        fd.get('experience_type'),
        fd.get('party_or_tier'),
        fd.get('preferred_date'),
        fd.get('sitting_or_window')
      ].filter(Boolean).join(' · ');

      if (demoDetail) {
        demoDetail.textContent = 'Submitted preview: ' + summary + ' — 3 Danby Wynd, Yarm (01642 791888).';
      }
      if (demoBanner) {
        demoBanner.hidden = false;
        demoBanner.focus();
      }
    });
  }
})();
