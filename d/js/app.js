/* Borrelli Delicatessen — Concept D: Build your board (demo only)
   Item names are generic counter categories for illustration, not the shop's confirmed range. */
(function () {
  'use strict';

  function svg(inner) { return '<svg viewBox="0 0 60 60" aria-hidden="true">' + inner + '</svg>'; }
  var ART = {
    salami: svg('<circle cx="22" cy="24" r="15" fill="#8E2B2B"/><circle cx="38" cy="34" r="15" fill="#A33434"/><g fill="#F3D9CF"><circle cx="33" cy="28" r="2"/><circle cx="42" cy="38" r="2"/><circle cx="36" cy="41" r="1.6"/><circle cx="18" cy="20" r="2"/><circle cx="26" cy="27" r="1.6"/></g>'),
    prosciutto: svg('<path d="M8 22 Q20 8 32 20 T54 20 Q56 34 44 40 T14 42 Q4 34 8 22Z" fill="#E08A86"/><path d="M12 26 Q24 16 34 26 T50 26" fill="none" stroke="#FBE3DC" stroke-width="4"/><path d="M14 36 Q26 28 36 36 T48 34" fill="none" stroke="#C7625F" stroke-width="2"/>'),
    bresaola: svg('<ellipse cx="24" cy="28" rx="17" ry="13" fill="#6B1F2A"/><ellipse cx="38" cy="34" rx="17" ry="13" fill="#7F2733"/><path d="M26 34 Q38 28 50 34" fill="none" stroke="#A8505A" stroke-width="2"/>'),
    hard: svg('<polygon points="6,44 52,20 54,44" fill="#E9B949"/><polygon points="6,44 52,20 50,14 8,38" fill="#F6D776"/><g fill="#C9962B"><circle cx="36" cy="36" r="2.5"/><circle cx="46" cy="38" r="1.8"/><circle cx="26" cy="40" r="1.6"/></g>'),
    soft: svg('<circle cx="30" cy="30" r="20" fill="#FBF6E6"/><circle cx="30" cy="30" r="20" fill="none" stroke="#E6DDC3" stroke-width="3"/><path d="M30 30 L50 30 A20 20 0 0 0 40 12.7 Z" fill="#F1E7C6"/>'),
    blue: svg('<polygon points="8,42 46,14 54,42" fill="#F2EEDF"/><g fill="#5F7C8A"><circle cx="30" cy="34" r="2.5"/><circle cx="40" cy="30" r="2"/><circle cx="44" cy="38" r="2.4"/><circle cx="22" cy="38" r="1.8"/><circle cx="36" cy="24" r="1.6"/></g>'),
    olives: svg('<ellipse cx="30" cy="34" rx="24" ry="16" fill="#8A4B2A"/><ellipse cx="30" cy="31" rx="20" ry="12" fill="#5B2E18"/><g><ellipse cx="22" cy="30" rx="6" ry="5" fill="#6E8B2F"/><ellipse cx="34" cy="27" rx="6" ry="5" fill="#2B2420"/><ellipse cx="38" cy="35" rx="6" ry="5" fill="#7F9C3A"/><ellipse cx="27" cy="37" rx="5" ry="4" fill="#3A2E2A"/></g>'),
    artichoke: svg('<g fill="#9BA85A"><ellipse cx="20" cy="26" rx="10" ry="14" transform="rotate(-20 20 26)"/><ellipse cx="38" cy="26" rx="10" ry="14" transform="rotate(20 38 26)"/><ellipse cx="29" cy="38" rx="10" ry="13"/></g><g fill="none" stroke="#6D7A36" stroke-width="2"><path d="M20 16 V36"/><path d="M38 16 V36"/><path d="M29 28 V48"/></g>'),
    tomato: svg('<g fill="#9E2A1F"><ellipse cx="20" cy="24" rx="11" ry="8" transform="rotate(-15 20 24)"/><ellipse cx="40" cy="28" rx="11" ry="8" transform="rotate(20 40 28)"/><ellipse cx="28" cy="40" rx="11" ry="8"/></g><g fill="none" stroke="#C8553F" stroke-width="2"><path d="M13 24 H27"/><path d="M33 28 H47"/><path d="M21 40 H35"/></g>'),
    focaccia: svg('<rect x="6" y="14" width="48" height="32" rx="8" fill="#D9A55B"/><rect x="6" y="14" width="48" height="32" rx="8" fill="none" stroke="#B37E37" stroke-width="3"/><g fill="#8C5F22"><circle cx="18" cy="24" r="2"/><circle cx="30" cy="22" r="2"/><circle cx="42" cy="26" r="2"/><circle cx="22" cy="36" r="2"/><circle cx="36" cy="38" r="2"/></g><g fill="#5E7A2E"><rect x="24" y="28" width="6" height="2" rx="1"/><rect x="40" y="34" width="6" height="2" rx="1"/></g>'),
    grissini: svg('<g stroke="#D9A55B" stroke-width="5" stroke-linecap="round"><path d="M10 50 L40 8"/><path d="M20 52 L48 12"/><path d="M30 52 L54 20"/></g>'),
    honey: svg('<rect x="16" y="20" width="28" height="28" rx="8" fill="#E7A32B"/><rect x="18" y="12" width="24" height="9" rx="3" fill="#7A4A1C"/><rect x="21" y="27" width="6" height="14" rx="3" fill="#F6CF74"/>')
  };

  var GROUPS = [
    { name: 'Salumi', items: [['salami', 'Salami'], ['prosciutto', 'Prosciutto'], ['bresaola', 'Bresaola']] },
    { name: 'Formaggi', items: [['hard', 'Hard cheese'], ['soft', 'Soft cheese'], ['blue', 'Blue cheese']] },
    { name: 'Antipasti', items: [['olives', 'Olives'], ['artichoke', 'Artichokes'], ['tomato', 'Sun-dried tomatoes']] },
    { name: 'Pane e dolce', items: [['focaccia', 'Focaccia'], ['grissini', 'Grissini'], ['honey', 'Honey']] }
  ];
  var NAMES = {};
  var chosen = [];

  var pick = document.querySelector('[data-pick]');
  var wood = document.querySelector('[data-wood]');

  GROUPS.forEach(function (g) {
    var h = document.createElement('h3'); h.textContent = g.name; pick.appendChild(h);
    var row = document.createElement('div'); row.className = 'pick__row';
    g.items.forEach(function (it) {
      NAMES[it[0]] = it[1];
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'item'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-item', it[0]);
      b.innerHTML = ART[it[0]] + '<span></span>';
      b.querySelector('span').textContent = it[1];
      b.addEventListener('click', function () { toggle(it[0]); });
      row.appendChild(b);
    });
    pick.appendChild(row);
  });

  function toggle(id) {
    var i = chosen.indexOf(id);
    if (i === -1) chosen.push(id); else chosen.splice(i, 1);
    render(i === -1 ? id : null);
  }

  function render(added) {
    Array.prototype.forEach.call(document.querySelectorAll('.item'), function (b) {
      b.setAttribute('aria-pressed', chosen.indexOf(b.getAttribute('data-item')) !== -1 ? 'true' : 'false');
    });
    wood.textContent = '';
    chosen.forEach(function (id) {
      var li = document.createElement('li');
      li.innerHTML = ART[id];
      if (id !== added) li.style.animation = 'none';
      wood.appendChild(li);
    });
    document.querySelector('[data-wood-empty]').hidden = chosen.length > 0;
    var n = chosen.length;
    document.querySelector('[data-tally-count]').textContent = n;
    document.querySelector('[data-tally-size]').textContent =
      n === 0 ? 'Start adding' : n <= 4 ? 'A board for two' : n <= 8 ? 'A board for four' : 'A party board';
    var list = document.querySelector('[data-tally-list]');
    list.textContent = '';
    chosen.forEach(function (id) { var li = document.createElement('li'); li.textContent = NAMES[id]; list.appendChild(li); });
  }
  render(null);

  /* Dates */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var now = new Date();
  var dateInput = document.getElementById('s-date');
  dateInput.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  var fri = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((5 - now.getDay() + 7) % 7));
  document.querySelector('[data-next-friday]').textContent = fri.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  var xmas = new Date(now.getFullYear(), 11, 25);
  if (xmas < now) xmas = new Date(now.getFullYear() + 1, 11, 25);
  document.querySelector('[data-xmas-days]').textContent = Math.ceil((xmas - now) / 86400000);

  var form = document.querySelector('[data-send]');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, err = document.querySelector('[data-send-error]'), done = document.querySelector('[data-send-done]');
    var msg = '';
    if (!chosen.length) msg = 'Add at least one thing to your board first.';
    else if (!f.date.value || !f.name.value.trim() || !f.phone.value.trim()) msg = 'Add a collection date, your name and a phone number.';
    if (msg) { err.textContent = msg; err.hidden = false; done.hidden = true; return; }
    err.hidden = true; done.hidden = false;
    var d = new Date(f.date.value + 'T12:00:00');
    done.textContent = 'Board with ' + chosen.length + (chosen.length === 1 ? ' item' : ' items') + ' for collection on ' +
      d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + '. Demo only, nothing has been sent.';
  });
})();
