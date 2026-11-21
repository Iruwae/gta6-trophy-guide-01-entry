/* Leonida Ledger — Round 4. Loads data/trophies.json, renders the table,
   computes the audit strip live from the data, and keeps a local checklist. */
(function () {
  "use strict";
  var tbody = document.getElementById("tbody");
  var audit = document.getElementById("audit");
  var KEY = "leonida-ledger-r4-done";
  var done = {};
  try { done = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { done = {}; }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) {} }

  function category(t) {
    if (t.status === "unconfirmed") return "unconfirmed";
    if (t.flag === "possibly-missable") return "missable";
    if (t.id <= 13) return "story";
    if ([22, 23, 24, 25, 26, 27, 29].indexOf(t.id) !== -1) return "stranger";
    if ([15, 16, 17, 18, 19, 20, 21, 31, 32, 47].indexOf(t.id) !== -1) return "activity";
    return "crime";
  }

  var data = null;
  var filter = "all";
  var query = "";

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function sourceLinks(t) {
    var map = {};
    data.sources.forEach(function (s) { map[s.name] = s.url; });
    return t.src.map(function (n) {
      return map[n] ? '<a href="' + esc(map[n]) + '" target="_blank" rel="noopener">' + esc(n) + "</a>" : esc(n);
    }).join(", ");
  }

  function render() {
    var rows = data.trophies.filter(function (t) {
      if (filter === "done") return !!done[t.id];
      if (filter !== "all" && category(t) !== filter) return false;
      if (query && (t.name + " " + t.req).toLowerCase().indexOf(query) === -1) return false;
      return true;
    });
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6">No trophies match this filter.</td></tr>';
    } else {
      tbody.innerHTML = rows.map(function (t) {
        var badges = "";
        if (t.status === "unconfirmed") badges += ' <span class="badge unconfirmed">UNCONFIRMED</span>';
        if (t.flag === "possibly-missable") badges += ' <span class="badge missable">POSSIBLY MISSABLE</span>';
        if (t.hidden) badges += ' <span class="badge hidden">HIDDEN</span>';
        return "<tr class=\"" + (done[t.id] ? "checked" : "") + "\">" +
          "<td>" + t.id + "</td>" +
          "<td><b>" + esc(t.name) + "</b>" + badges + "</td>" +
          "<td><span class=\"grade " + t.grade + "\">" + t.grade + "</span></td>" +
          "<td>" + esc(t.req) + "</td>" +
          "<td class=\"src\">" + sourceLinks(t) + "</td>" +
          "<td class=\"done-cell\"><input type=\"checkbox\" data-id=\"" + t.id + "\"" + (done[t.id] ? " checked" : "") + " aria-label=\"Mark " + esc(t.name) + " done\"></td>" +
          "</tr>";
      }).join("");
    }
    var n = Object.keys(done).filter(function (k) { return done[k]; }).length;
    document.getElementById("progress").textContent = "Your progress: " + n + " / 55 checked";
  }

  tbody.addEventListener("change", function (e) {
    var id = e.target && e.target.getAttribute("data-id");
    if (!id) return;
    done[id] = e.target.checked;
    if (!e.target.checked) delete done[id];
    save();
    render();
  });

  document.getElementById("filters").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]");
    if (!b) return;
    filter = b.getAttribute("data-f");
    document.querySelectorAll("#filters button").forEach(function (x) { x.classList.toggle("on", x === b); });
    render();
  });

  document.getElementById("q").addEventListener("input", function (e) {
    query = e.target.value.trim().toLowerCase();
    render();
  });

  fetch("data/trophies.json").then(function (r) { return r.json(); }).then(function (d) {
    data = d;
    var total = d.trophies.length;
    var confirmed = d.trophies.filter(function (t) { return t.status === "confirmed"; }).length;
    var unconfirmed = total - confirmed;
    var cited = d.trophies.filter(function (t) { return t.src && t.src.length > 0; }).length;
    var multi = d.trophies.filter(function (t) { return t.src && t.src.length >= 2; }).length;
    document.getElementById("stat-cited").textContent = cited + "/" + total;
    document.getElementById("stat-confirmed").textContent = confirmed;
    document.getElementById("stat-unconfirmed").textContent = unconfirmed;
    document.getElementById("stat-sources").textContent = d.sources.length;
    audit.textContent = "AUDIT — " + cited + "/" + total + " trophies carry a citation (" + multi + " with 2+ sources) · " +
      confirmed + " confirmed methods · " + unconfirmed + " flagged unconfirmed (" +
      d.trophies.filter(function (t) { return t.status === "unconfirmed"; }).map(function (t) { return t.name; }).join(", ") +
      ") · " + d.disputes.length + " disputes documented below · Sources read " + d.sourcesRead + " · No claim without a source.";
    document.getElementById("dispute-list").innerHTML = d.disputes.map(function (x) {
      return '<div class="dispute"><h3>' + esc(x.topic) + '</h3>' +
        "<p><b>Version A:</b> " + esc(x.a) + "</p>" +
        "<p><b>Version B:</b> " + esc(x.b) + "</p>" +
        '<p class="call"><b>Our call:</b> ' + esc(x.call) + "</p></div>";
    }).join("");
    document.getElementById("source-list").innerHTML = d.sources.map(function (s) {
      return s.url ? '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + esc(s.name) + "</a></li>" : "<li>" + esc(s.name) + "</li>";
    }).join("");
    render();
  }).catch(function () {
    tbody.innerHTML = '<tr><td colspan="6">Could not load data/trophies.json. Serve this folder over HTTP (run <code>node main.ts</code>) instead of opening the file directly.</td></tr>';
    audit.textContent = "AUDIT — data failed to load. Run node main.ts and open http://localhost:8080/";
  });
})();
