/* ==========================================================================
   Borrelli Delicatessen — Interactive UI & Accessible Demo Forms
   Zero external network calls.
   ========================================================================== */

(function () {
  'use strict';

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

    function syncFromHash() {
      var hash = window.location.hash ? window.location.hash.slice(1) : '';
      if (!hash) return;
      tabs.forEach(function (tab) {
        var panelId = tab.getAttribute('aria-controls');
        var dataHash = tab.getAttribute('data-hash');
        if (hash === panelId || hash === dataHash || hash === tab.id) {
          activateTab(tab, false);
        }
      });
    }

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
  });

  /* 3. Date Inputs & Upcoming Friday Helper Chips */
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

  /* 4. Accessible Client-Side Form Validation & Exact Demo Status Message */
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
