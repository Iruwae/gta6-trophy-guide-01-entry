/* Leonida Ledger — tracker logic: loads data/trophies.json, renders the checklist,
   saves progress in localStorage, filters, spoiler shield, export/import, demo mode. */
(function () {
  'use strict';

  var STORAGE_KEY = 'leonida-ledger-progress-v1';
  var DEMO_IDS = [2, 3, 8, 16, 18, 21, 35, 42, 53, 55];
  var SOURCE_CODES = [
    ['PowerPyx', 'PP'], ['KeenGamer', 'KG'], ['PlanetGTA6', 'PG'],
    ['GamesFuze', 'GF'], ['GTAScoop', 'GS'], ['EGamers', 'EG'],
    ['CryptoGames', 'CG'], ['The Games Wiki', 'TGW']
  ];

  var trophies = [];
  var earned = {};
  var openGuideId = null;

  function $(id) { return document.getElementById(id); }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) earned = JSON.parse(raw) || {};
    } catch (e) { earned = {}; }
  }

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(earned)); } catch (e) { /* storage full or blocked */ }
  }

  function hashParams() {
    var h = window.location.hash || '';
    var out = {};
    h.replace(/^#/, '').split('&').forEach(function (part) {
      var kv = part.split('=');
      if (kv[0]) out[kv[0]] = decodeURIComponent(kv[1] || '');
    });
    return out;
  }

  function currentTab() {
    var h = (window.location.hash || '#tracker').replace(/^#/, '').split('&')[0];
    return ['tracker', 'roadmap', 'missables', 'sources'].indexOf(h) >= 0 ? h : 'tracker';
  }

  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (s) { s.classList.remove('active'); });
    document.querySelectorAll('nav.tabs a').forEach(function (a) { a.classList.remove('active'); });
    var section = $('tab-' + name);
    if (section) section.classList.add('active');
    var link = document.querySelector('nav.tabs a[data-tab="' + name + '"]');
    if (link) link.classList.add('active');
  }

  function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }

  function sourceCode(name) {
    for (var i = 0; i < SOURCE_CODES.length; i++) {
      if (name.indexOf(SOURCE_CODES[i][0]) === 0) return SOURCE_CODES[i][1];
    }
    return '—';
  }

  function guidePanel(t) {
    var html = '<div class="guide-panel"><h4>Guide — ' + escapeHtml(t.name) + '</h4>';
    html += '<p>' + escapeHtml(t.guide) + '</p>';
    if (t.sourcesDisagree) {
      html += '<p class="warn">Sources disagree / unconfirmed: ' + escapeHtml(t.sourcesDisagree) + '</p>';
    }
    html += '<p><strong>Sources (read 21 Nov 2026):</strong></p><ul>';
    t.sources.forEach(function (s) {
      html += '<li><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a></li>';
    });
    html += '</ul></div>';
    return html;
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function trophyMatches(t, q, kind, grade, state) {
    var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (q && hay.indexOf(q) < 0) return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind && kind !== 'missable' && t.kind !== kind) return false;
    if (grade && t.grade !== grade) return false;
    if (state === 'earned' && !earned[t.id]) return false;
    if (state === 'not-earned' && earned[t.id]) return false;
    if (state === 'hidden' && !t.hidden) return false;
    if (state === 'disputed' && !t.disputed) return false;
    return true;
  }

  function renderList() {
    var q = ($('searchBox').value || '').trim().toLowerCase();
    var kind = $('kindFilter').value;
    var grade = $('gradeFilter').value;
    var state = $('stateFilter').value;
    var shield = $('spoilerToggle').checked;
    var list = $('trophyList');
    list.innerHTML = '';
    var shown = 0;
    trophies.forEach(function (t) {
      if (!trophyMatches(t, q, kind, grade, state)) return;
      shown++;
      var li = document.createElement('li');
      li.className = 'trophy' + (earned[t.id] ? ' earned' : '');
      var isHidden = shield && t.kind === 'story' && !earned[t.id];
      var name = isHidden ? 'Hidden story trophy — earn it to reveal' : t.name;
      var desc = isHidden ? 'Spoiler shield is on. Tick this trophy as earned to reveal its official name and description.' : t.description;
      var tags = '<span class="tag">' + escapeHtml(t.kind) + '</span>';
      if (t.hidden) tags += '<span class="tag hidden">PSN-hidden</span>';
      if (t.missable) tags += '<span class="tag missable">Possibly missable</span>';
      if (t.disputed) tags += '<span class="tag disputed">Disputed / unconfirmed</span>';
      li.innerHTML =
        '<input type="checkbox" class="check" aria-label="Earned: ' + escapeHtml(t.name) + '"' + (earned[t.id] ? ' checked' : '') + '>' +
        '<div><h3>' + escapeHtml(name) + '<span class="grade ' + escapeHtml(t.grade) + '">' + gradeLabel(t.grade) + '</span></h3>' +
        '<p class="desc">' + escapeHtml(desc) + '</p><div class="tags">' + tags + '</div></div>' +
        '<div class="grade-wrap"><span class="tag">' + escapeHtml(t.grade) + '</span></div>' +
        '<button type="button" class="open" data-open="' + t.id + '">' +
        (openGuideId === t.id ? 'Hide the guide ▲' : 'Read the guide with sources ▼') + '</button>';
      li.querySelector('.check').addEventListener('change', function (ev) {
        if (ev.target.checked) earned[t.id] = true; else delete earned[t.id];
        saveProgress();
        renderList();
        renderProgress();
      });
      li.querySelector('[data-open]').addEventListener('click', function () {
        openGuideId = (openGuideId === t.id) ? null : t.id;
        renderList();
      });
      if (openGuideId === t.id) {
        var panel = document.createElement('div');
        panel.innerHTML = guidePanel(t);
        li.appendChild(panel.firstChild);
      }
      list.appendChild(li);
    });
    if (shown === 0) {
      var empty = document.createElement('li');
      empty.textContent = 'No trophies match these filters. Clear the search or filters to see all 55.';
      list.appendChild(empty);
    }
  }

  function renderProgress() {
    var count = Object.keys(earned).length;
    var pct = Math.round(count / 55 * 100);
    $('progressFill').style.width = pct + '%';
    $('progressText').textContent = count + ' of 55 earned · ' + pct + '% · ' + (55 - count) + ' to go';
  }

  function renderSources() {
    var seen = {};
    var items = [];
    trophies.forEach(function (t) {
      t.sources.forEach(function (s) {
        if (!seen[s.url]) { seen[s.url] = true; items.push(s); }
      });
    });
    var ul = $('sourceList');
    items.forEach(function (s) {
      var li = document.createElement('li');
      li.innerHTML = '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.name) + '</a> — read 21 Nov 2026';
      ul.appendChild(li);
    });
    var extra = document.createElement('li');
    extra.textContent = 'Exophase — GTA VI trophy list and PSNProfiles — GTA VI trophy list: the official list sources, as cited via the guides above (they agree on every name, description and grade).';
    ul.appendChild(extra);

    var tbody = document.querySelector('#matrixTable tbody');
    trophies.forEach(function (t) {
      var tr = document.createElement('tr');
      var cells = '<td>' + escapeHtml(t.name) + '</td>';
      SOURCE_CODES.forEach(function (pair) {
        var has = t.sources.some(function (s) { return s.name.indexOf(pair[0]) === 0; });
        cells += has ? '<td class="yes">●</td>' : '<td></td>';
      });
      tr.innerHTML = cells;
      tbody.appendChild(tr);
    });
  }

  function applyDemo() {
    DEMO_IDS.forEach(function (id) { earned[id] = true; });
    saveProgress();
  }

  function exportProgress() {
    var blob = new Blob([JSON.stringify({ app: 'Leonida Ledger', earned: Object.keys(earned).map(Number) }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-ledger-progress.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = Array.isArray(data) ? data : (data.earned || []);
        earned = {};
        ids.forEach(function (id) { earned[Number(id)] = true; });
        saveProgress();
        renderList();
        renderProgress();
      } catch (e) { window.alert('That file is not a valid Leonida Ledger progress export.'); }
    };
    reader.readAsText(file);
  }

  function init() {
    loadProgress();
    var params = hashParams();
    if (params.demo === '1') applyDemo();
    if (params.open) openGuideId = Number(params.open);
    showTab(currentTab());
    window.addEventListener('hashchange', function () {
      showTab(currentTab());
      var p = hashParams();
      if (p.demo === '1') { applyDemo(); renderList(); renderProgress(); }
    });

    $('searchBox').addEventListener('input', renderList);
    $('kindFilter').addEventListener('change', renderList);
    $('gradeFilter').addEventListener('change', renderList);
    $('stateFilter').addEventListener('change', renderList);
    $('spoilerToggle').addEventListener('change', function () {
      $('spoilerNote').textContent = $('spoilerToggle').checked
        ? 'Spoiler shield is ON: story trophies you have not earned show as hidden until you tick them.'
        : 'Spoiler shield is OFF: all story trophy names and descriptions are visible.';
      renderList();
    });
    $('exportBtn').addEventListener('click', exportProgress);
    $('importBtn').addEventListener('click', function () { $('importFile').click(); });
    $('importFile').addEventListener('change', function (ev) {
      if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
      ev.target.value = '';
    });
    $('demoBtn').addEventListener('click', function () {
      applyDemo();
      renderList();
      renderProgress();
    });
    $('clearBtn').addEventListener('click', function () {
      earned = {};
      saveProgress();
      renderList();
      renderProgress();
    });

    fetch('data/trophies.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        trophies = data.trophies || data;
        renderList();
        renderProgress();
        renderSources();
      })
      .catch(function () {
        $('trophyList').innerHTML = '<li>Could not load data/trophies.json. Serve app/ over HTTP (for example: node serve.ts) and reload.</li>';
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
