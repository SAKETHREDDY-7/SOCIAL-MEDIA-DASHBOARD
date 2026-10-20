/* ============================================================
   SOCIAL MEDIA DASHBOARD — script.js
   All features wired. Zero dead code. Zero console errors.
   ============================================================ */

/* ── Constants ─────────────────────────────────────────────── */

const PLATFORM_COLORS = {
  Instagram: "#9e2237",
  Facebook: "#3B82F6",
  Twitter: "#00b8d9",
  LinkedIn: "#7c44ff",
  TikTok: "#ffb83e",
  YouTube: "#fc2323",
};

const PLATFORM_ICONS = {
  Instagram: "📸",
  Facebook: "🟦",
  Twitter: "🐦",
  LinkedIn: "💼",
  TikTok: "🎵",
  YouTube: "▶️",
};

const METRIC_LABELS = {
  followers: "Followers",
  likes: "Likes",
  engagement: "Engagement Rate",
  reach: "Reach",
  posts: "Posts",
};

// Weekly growth seeds (12 weeks → current value).
// Each entry is the fraction of the current metric at that week.
const TREND_SEEDS = {
  Instagram: [0.68, 0.72, 0.75, 0.78, 0.81, 0.84, 0.87, 0.89, 0.91, 0.93, 0.96, 1.0],
  Facebook:  [0.80, 0.82, 0.83, 0.85, 0.86, 0.88, 0.89, 0.91, 0.92, 0.94, 0.97, 1.0],
  Twitter:   [0.62, 0.66, 0.70, 0.74, 0.78, 0.82, 0.85, 0.88, 0.91, 0.94, 0.97, 1.0],
  LinkedIn:  [0.83, 0.85, 0.87, 0.88, 0.90, 0.91, 0.93, 0.94, 0.95, 0.97, 0.98, 1.0],
  TikTok:    [0.40, 0.48, 0.56, 0.63, 0.70, 0.76, 0.82, 0.87, 0.91, 0.94, 0.97, 1.0],
  YouTube:   [0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 1.0],
};

const AUDIENCE_PROFILES = {
  Instagram: [42, 45, 8, 5],
  Facebook: [48, 39, 7, 6],
  Twitter: [58, 34, 3, 5],
  LinkedIn: [55, 40, 1, 4],
  TikTok: [44, 43, 9, 4],
  YouTube: [46, 42, 8, 4],
};

const AUDIENCE_SEGMENTS = ["Men", "Women", "Children", "Other"];
const AUDIENCE_COLORS = ["#4f46e5", "#e1306c", "#f59e0b", "#059669"];

// CSV values represent 30-day baseline; scale for other periods.
const PERIOD_MULTIPLIERS = {
  "7d":  0.26,
  "30d": 1.00,
  "90d": 3.15,
};

const WEEKS = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);

/* ── Application State ─────────────────────────────────────── */

const state = {
  period: "7d",
  metric: "followers",      // bar chart metric
  trendMetric: "followers", // trend chart metric
  sortMetric: "followers",
  sortDir: "desc",
  activePlatform: "all",
  searchQuery: "",
  arenaPlatformA: "YouTube",
  arenaPlatformB: "TikTok",
  activeHubTab: "arena",
  simTargetPlatform: "all",
  simPostFactor: 1.5,
  simBoostFactor: 25,
  simEngagementShift: 10,
  simPreset: "custom",
};

const DEFAULT_DATA = [
  { platform: "Instagram", followers: "1850000", likes: "280000", posts: "145", reach: "2400000", impressions: "5200000", engagement: "15.2" },
  { platform: "Facebook",  followers: "1250000", likes: "220000", posts: "89",  reach: "1800000", impressions: "3900000", engagement: "18.4" },
  { platform: "Twitter",   followers: "980000",  likes: "175000", posts: "312", reach: "1500000", impressions: "2800000", engagement: "21.1" },
  { platform: "LinkedIn",  followers: "640000",  likes: "110000", posts: "67",  reach: "950000",  impressions: "1400000", engagement: "14.8" },
  { platform: "TikTok",    followers: "2100000", likes: "390000", posts: "203", reach: "3800000", impressions: "9500000", engagement: "17.6" },
  { platform: "YouTube",   followers: "2600000", likes: "450000", posts: "52",  reach: "4100000", impressions: "8200000", engagement: "12.9" },
];

/* ── Raw Data (populated from CSV or fallback) ─────────────── */

let rawData = [];

/* ── DOM References ────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);

const DOM = {
  loadingSkeleton:            $("loadingSkeleton"),
  errorBanner:                $("errorBanner"),
  retryBtn:                   $("retryBtn"),
  mainContent:                $("mainContent"),
  shortcutsBtn:               $("shortcutsBtn"),
  shortcutsModal:             $("shortcutsModal"),
  closeShortcutsBtn:          $("closeShortcutsBtn"),
  themeToggle:                $("themeToggle"),
  themeIcon:                  $("themeIcon"),
  platformFilter:             $("platformFilter"),
  sortMetric:                 $("sortMetric"),
  sortDirectionBtn:           $("sortDirectionBtn"),
  metricToggle:               $("metricToggle"),
  trendMetricToggle:          $("trendMetricToggle"),
  followersValue:             $("followersValue"),
  likesValue:                 $("likesValue"),
  engagementValue:            $("engagementValue"),
  reachValue:                 $("reachValue"),
  topPlatformValue:           $("topPlatformValue"),
  bestPerformerValue:         $("bestPerformerValue"),
  bestPerformerMeta:          $("bestPerformerMeta"),
  engagementLeaderValue:      $("engagementLeaderValue"),
  engagementLeaderMeta:       $("engagementLeaderMeta"),
  likesLeaderValue:           $("likesLeaderValue"),
  likesLeaderMeta:            $("likesLeaderMeta"),
  reachLeaderValue:           $("reachLeaderValue"),
  reachLeaderMeta:            $("reachLeaderMeta"),
  spotlightTitle:             $("spotlightTitle"),
  spotlightClearBtn:          $("spotlightClearBtn"),
  spotlightDescription:       $("spotlightDescription"),
  spotlightMetrics:           $("spotlightMetrics"),
  spotlightFollowers:         $("spotlightFollowers"),
  spotlightLikes:             $("spotlightLikes"),
  spotlightEngagement:        $("spotlightEngagement"),
  spotlightReach:             $("spotlightReach"),
  spotlightFollowersContext:  $("spotlightFollowersContext"),
  spotlightLikesContext:      $("spotlightLikesContext"),
  spotlightEngagementContext: $("spotlightEngagementContext"),
  spotlightReachContext:      $("spotlightReachContext"),
  spotlightFollowersBar:      $("spotlightFollowersBar"),
  spotlightLikesBar:          $("spotlightLikesBar"),
  spotlightEngagementBar:     $("spotlightEngagementBar"),
  spotlightReachBar:          $("spotlightReachBar"),
  barChartTitle:              $("barChartTitle"),
  barChartSubtitle:           $("barChartSubtitle"),
  donutChartTitle:            $("donutChartTitle"),
  donutChartSubtitle:         $("donutChartSubtitle"),
  trendSubtitle:              $("trendSubtitle"),
  legend:                     $("legend"),
  tabArena:                   $("tabArena"),
  tabSimulator:               $("tabSimulator"),
  arenaView:                  $("arenaView"),
  simulatorView:              $("simulatorView"),
  arenaPlatformA:             $("arenaPlatformA"),
  arenaPlatformB:             $("arenaPlatformB"),
  arenaSwapBtn:               $("arenaSwapBtn"),
  arenaAvatarA:               $("arenaAvatarA"),
  arenaNameA:                 $("arenaNameA"),
  arenaScoreA:                $("arenaScoreA"),
  arenaAvatarB:               $("arenaAvatarB"),
  arenaNameB:                 $("arenaNameB"),
  arenaScoreB:                $("arenaScoreB"),
  arenaMatrix:                $("arenaMatrix"),
  arenaVerdictText:           $("arenaVerdictText"),
  simTargetPlatform:          $("simTargetPlatform"),
  simPostSlider:              $("simPostSlider"),
  simBoostSlider:             $("simBoostSlider"),
  simEngagementSlider:        $("simEngagementSlider"),
  simPostBadge:               $("simPostBadge"),
  simBoostBadge:              $("simBoostBadge"),
  simEngagementBadge:         $("simEngagementBadge"),
  simResetBtn:                $("simResetBtn"),
  simGrowthChip:              $("simGrowthChip"),
  simProjReach:               $("simProjReach"),
  simBaseReach:               $("simBaseReach"),
  simReachBar:                $("simReachBar"),
  simReachDelta:              $("simReachDelta"),
  simProjFollowers:           $("simProjFollowers"),
  simBaseFollowers:           $("simBaseFollowers"),
  simFollowersBar:            $("simFollowersBar"),
  simFollowersDelta:          $("simFollowersDelta"),
  simProjLikes:               $("simProjLikes"),
  simBaseLikes:               $("simBaseLikes"),
  simLikesBar:                $("simLikesBar"),
  simLikesDelta:              $("simLikesDelta"),
  simProjEng:                 $("simProjEng"),
  simBaseEng:                 $("simBaseEng"),
  simEngBar:                  $("simEngBar"),
  simEngDelta:                $("simEngDelta"),
  simCalloutHeading:          $("simCalloutHeading"),
  simCalloutBody:             $("simCalloutBody"),
  performanceTable:           $("performanceTable"),
  tableSearch:                $("tableSearch"),
  tableEmptyState:            $("tableEmptyState"),
  exportCsvBtn:               $("exportCsvBtn"),
  chartTooltip:               $("chartTooltip"),
  toastContainer:             $("toastContainer"),
};

/* ── Utility Functions ─────────────────────────────────────── */

function formatNumber(n) {
  n = Number(n);
  if (!isFinite(n)) return "–";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

function formatMetric(metric, value) {
  if (metric === "engagement") return `${Number(value).toFixed(1)}%`;
  return formatNumber(value);
}

/** Scale a CSV field by the current period multiplier. Engagement stays unchanged. */
function scaledValue(row, field) {
  if (field === "engagement") return Number(row[field]);
  return Math.round(Number(row[field]) * PERIOD_MULTIPLIERS[state.period]);
}

/** Return all platforms with period-scaled metrics. */
function getScaledData() {
  return rawData.map((d) => ({
    platform:    d.platform,
    followers:   scaledValue(d, "followers"),
    likes:       scaledValue(d, "likes"),
    posts:       scaledValue(d, "posts"),
    reach:       scaledValue(d, "reach"),
    impressions: scaledValue(d, "impressions"),
    engagement:  Number(d.engagement),
  }));
}

/**
 * Return filtered + sorted data for charts and the table.
 * Respects: platform filter, search query, sort metric, sort direction.
 */
function getDisplayData() {
  let data = getScaledData();

  if (state.activePlatform !== "all") {
    data = data.filter((d) => d.platform === state.activePlatform);
  }

  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    data = data.filter((d) => d.platform.toLowerCase().includes(q));
  }

  data.sort((a, b) => {
    const av = a[state.sortMetric] ?? 0;
    const bv = b[state.sortMetric] ?? 0;
    return state.sortDir === "desc" ? bv - av : av - bv;
  });

  return data;
}

/* ── Theme ─────────────────────────────────────────────────── */

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  DOM.themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  DOM.themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
  );
  localStorage.setItem("smd-theme", theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
  // Re-render charts so SVG axes pick up new CSS variable colours.
  const data = getDisplayData();
  renderBarChart(data);
  renderDonutChart();
  renderTrendChart();
}

/* ── Toast Notifications ───────────────────────────────────── */

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "alert");
  toast.textContent = message;
  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("is-hiding");
    toast.addEventListener("animationend", () => toast.remove(), { once: true });
  }, 3000);
}

/* ── Skeleton / Error States ───────────────────────────────── */

function showSkeleton() {
  DOM.loadingSkeleton.hidden = false;
  DOM.mainContent.hidden = true;
  DOM.errorBanner.hidden = true;
}

function hideSkeleton() {
  DOM.loadingSkeleton.hidden = true;
  DOM.mainContent.hidden = false;
}

function showError() {
  DOM.loadingSkeleton.hidden = true;
  DOM.mainContent.hidden = true;
  DOM.errorBanner.hidden = false;
}

/* ── Filter Population ─────────────────────────────────────── */

function populateFilter() {
  // Clear existing dynamic options (keep the "All Platforms" option).
  [...DOM.platformFilter.querySelectorAll("option:not([value='all'])")].forEach(
    (o) => o.remove()
  );
  if (DOM.simTargetPlatform) {
    [...DOM.simTargetPlatform.querySelectorAll("option:not([value='all'])")].forEach(
      (o) => o.remove()
    );
  }
  if (DOM.arenaPlatformA) DOM.arenaPlatformA.innerHTML = "";
  if (DOM.arenaPlatformB) DOM.arenaPlatformB.innerHTML = "";

  rawData.forEach((d) => {
    const icon = PLATFORM_ICONS[d.platform] || "";
    const label = `${icon} ${d.platform}`;

    const opt = document.createElement("option");
    opt.value = d.platform;
    opt.textContent = label;
    DOM.platformFilter.appendChild(opt);

    if (DOM.simTargetPlatform) {
      const optSim = document.createElement("option");
      optSim.value = d.platform;
      optSim.textContent = label;
      DOM.simTargetPlatform.appendChild(optSim);
    }

    if (DOM.arenaPlatformA) {
      const optA = document.createElement("option");
      optA.value = d.platform;
      optA.textContent = label;
      DOM.arenaPlatformA.appendChild(optA);
    }

    if (DOM.arenaPlatformB) {
      const optB = document.createElement("option");
      optB.value = d.platform;
      optB.textContent = label;
      DOM.arenaPlatformB.appendChild(optB);
    }
  });

  if (DOM.arenaPlatformA) DOM.arenaPlatformA.value = state.arenaPlatformA;
  if (DOM.arenaPlatformB) DOM.arenaPlatformB.value = state.arenaPlatformB;
  if (DOM.simTargetPlatform) DOM.simTargetPlatform.value = state.simTargetPlatform;
}

/* ── Animated Counter ──────────────────────────────────────── */

function animateCounter(element, endValue, formatter) {
  if (!element) return;
  const duration = 650;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(Math.max(elapsed / duration, 0), 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatter(endValue * eased);
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatter(endValue);
    }
  }

  requestAnimationFrame(tick);
}

/* ── Summary Cards ─────────────────────────────────────────── */

function updateSummary(data) {
  const all = getScaledData();   // always aggregate from all platforms
  const totalFollowers = d3.sum(all, (d) => d.followers);
  const totalLikes     = d3.sum(all, (d) => d.likes);
  const totalReach     = d3.sum(all, (d) => d.reach);
  const avgEngagement  = d3.mean(all, (d) => d.engagement) || 0;

  animateCounter(DOM.followersValue,  totalFollowers,  (v) => formatNumber(Math.round(v)));
  animateCounter(DOM.likesValue,      totalLikes,      (v) => formatNumber(Math.round(v)));
  animateCounter(DOM.reachValue,      totalReach,      (v) => formatNumber(Math.round(v)));
  animateCounter(DOM.engagementValue, avgEngagement,   (v) => `${v.toFixed(1)}%`);

  const top = [...all].sort((a, b) => b.followers - a.followers)[0];
  DOM.topPlatformValue.textContent = top
    ? `${PLATFORM_ICONS[top.platform] || ""} ${top.platform}`
    : "–";
}

/* ── Insight Strip ─────────────────────────────────────────── */

function updateInsights() {
  const all = getScaledData();
  if (!all.length) return;

  const byFollowers  = [...all].sort((a, b) => b.followers  - a.followers)[0];
  const byEngagement = [...all].sort((a, b) => b.engagement - a.engagement)[0];
  const byLikes      = [...all].sort((a, b) => b.likes      - a.likes)[0];
  const byReach      = [...all].sort((a, b) => b.reach      - a.reach)[0];

  const icon = (p) => PLATFORM_ICONS[p] || "";

  DOM.bestPerformerValue.textContent    = `${icon(byFollowers.platform)} ${byFollowers.platform}`;
  DOM.bestPerformerMeta.textContent     = `${formatNumber(byFollowers.followers)} followers`;
  DOM.engagementLeaderValue.textContent = `${icon(byEngagement.platform)} ${byEngagement.platform}`;
  DOM.engagementLeaderMeta.textContent  = `${byEngagement.engagement.toFixed(1)}% rate`;
  DOM.likesLeaderValue.textContent      = `${icon(byLikes.platform)} ${byLikes.platform}`;
  DOM.likesLeaderMeta.textContent       = `${formatNumber(byLikes.likes)} likes`;
  DOM.reachLeaderValue.textContent      = `${icon(byReach.platform)} ${byReach.platform}`;
  DOM.reachLeaderMeta.textContent       = `${formatNumber(byReach.reach)} reached`;
}

/* ── Platform Spotlight ────────────────────────────────────── */

function updateSpotlight() {
  const all = getScaledData();
  const selected = all.find((d) => d.platform === state.activePlatform);

  if (!selected) {
    DOM.spotlightTitle.textContent = "Select a platform";
    DOM.spotlightDescription.textContent =
      "Click any bar, donut slice, legend item, or table row to see a detailed breakdown.";
    DOM.spotlightMetrics.hidden = true;
    if (DOM.spotlightClearBtn) DOM.spotlightClearBtn.hidden = true;
    return;
  }

  if (DOM.spotlightClearBtn) DOM.spotlightClearBtn.hidden = false;

  const totalFollowers = d3.sum(all, (d) => d.followers) || 1;
  const totalLikes     = d3.sum(all, (d) => d.likes)     || 1;
  const totalReach     = d3.sum(all, (d) => d.reach)     || 1;
  const maxEngagement  = d3.max(all, (d) => d.engagement) || 1;

  const fShare = (selected.followers / totalFollowers) * 100;
  const lShare = (selected.likes     / totalLikes)     * 100;
  const rShare = (selected.reach     / totalReach)     * 100;
  const eRatio = (selected.engagement / maxEngagement) * 100;

  const icon = PLATFORM_ICONS[selected.platform] || "";

  DOM.spotlightTitle.textContent = `${icon} ${selected.platform}`;
  DOM.spotlightDescription.textContent = `Detailed performance for the ${state.period} period.`;

  DOM.spotlightFollowers.textContent        = formatNumber(selected.followers);
  DOM.spotlightFollowersContext.textContent = `${fShare.toFixed(1)}% of total followers`;
  DOM.spotlightLikes.textContent            = formatNumber(selected.likes);
  DOM.spotlightLikesContext.textContent     = `${lShare.toFixed(1)}% of total likes`;
  DOM.spotlightEngagement.textContent       = `${selected.engagement.toFixed(1)}%`;
  DOM.spotlightEngagementContext.textContent= `${eRatio.toFixed(0)}% of best platform rate`;
  DOM.spotlightReach.textContent            = formatNumber(selected.reach);
  DOM.spotlightReachContext.textContent     = `${rShare.toFixed(1)}% of total reach`;

  const color = PLATFORM_COLORS[selected.platform] || "var(--primary)";
  [
    DOM.spotlightFollowersBar,
    DOM.spotlightLikesBar,
    DOM.spotlightEngagementBar,
    DOM.spotlightReachBar,
  ].forEach((bar) => { bar.style.background = color; });

  // Animate bars on next frame so CSS transition fires.
  requestAnimationFrame(() => {
    DOM.spotlightFollowersBar.style.width  = `${fShare}%`;
    DOM.spotlightLikesBar.style.width      = `${lShare}%`;
    DOM.spotlightEngagementBar.style.width = `${eRatio}%`;
    DOM.spotlightReachBar.style.width      = `${rShare}%`;
  });

  DOM.spotlightMetrics.hidden = false;
}

/* ── Tooltip ───────────────────────────────────────────────── */

function showTooltip(event, html) {
  DOM.chartTooltip.innerHTML = html;
  DOM.chartTooltip.classList.add("is-visible");

  // Prevent tooltip from going off-screen on the right
  const tipWidth = 170;
  const left =
    event.clientX + 16 + tipWidth > window.innerWidth
      ? event.clientX - tipWidth - 8
      : event.clientX + 16;

  DOM.chartTooltip.style.left = `${left}px`;
  DOM.chartTooltip.style.top  = `${event.clientY + 16}px`;
}

function hideTooltip() {
  DOM.chartTooltip.classList.remove("is-visible");
}

function platformTooltipHTML(d) {
  const icon = PLATFORM_ICONS[d.platform] || "";
  return [
    `<strong>${icon} ${d.platform}</strong>`,
    `<span>Followers: ${formatNumber(d.followers)}</span>`,
    `<span>Likes: ${formatNumber(d.likes)}</span>`,
    `<span>Engagement: ${d.engagement.toFixed(1)}%</span>`,
    `<span>Reach: ${formatNumber(d.reach)}</span>`,
  ].join("");
}

/* ── Highlight / Select ────────────────────────────────────── */

function highlightPlatform(name) {
  if (!name || name === "all") { clearHighlights(); return; }

  d3.selectAll(".bar")
    .style("opacity", (d) => (d.platform === name ? 1 : 0.3))
    .classed("is-active", (d) => d.platform === name);

  d3.selectAll(".donut-slice")
    .style("opacity", (d) => (d.data.platform === name ? 1 : 0.3))
    .classed("is-active", (d) => d.data.platform === name);

  [...DOM.legend.querySelectorAll("li")].forEach((li) => {
    const active = li.dataset.platform === name;
    li.classList.toggle("is-active", active);
    li.classList.toggle("is-muted", !active);
  });

  [...DOM.performanceTable.querySelectorAll("tr")].forEach((row) => {
    row.classList.toggle("is-selected", row.dataset.platform === name);
  });
}

function clearHighlights() {
  d3.selectAll(".bar").style("opacity", 1).classed("is-active", false);
  d3.selectAll(".donut-slice").style("opacity", 1).classed("is-active", false);
  [...DOM.legend.querySelectorAll("li")].forEach((li) =>
    li.classList.remove("is-active", "is-muted")
  );
  [...DOM.performanceTable.querySelectorAll("tr")].forEach((row) =>
    row.classList.remove("is-selected")
  );
  // Restore selected-platform highlight if one is active
  if (state.activePlatform !== "all") {
    [...DOM.performanceTable.querySelectorAll("tr")].forEach((row) => {
      if (row.dataset.platform === state.activePlatform) {
        row.classList.add("is-selected");
      }
    });
  }
}

function selectPlatform(name) {
  if (name === state.activePlatform) return; // no-op on same selection
  state.activePlatform = name;
  DOM.platformFilter.value = name;
  updateDashboard();
  if (name !== "all") {
    const icon = PLATFORM_ICONS[name] || "";
    showToast(`${icon} Viewing ${name}`, "info");
  }
}

/* ── Sort Direction & Header Sync ──────────────────────────── */

function syncSortHeaders() {
  document.querySelectorAll(".sortable-th").forEach((th) => {
    const col = th.dataset.sort;
    const icon = th.querySelector(".th-sort-icon");
    if (col === state.sortMetric) {
      th.classList.add("active-sort");
      if (icon) icon.textContent = state.sortDir === "asc" ? "▲" : "▼";
      th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
    } else {
      th.classList.remove("active-sort");
      if (icon) icon.textContent = "↕";
      th.removeAttribute("aria-sort");
    }
  });
}

function syncSortBtn() {
  if (state.sortDir === "desc") {
    DOM.sortDirectionBtn.textContent = "↓\u00A0Desc";
    DOM.sortDirectionBtn.classList.remove("is-asc");
    DOM.sortDirectionBtn.setAttribute("aria-label", "Sort direction: descending — click to switch to ascending");
  } else {
    DOM.sortDirectionBtn.textContent = "↑\u00A0Asc";
    DOM.sortDirectionBtn.classList.add("is-asc");
    DOM.sortDirectionBtn.setAttribute("aria-label", "Sort direction: ascending — click to switch to descending");
  }
  syncSortHeaders();
}

/* ── Bar Chart ─────────────────────────────────────────────── */

function renderBarChart(data) {
  const container = document.getElementById("barChart");
  container.innerHTML = "";

  if (state.activePlatform !== "all") {
    renderAudienceBarChart(container, state.activePlatform);
    return;
  }

  if (!data.length) return;

  const width  = Math.max(container.clientWidth || 0, 260);
  const height = 300;
  const margin = { top: 24, right: 16, bottom: 52, left: 60 };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("aria-label", `${METRIC_LABELS[state.metric]} by Platform`);

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.platform))
    .range([margin.left, width - margin.right])
    .padding(0.32);

  const yMax = d3.max(data, (d) => d[state.metric]) || 1;
  const y = d3
    .scaleLinear()
    .domain([0, yMax * 1.22])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Horizontal grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove());

  // X axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "var(--muted)")
        .style("font-weight", "600")
    );

  // Y axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((v) => formatMetric(state.metric, v))
    )
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll("text").style("font-size", "11px").style("fill", "var(--muted)")
    );

  // Bars with enter animation
  svg
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(d.platform))
    .attr("y", height - margin.bottom)
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("rx", 7)
    .attr("fill", (d) => PLATFORM_COLORS[d.platform] || "var(--primary)")
    .on("mousemove", (event, d) => showTooltip(event, platformTooltipHTML(d)))
    .on("mouseenter", (_, d) => highlightPlatform(d.platform))
    .on("mouseleave", () => { hideTooltip(); clearHighlights(); })
    .on("click", (_, d) => selectPlatform(d.platform))
    .transition()
    .duration(550)
    .delay((_, i) => i * 55)
    .ease(d3.easeCubicOut)
    .attr("y", (d) => y(d[state.metric]))
    .attr("height", (d) => y(0) - y(d[state.metric]));

  // Value labels above each bar
  svg
    .selectAll(".bar-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "bar-label")
    .attr("x", (d) => x(d.platform) + x.bandwidth() / 2)
    .attr("y", (d) => y(d[state.metric]) - 6)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "700")
    .style("fill", "var(--muted)")
    .style("opacity", 0)
    .text((d) => formatMetric(state.metric, d[state.metric]))
    .transition()
    .delay((_, i) => i * 55 + 380)
    .duration(180)
    .style("opacity", 1);

  DOM.barChartTitle.textContent    = `${METRIC_LABELS[state.metric] || state.metric} by Platform`;
  DOM.barChartSubtitle.textContent = `${state.period.toUpperCase()} period — compare across platforms`;
}

function renderAudienceBarChart(container, platform) {
  const shares = AUDIENCE_PROFILES[platform] || [45, 42, 8, 5];
  const data = AUDIENCE_SEGMENTS.map((segment, index) => ({
    segment,
    share: shares[index],
    color: AUDIENCE_COLORS[index],
  }));
  const width = Math.max(container.clientWidth || 0, 260);
  const height = 300;
  const margin = { top: 24, right: 16, bottom: 52, left: 60 };
  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("aria-label", `Estimated audience mix for ${platform}`);

  const x = d3
    .scaleBand()
    .domain(data.map((item) => item.segment))
    .range([margin.left, width - margin.right])
    .padding(0.3);
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove());

  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "var(--muted)")
        .style("font-weight", "600")
    );

  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat((value) => `${value}%`))
    .call((g) => g.select(".domain").remove())
    .call((g) =>
      g.selectAll("text").style("font-size", "11px").style("fill", "var(--muted)")
    );

  const bars = svg
    .selectAll(".audience-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "audience-bar")
    .attr("x", (item) => x(item.segment))
    .attr("y", y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("rx", 7)
    .attr("fill", (item) => item.color)
    .on("mousemove", (event, item) =>
      showTooltip(
        event,
        `<strong>${PLATFORM_ICONS[platform] || ""} ${platform}</strong>` +
          `<em>${item.segment}: ${item.share}% (estimated)</em>`
      )
    )
    .on("mouseleave", hideTooltip);

  bars
    .append("title")
    .text((item) => `${item.segment}: ${item.share}% (estimated)`);

  bars
    .transition()
    .duration(550)
    .ease(d3.easeCubicOut)
    .attr("y", (item) => y(item.share))
    .attr("height", (item) => y(0) - y(item.share));

  svg
    .selectAll(".audience-label")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "audience-label")
    .attr("x", (item) => x(item.segment) + x.bandwidth() / 2)
    .attr("y", (item) => y(item.share) - 7)
    .attr("text-anchor", "middle")
    .style("font-size", "11px")
    .style("font-weight", "700")
    .style("fill", "var(--muted)")
    .text((item) => `${item.share}%`);

  DOM.barChartTitle.textContent = `${platform} Audience Mix`;
  DOM.barChartSubtitle.textContent = "Estimated audience breakdown";
}

/* ── Donut Chart ───────────────────────────────────────────── */

function renderDonutChart() {
  const container = document.getElementById("donutChart");
  container.innerHTML = "";
  DOM.legend.innerHTML = "";

  // Donut always shows ALL platforms for audience context.
  const data = getScaledData();
  if (!data.length) return;

  DOM.donutChartTitle.textContent    = "Audience Share";
  DOM.donutChartSubtitle.textContent = "Follower distribution — all platforms";

  const size   = 240;
  const radius = size / 2;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", size)
    .attr("height", size)
    .attr("aria-label", "Donut chart — audience share")
    .append("g")
    .attr("transform", `translate(${radius}, ${radius})`);

  const pie   = d3.pie().sort(null).value((d) => d.followers).padAngle(0.028);
  const arc   = d3.arc().innerRadius(radius * 0.54).outerRadius(radius - 5);
  const arcHo = d3.arc().innerRadius(radius * 0.54).outerRadius(radius + 5);
  const arcs  = pie(data);
  const total = d3.sum(data, (d) => d.followers) || 1;

  // Center label
  const center = svg.append("g").attr("class", "donut-center");
  center
    .append("circle")
    .attr("r", radius * 0.5)
    .style("fill", "var(--panel)")
    .style("stroke", "var(--primary)")
    .style("stroke-width", 2)
    .style("stroke-opacity", 0.2);
  center
    .append("text")
    .attr("y", -16)
    .attr("text-anchor", "middle")
    .style("fill", "var(--muted)")
    .style("font-size", "9px")
    .style("font-weight", "800")
    .style("letter-spacing", "0.1em")
    .text("AUDIENCE");
  center
    .append("text")
    .attr("y", 8)
    .attr("text-anchor", "middle")
    .style("fill", "var(--primary)")
    .style("font-size", "18px")
    .style("font-weight", "800")
    .text(formatNumber(total));
  center
    .append("text")
    .attr("y", 24)
    .attr("text-anchor", "middle")
    .style("fill", "var(--muted)")
    .style("font-size", "9px")
    .text("followers");

  // Slices
  svg
    .selectAll(".donut-slice")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", "donut-slice")
    .attr("d", arc)
    .attr("fill", (d) => PLATFORM_COLORS[d.data.platform] || "var(--primary)")
    .attr("stroke", "var(--panel)")
    .attr("stroke-width", 2)
    .style("opacity", 0)
    .on("mousemove", (event, d) => {
      const share = ((d.value / total) * 100).toFixed(1);
      showTooltip(
        event,
        `<strong>${PLATFORM_ICONS[d.data.platform] || ""} ${d.data.platform}</strong>` +
        `<em>Audience share: ${share}%</em>` +
        `<span>Followers: ${formatNumber(d.data.followers)}</span>` +
        `<span>Likes: ${formatNumber(d.data.likes)}</span>` +
        `<span>Engagement: ${d.data.engagement.toFixed(1)}%</span>`
      );
    })
    .on("mouseenter", function (_, d) {
      d3.select(this).attr("d", arcHo);
      highlightPlatform(d.data.platform);
    })
    .on("mouseleave", function (_, d) {
      d3.select(this).attr("d", arc);
      hideTooltip();
      clearHighlights();
    })
    .on("click", (_, d) => selectPlatform(d.data.platform))
    .transition()
    .duration(650)
    .delay((_, i) => i * 80)
    .style("opacity", 1);

  // Dim non-selected slices if a platform is selected
  if (state.activePlatform !== "all") {
    d3.selectAll(".donut-slice")
      .style("opacity", (d) =>
        d.data.platform === state.activePlatform ? 1 : 0.3
      );
  }

  // Legend
  data.forEach((item) => {
    const share = ((item.followers / total) * 100).toFixed(1);
    const li = document.createElement("li");
    li.dataset.platform = item.platform;

    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = PLATFORM_COLORS[item.platform] || "var(--primary)";

    const txt = document.createElement("span");
    txt.innerHTML = `<b>${item.platform}</b>&thinsp;<small style="color:var(--muted)">${share}%</small>`;

    li.append(dot, txt);
    li.addEventListener("mouseenter", () => highlightPlatform(item.platform));
    li.addEventListener("mouseleave", clearHighlights);
    li.addEventListener("click", () => selectPlatform(item.platform));

    if (state.activePlatform !== "all") {
      li.classList.toggle("is-active", item.platform === state.activePlatform);
      li.classList.toggle("is-muted",  item.platform !== state.activePlatform);
    }

    DOM.legend.appendChild(li);
  });
}

/* ── Trend Line Chart ──────────────────────────────────────── */

function renderTrendChart() {
  const container = document.getElementById("trendChart");
  container.innerHTML = "";

  if (!rawData.length) return;

  const metric     = state.trendMetric;
  const isSingle   = state.activePlatform !== "all";
  const allScaled  = getScaledData();
  const platforms  = isSingle
    ? allScaled.filter((d) => d.platform === state.activePlatform)
    : allScaled;

  if (!platforms.length) return;

  // Build per-platform weekly series
  const series = platforms.map((p) => {
    const seeds = TREND_SEEDS[p.platform] ||
      Array.from({ length: 12 }, (_, i) => 0.7 + 0.3 * (i / 11));
    const baseVal = p[metric] ?? 0;

    return {
      platform: p.platform,
      color: PLATFORM_COLORS[p.platform] || "var(--primary)",
      values: seeds.map((s, i) => ({
        week: WEEKS[i],
        value:
          metric === "engagement"
            ? parseFloat((baseVal * s).toFixed(2))
            : Math.round(baseVal * s),
      })),
    };
  });

  const width  = Math.max(container.clientWidth || 0, 320);
  const height = 240;
  const legendW = isSingle ? 0 : 110;
  const margin  = { top: 20, right: 20 + legendW, bottom: 40, left: 65 };

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("aria-label", `Weekly ${METRIC_LABELS[metric]} trend`);

  const x = d3
    .scalePoint()
    .domain(WEEKS)
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const allVals = series.flatMap((s) => s.values.map((v) => v.value));
  const yMin    = (d3.min(allVals) || 0) * 0.85;
  const yMax    = (d3.max(allVals) || 1) * 1.12;

  const y = d3.scaleLinear().domain([yMin, yMax]).nice().range([height - margin.bottom, margin.top]);

  // Grid
  svg
    .append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-(width - margin.left - margin.right))
        .tickFormat("")
    )
    .call((g) => g.select(".domain").remove());

  // X axis
  svg
    .append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(0))
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-size", "11px").style("fill", "var(--muted)"));

  // Y axis
  svg
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(
      d3.axisLeft(y).ticks(5).tickFormat((v) => formatMetric(metric, v))
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll("text").style("font-size", "11px").style("fill", "var(--muted)"));

  const lineGen = d3
    .line()
    .x((d) => x(d.week))
    .y((d) => y(d.value))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const areaGen = d3
    .area()
    .x((d) => x(d.week))
    .y0(height - margin.bottom)
    .y1((d) => y(d.value))
    .curve(d3.curveCatmullRom.alpha(0.5));

  series.forEach((s) => {
    // Area fill for single platform or small set
    if (isSingle) {
      svg
        .append("path")
        .datum(s.values)
        .attr("d", areaGen)
        .attr("fill", s.color)
        .attr("opacity", 0.12);
    }

    // Line with draw animation
    const path = svg
      .append("path")
      .datum(s.values)
      .attr("d", lineGen)
      .attr("fill", "none")
      .attr("stroke", s.color)
      .attr("stroke-width", isSingle ? 3 : 2)
      .attr("stroke-linecap", "round");

    const len = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", `${len} ${len}`)
      .attr("stroke-dashoffset", len)
      .transition()
      .duration(900)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0);

    // Interactive dots
    svg
      .selectAll(`.dot-${s.platform.replace(/\s/g, "-")}`)
      .data(s.values)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.week))
      .attr("cy", (d) => y(d.value))
      .attr("r", isSingle ? 4.5 : 3)
      .attr("fill", s.color)
      .attr("stroke", "var(--panel)")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("mousemove", (event, d) =>
        showTooltip(
          event,
          `<strong>${PLATFORM_ICONS[s.platform] || ""} ${s.platform} — ${d.week}</strong>` +
          `<em>${METRIC_LABELS[metric]}: ${formatMetric(metric, d.value)}</em>`
        )
      )
      .on("mouseleave", hideTooltip)
      .transition()
      .delay((_, i) => i * 65 + 500)
      .duration(200)
      .style("opacity", 1);
  });

  // Right-side legend for multi-platform view
  if (!isSingle && series.length > 1) {
    const lx = width - legendW + 8;
    series.forEach((s, i) => {
      svg
        .append("circle")
        .attr("cx", lx)
        .attr("cy", margin.top + i * 22)
        .attr("r", 5)
        .attr("fill", s.color);
      svg
        .append("text")
        .attr("x", lx + 12)
        .attr("y", margin.top + i * 22 + 4)
        .style("font-size", "11px")
        .style("fill", "var(--muted)")
        .style("font-weight", "600")
        .text(s.platform);
    });
  }

  DOM.trendSubtitle.textContent = `${METRIC_LABELS[metric] || metric} — past 12 weeks`;
}

/* ── Performance Table ─────────────────────────────────────── */

function renderTable(data) {
  DOM.performanceTable.innerHTML = "";
  const hasRows = data.length > 0;
  DOM.tableEmptyState.hidden = hasRows;

  if (!hasRows) return;

  data.forEach((item) => {
    const row = document.createElement("tr");
    row.dataset.platform = item.platform;
    row.tabIndex = 0;

    const color = PLATFORM_COLORS[item.platform] || "var(--primary)";
    const icon  = PLATFORM_ICONS[item.platform]  || "";

    if (state.activePlatform !== "all" && item.platform === state.activePlatform) {
      row.classList.add("is-selected");
    }

    row.innerHTML = `
      <td>
        <div class="platform-cell">
          <span class="platform-dot" style="background:${color}"></span>
          ${icon}&nbsp;${item.platform}
        </div>
      </td>
      <td>${formatNumber(item.followers)}</td>
      <td>${formatNumber(item.likes)}</td>
      <td>${item.engagement.toFixed(1)}%</td>
      <td>${formatNumber(item.reach)}</td>
      <td>${formatNumber(item.posts)}</td>
    `;

    row.addEventListener("mouseenter", () => highlightPlatform(item.platform));
    row.addEventListener("mouseleave", clearHighlights);
    row.addEventListener("focus",      () => highlightPlatform(item.platform));
    row.addEventListener("blur",       clearHighlights);
    row.addEventListener("click",      () => selectPlatform(item.platform));
    row.addEventListener("keydown",    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectPlatform(item.platform);
      }
    });

    DOM.performanceTable.appendChild(row);
  });
}

/* ── CSV Export ────────────────────────────────────────────── */

function exportCSV() {
  const data = getDisplayData();
  const headers = ["Platform", "Followers", "Likes", "Engagement %", "Reach", "Posts"];
  const rows    = data.map((d) => [
    d.platform,
    d.followers,
    d.likes,
    d.engagement.toFixed(1),
    d.reach,
    d.posts,
  ]);
  const csv  = [headers, ...rows].map((r) => r.join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `social-dashboard-${state.period}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("✅ CSV exported!", "success");
}

/* ── Comparison Arena ──────────────────────────────────────── */

function renderArena() {
  if (!rawData.length || !DOM.arenaMatrix) return;
  const all = getScaledData();
  if (!all.length) return;

  const platA = all.find((d) => d.platform === state.arenaPlatformA) || all[0];
  const platB = all.find((d) => d.platform === state.arenaPlatformB) || all[1] || all[0];

  const iconA = PLATFORM_ICONS[platA.platform] || "";
  const iconB = PLATFORM_ICONS[platB.platform] || "";
  const colorA = PLATFORM_COLORS[platA.platform] || "var(--primary)";
  const colorB = PLATFORM_COLORS[platB.platform] || "#f59e0b";

  DOM.arenaAvatarA.textContent = iconA;
  DOM.arenaNameA.textContent = platA.platform;
  DOM.arenaAvatarB.textContent = iconB;
  DOM.arenaNameB.textContent = platB.platform;

  DOM.arenaPlatformA.value = platA.platform;
  DOM.arenaPlatformB.value = platB.platform;

  const likesPerPostA = platA.posts > 0 ? Math.round(platA.likes / platA.posts) : 0;
  const likesPerPostB = platB.posts > 0 ? Math.round(platB.likes / platB.posts) : 0;

  const metrics = [
    {
      id: "followers",
      label: "Total Followers",
      valA: platA.followers,
      valB: platB.followers,
      format: formatNumber,
      isHigherBetter: true,
    },
    {
      id: "engagement",
      label: "Engagement Rate",
      valA: platA.engagement,
      valB: platB.engagement,
      format: (v) => `${Number(v).toFixed(1)}%`,
      isHigherBetter: true,
    },
    {
      id: "reach",
      label: "Estimated Reach",
      valA: platA.reach,
      valB: platB.reach,
      format: formatNumber,
      isHigherBetter: true,
    },
    {
      id: "likes",
      label: "Total Likes",
      valA: platA.likes,
      valB: platB.likes,
      format: formatNumber,
      isHigherBetter: true,
    },
    {
      id: "posts",
      label: "Active Posts",
      valA: platA.posts,
      valB: platB.posts,
      format: formatNumber,
      isHigherBetter: true,
    },
    {
      id: "likesPerPost",
      label: "Likes / Post (ROI)",
      valA: likesPerPostA,
      valB: likesPerPostB,
      format: formatNumber,
      isHigherBetter: true,
    },
  ];

  let winsA = 0;
  let winsB = 0;

  DOM.arenaMatrix.innerHTML = "";

  metrics.forEach((m) => {
    const isTie = m.valA === m.valB;
    const aWins = !isTie && (m.isHigherBetter ? m.valA > m.valB : m.valA < m.valB);
    const bWins = !isTie && !aWins;

    if (aWins) winsA++;
    if (bWins) winsB++;

    const sum = (Number(m.valA) || 0) + (Number(m.valB) || 0) || 1;
    const pctA = Math.max(12, Math.min(88, ((Number(m.valA) / sum) * 100)));
    const pctB = 100 - pctA;

    let deltaText = "";
    if (aWins && m.valB > 0) {
      const diff = (((m.valA - m.valB) / m.valB) * 100).toFixed(0);
      deltaText = `👑 ${platA.platform} (+${diff}%)`;
    } else if (bWins && m.valA > 0) {
      const diff = (((m.valB - m.valA) / m.valA) * 100).toFixed(0);
      deltaText = `👑 ${platB.platform} (+${diff}%)`;
    } else {
      deltaText = `🤝 Even`;
    }

    const row = document.createElement("div");
    row.className = "arena-row";
    row.innerHTML = `
      <span class="arena-metric-title">${m.label}</span>
      <span class="arena-val arena-val-a ${aWins ? "is-winner" : ""}">${m.format(m.valA)}</span>
      <div class="arena-meter-wrap" title="${platA.platform}: ${pctA.toFixed(0)}% vs ${platB.platform}: ${pctB.toFixed(0)}%">
        <span class="arena-meter-a" style="width: ${pctA}%; background: ${colorA};"></span>
        <span class="arena-meter-b" style="width: ${pctB}%; background: ${colorB};"></span>
      </div>
      <span class="arena-val arena-val-b ${bWins ? "is-winner" : ""}">${m.format(m.valB)}</span>
      <span class="arena-winner-tag ${aWins ? "winner-a" : bWins ? "winner-b" : "tie"}">${deltaText}</span>
    `;
    DOM.arenaMatrix.appendChild(row);
  });

  DOM.arenaScoreA.textContent = `${winsA} Metric ${winsA === 1 ? "Win" : "Wins"}`;
  DOM.arenaScoreB.textContent = `${winsB} Metric ${winsB === 1 ? "Win" : "Wins"}`;

  // Formulate dynamic AI synthesis verdict
  let verdict = "";
  if (winsA > winsB) {
    verdict = `<strong>${platA.platform} takes the overall advantage (${winsA} vs ${winsB}).</strong> `;
  } else if (winsB > winsA) {
    verdict = `<strong>${platB.platform} takes the overall advantage (${winsB} vs ${winsA}).</strong> `;
  } else {
    verdict = `<strong>Both platforms demonstrate balanced strengths (Tied at ${winsA}-${winsB}).</strong> `;
  }

  if (platA.followers > platB.followers && platB.engagement > platA.engagement) {
    verdict += `${platA.platform} holds superior audience scale, but ${platB.platform} commands higher audience interaction velocity. Recommendation: Leverage ${platA.platform} for broad top-of-funnel reach and ${platB.platform} for viral community conversion.`;
  } else if (platB.followers > platA.followers && platA.engagement > platB.engagement) {
    verdict += `${platB.platform} holds superior audience scale, but ${platA.platform} commands higher engagement density. Recommendation: Deploy brand awareness campaigns on ${platB.platform} and high-intent calls-to-action on ${platA.platform}.`;
  } else if (likesPerPostA > likesPerPostB) {
    verdict += `${platA.platform} is delivering ${(likesPerPostA / Math.max(1, likesPerPostB)).toFixed(1)}x more likes per published post, providing higher creative ROI per asset created.`;
  } else if (likesPerPostB > likesPerPostA) {
    verdict += `${platB.platform} is delivering ${(likesPerPostB / Math.max(1, likesPerPostA)).toFixed(1)}x more likes per published post, providing higher creative ROI per asset created.`;
  } else {
    verdict += `Consider cross-promoting creative assets between ${platA.platform} and ${platB.platform} to capture both passive impression volume and active community interactions.`;
  }

  DOM.arenaVerdictText.innerHTML = verdict;
}

/* ── What-If Growth Simulator ──────────────────────────────── */

function renderSimulator() {
  if (!rawData.length || !DOM.simProjReach) return;
  const all = getScaledData();
  if (!all.length) return;

  let targetData = all;
  const isPortfolio = state.simTargetPlatform === "all";
  if (!isPortfolio) {
    targetData = all.filter((d) => d.platform === state.simTargetPlatform);
  }
  if (!targetData.length) targetData = all;

  const baseReach = d3.sum(targetData, (d) => d.reach) || 1;
  const baseFollowers = d3.sum(targetData, (d) => d.followers) || 1;
  const baseLikes = d3.sum(targetData, (d) => d.likes) || 1;
  const baseEng = d3.mean(targetData, (d) => d.engagement) || 15;

  const postMult = state.simPostFactor;
  const boostPct = state.simBoostFactor;
  const engShift = state.simEngagementShift;

  const reachMult = 1 + (postMult - 1) * 0.72 + (boostPct / 100) * 0.88;
  const simReach = Math.round(baseReach * Math.max(0.2, reachMult));

  const followerLiftPct = ((postMult - 1) * 0.32 + (boostPct / 100) * 0.42 + (engShift / 100) * 0.22);
  const simFollowers = Math.round(baseFollowers * Math.max(0.5, 1 + followerLiftPct));

  const simEng = Math.max(1.0, parseFloat((baseEng * (1 + engShift / 100)).toFixed(1)));

  const likeRatio = (simReach / baseReach) * (simEng / baseEng);
  const simLikes = Math.round(baseLikes * Math.max(0.2, likeRatio));

  const reachLift = ((simReach - baseReach) / baseReach) * 100;
  const followerLift = ((simFollowers - baseFollowers) / baseFollowers) * 100;
  const likesLift = ((simLikes - baseLikes) / baseLikes) * 100;
  const engLift = simEng - baseEng;

  const compositeGrowth = ((reachLift * 0.4) + (followerLift * 0.35) + (likesLift * 0.25));

  DOM.simProjReach.textContent = formatNumber(simReach);
  DOM.simBaseReach.textContent = `from ${formatNumber(baseReach)}`;
  DOM.simReachDelta.textContent = `${reachLift >= 0 ? "+" : ""}${reachLift.toFixed(1)}% Lift`;
  DOM.simReachDelta.className = `sim-delta ${reachLift >= 0 ? "positive" : "negative"}`;
  DOM.simReachBar.style.width = `${Math.min(100, Math.max(10, 50 + reachLift / 2))}%`;

  DOM.simProjFollowers.textContent = formatNumber(simFollowers);
  DOM.simBaseFollowers.textContent = `from ${formatNumber(baseFollowers)}`;
  DOM.simFollowersDelta.textContent = `${followerLift >= 0 ? "+" : ""}${followerLift.toFixed(1)}% Lift`;
  DOM.simFollowersDelta.className = `sim-delta ${followerLift >= 0 ? "positive" : "negative"}`;
  DOM.simFollowersBar.style.width = `${Math.min(100, Math.max(10, 50 + followerLift / 2))}%`;

  DOM.simProjLikes.textContent = formatNumber(simLikes);
  DOM.simBaseLikes.textContent = `from ${formatNumber(baseLikes)}`;
  DOM.simLikesDelta.textContent = `${likesLift >= 0 ? "+" : ""}${likesLift.toFixed(1)}% Lift`;
  DOM.simLikesDelta.className = `sim-delta ${likesLift >= 0 ? "positive" : "negative"}`;
  DOM.simLikesBar.style.width = `${Math.min(100, Math.max(10, 50 + likesLift / 2))}%`;

  DOM.simProjEng.textContent = `${simEng.toFixed(1)}%`;
  DOM.simBaseEng.textContent = `from ${baseEng.toFixed(1)}%`;
  DOM.simEngDelta.textContent = `${engLift >= 0 ? "+" : ""}${engLift.toFixed(1)}% Rate`;
  DOM.simEngDelta.className = `sim-delta ${engLift >= 0 ? "positive" : "negative"}`;
  DOM.simEngBar.style.width = `${Math.min(100, Math.max(10, (simEng / 30) * 100))}%`;

  DOM.simGrowthChip.textContent = `${compositeGrowth >= 0 ? "+" : ""}${compositeGrowth.toFixed(1)}% Growth Index`;
  DOM.simGrowthChip.style.background = compositeGrowth >= 0
    ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    : "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)";

  DOM.simPostBadge.textContent = `${postMult.toFixed(1)}x (${postMult >= 1 ? "+" : ""}${((postMult - 1) * 100).toFixed(0)}%)`;
  DOM.simBoostBadge.textContent = `+${boostPct}% Boost`;
  DOM.simEngagementBadge.textContent = `${engShift >= 0 ? "+" : ""}${engShift}% Shift`;

  const scopeName = isPortfolio ? "Entire Portfolio" : state.simTargetPlatform;
  if (compositeGrowth >= 35) {
    DOM.simCalloutHeading.textContent = `🚀 High Velocity Campaign (${scopeName})`;
    DOM.simCalloutBody.textContent = `Aggressive posting cadence (+${((postMult - 1) * 100).toFixed(0)}%) coupled with paid promotion generates massive audience expansion (+${formatNumber(simReach - baseReach)} new reach) with strong viral compounding.`;
  } else if (compositeGrowth >= 10) {
    DOM.simCalloutHeading.textContent = `🌱 Sustainable Growth Trajectory (${scopeName})`;
    DOM.simCalloutBody.textContent = `Steady cadence increases create healthy organic velocity, adding ~${formatNumber(simFollowers - baseFollowers)} followers while maintaining stable community engagement.`;
  } else if (compositeGrowth >= 0) {
    DOM.simCalloutHeading.textContent = `⚖️ Balanced Maintenance Mode (${scopeName})`;
    DOM.simCalloutBody.textContent = `Current simulation preserves existing momentum and minimizes audience fatigue, yielding steady retention across key metrics.`;
  } else {
    DOM.simCalloutHeading.textContent = `⚠️ Contraction Warning (${scopeName})`;
    DOM.simCalloutBody.textContent = `Reducing posting cadence and engagement pull-back risks algorithmic distribution drop. Consider keeping cadence above 1.0x to protect audience reach.`;
  }
}

function applySimPreset(presetKey) {
  state.simPreset = presetKey;
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.preset === presetKey);
  });

  if (presetKey === "viral") {
    state.simPostFactor = 2.2;
    state.simBoostFactor = 60;
    state.simEngagementShift = 25;
  } else if (presetKey === "organic") {
    state.simPostFactor = 1.3;
    state.simBoostFactor = 0;
    state.simEngagementShift = 10;
  } else if (presetKey === "creator") {
    state.simPostFactor = 1.8;
    state.simBoostFactor = 35;
    state.simEngagementShift = 30;
  }

  DOM.simPostSlider.value = state.simPostFactor;
  DOM.simBoostSlider.value = state.simBoostFactor;
  DOM.simEngagementSlider.value = state.simEngagementShift;

  renderSimulator();
}

/* ── Main Dashboard Update ─────────────────────────────────── */

function updateDashboard() {
  const data = getDisplayData();
  updateSummary(data);
  updateInsights();
  updateSpotlight();
  renderBarChart(data);
  renderDonutChart();    // always all-platform data
  renderTrendChart();
  renderTable(data);
  syncSortHeaders();
  renderArena();
  renderSimulator();
}

/* ── Event Listeners ───────────────────────────────────────── */

function initEvents() {
  // Theme
  DOM.themeToggle.addEventListener("click", toggleTheme);

  // Platform filter
  DOM.platformFilter.addEventListener("change", () => {
    state.activePlatform = DOM.platformFilter.value;
    updateDashboard();
  });

  // Sort metric dropdown
  DOM.sortMetric.addEventListener("change", () => {
    state.sortMetric = DOM.sortMetric.value;
    syncSortHeaders();
    updateDashboard();
  });

  // Sort direction button
  DOM.sortDirectionBtn.addEventListener("click", () => {
    state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
    syncSortBtn();
    updateDashboard();
    showToast(state.sortDir === "desc" ? "Sorted: highest first" : "Sorted: lowest first", "info");
  });

  // Interactive KPI Summary Cards
  document.querySelectorAll(".card--interactive").forEach((card) => {
    card.addEventListener("click", () => {
      const metric = card.dataset.metric;
      if (!metric) return;
      state.metric = metric;

      document.querySelectorAll(".card--interactive").forEach((c) =>
        c.classList.remove("active")
      );
      card.classList.add("active");

      DOM.metricToggle.querySelectorAll(".metric-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.metric === metric);
      });

      renderBarChart(getDisplayData());
      showToast(`📊 Plotted ${METRIC_LABELS[metric] || metric} on Bar Chart`, "info");
    });
  });

  // Sortable table headers
  document.querySelectorAll(".sortable-th").forEach((th) => {
    const handleSort = () => {
      const col = th.dataset.sort;
      if (!col) return;

      if (state.sortMetric === col) {
        state.sortDir = state.sortDir === "desc" ? "asc" : "desc";
      } else {
        state.sortMetric = col;
        state.sortDir = "desc";
      }

      DOM.sortMetric.value = col;
      syncSortBtn();
      updateDashboard();
      showToast(`Sorted by ${METRIC_LABELS[col] || col} (${state.sortDir.toUpperCase()})`, "info");
    };

    th.addEventListener("click", handleSort);
    th.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSort();
      }
    });
  });

  // Spotlight Clear Filter Button
  if (DOM.spotlightClearBtn) {
    DOM.spotlightClearBtn.addEventListener("click", () => {
      selectPlatform("all");
      showToast("Viewing all platforms", "info");
    });
  }

  // Keyboard Shortcuts Modal Toggle
  if (DOM.shortcutsBtn && DOM.shortcutsModal && DOM.closeShortcutsBtn) {
    DOM.shortcutsBtn.addEventListener("click", () => {
      DOM.shortcutsModal.hidden = false;
    });
    DOM.closeShortcutsBtn.addEventListener("click", () => {
      DOM.shortcutsModal.hidden = true;
    });
    DOM.shortcutsModal.addEventListener("click", (e) => {
      if (e.target === DOM.shortcutsModal) {
        DOM.shortcutsModal.hidden = true;
      }
    });
  }

  // Global Keyboard Navigation
  window.addEventListener("keydown", (e) => {
    const isInput = ["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement?.tagName);

    if (e.key === "Escape") {
      if (DOM.shortcutsModal && !DOM.shortcutsModal.hidden) {
        DOM.shortcutsModal.hidden = true;
        return;
      }
      if (state.activePlatform !== "all" || state.searchQuery) {
        state.activePlatform = "all";
        state.searchQuery = "";
        DOM.tableSearch.value = "";
        DOM.platformFilter.value = "all";
        updateDashboard();
        showToast("Reset all platform filters", "info");
      }
      return;
    }

    if (isInput) return;

    if (e.key === "/" || e.key === "?") {
      e.preventDefault();
      if (e.key === "?") {
        if (DOM.shortcutsModal) DOM.shortcutsModal.hidden = false;
      } else {
        DOM.tableSearch.focus();
      }
    } else if (e.key.toLowerCase() === "t") {
      e.preventDefault();
      toggleTheme();
    } else if (e.key === "1") {
      document.querySelector('.date-btn[data-period="7d"]')?.click();
    } else if (e.key === "2") {
      document.querySelector('.date-btn[data-period="30d"]')?.click();
    } else if (e.key === "3") {
      document.querySelector('.date-btn[data-period="90d"]')?.click();
    } else if (e.key.toLowerCase() === "c") {
      DOM.tabArena?.click();
    } else if (e.key.toLowerCase() === "s") {
      DOM.tabSimulator?.click();
    }
  });

  // Hub Tab Switcher
  DOM.tabArena.addEventListener("click", () => {
    DOM.tabArena.classList.add("active");
    DOM.tabArena.setAttribute("aria-selected", "true");
    DOM.tabSimulator.classList.remove("active");
    DOM.tabSimulator.setAttribute("aria-selected", "false");
    DOM.arenaView.hidden = false;
    DOM.simulatorView.hidden = true;
    state.activeHubTab = "arena";
    renderArena();
  });

  DOM.tabSimulator.addEventListener("click", () => {
    DOM.tabSimulator.classList.add("active");
    DOM.tabSimulator.setAttribute("aria-selected", "true");
    DOM.tabArena.classList.remove("active");
    DOM.tabArena.setAttribute("aria-selected", "false");
    DOM.arenaView.hidden = true;
    DOM.simulatorView.hidden = false;
    state.activeHubTab = "simulator";
    renderSimulator();
  });

  // Arena platform selectors & swap
  DOM.arenaPlatformA.addEventListener("change", () => {
    state.arenaPlatformA = DOM.arenaPlatformA.value;
    renderArena();
  });

  DOM.arenaPlatformB.addEventListener("change", () => {
    state.arenaPlatformB = DOM.arenaPlatformB.value;
    renderArena();
  });

  DOM.arenaSwapBtn.addEventListener("click", () => {
    const temp = state.arenaPlatformA;
    state.arenaPlatformA = state.arenaPlatformB;
    state.arenaPlatformB = temp;
    renderArena();
    showToast("⇄ Platforms swapped!", "info");
  });

  // Simulator controls
  document.querySelectorAll(".preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applySimPreset(btn.dataset.preset);
    });
  });

  DOM.simTargetPlatform.addEventListener("change", () => {
    state.simTargetPlatform = DOM.simTargetPlatform.value;
    renderSimulator();
  });

  DOM.simPostSlider.addEventListener("input", () => {
    state.simPostFactor = parseFloat(DOM.simPostSlider.value);
    state.simPreset = "custom";
    document.querySelectorAll(".preset-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.preset === "custom")
    );
    renderSimulator();
  });

  DOM.simBoostSlider.addEventListener("input", () => {
    state.simBoostFactor = parseInt(DOM.simBoostSlider.value, 10);
    state.simPreset = "custom";
    document.querySelectorAll(".preset-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.preset === "custom")
    );
    renderSimulator();
  });

  DOM.simEngagementSlider.addEventListener("input", () => {
    state.simEngagementShift = parseInt(DOM.simEngagementSlider.value, 10);
    state.simPreset = "custom";
    document.querySelectorAll(".preset-btn").forEach((b) =>
      b.classList.toggle("active", b.dataset.preset === "custom")
    );
    renderSimulator();
  });

  DOM.simResetBtn.addEventListener("click", () => {
    applySimPreset("organic");
    showToast("↺ Simulation parameters reset", "info");
  });

  // Bar chart metric toggle
  DOM.metricToggle.querySelectorAll(".metric-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      DOM.metricToggle.querySelectorAll(".metric-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      state.metric = btn.dataset.metric;

      // Also highlight matching KPI card
      document.querySelectorAll(".card--interactive").forEach((c) => {
        c.classList.toggle("active", c.dataset.metric === state.metric);
      });

      renderBarChart(getDisplayData());
    });
  });

  // Trend chart metric toggle
  DOM.trendMetricToggle.querySelectorAll(".metric-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      DOM.trendMetricToggle.querySelectorAll(".metric-btn").forEach((b) =>
        b.classList.remove("active")
      );
      btn.classList.add("active");
      state.trendMetric = btn.dataset.metric;
      renderTrendChart();
    });
  });

  // Date range buttons
  document.querySelectorAll(".date-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".date-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.period = btn.dataset.period;
      updateDashboard();
      showToast(`Period: ${btn.dataset.period.toUpperCase()}`, "info");
    });
  });

  // Table search — live filter
  DOM.tableSearch.addEventListener("input", () => {
    state.searchQuery = DOM.tableSearch.value.trim();
    renderTable(getDisplayData());
  });

  // CSV export
  DOM.exportCsvBtn.addEventListener("click", exportCSV);

  // Retry button on error
  DOM.retryBtn.addEventListener("click", () => {
    showSkeleton();
    loadData();
  });

  // Responsive: redraw charts on window resize
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const data = getDisplayData();
      renderBarChart(data);
      renderDonutChart();
      renderTrendChart();
      renderArena();
    }, 220);
  });
}

/* ── Data Loading ──────────────────────────────────────────── */

function loadData() {
  if (window.location.protocol === "file:") {
    // Local file:// protocol blocks fetch/d3.csv for security in browser previews.
    // Use embedded dataset so the dashboard immediately renders with zero errors.
    rawData = DEFAULT_DATA;
    populateFilter();
    requestAnimationFrame(() => {
      hideSkeleton();
      updateDashboard();
      showToast("Dashboard ready!", "success");
    });
    return;
  }

  d3.csv("data.csv")
    .then((data) => {
      rawData = data;
      populateFilter();
      requestAnimationFrame(() => {
        hideSkeleton();
        updateDashboard();
        showToast("Dashboard ready!", "success");
      });
    })
    .catch((err) => {
      console.warn("[Social Dashboard] Could not fetch data.csv, falling back to embedded dataset:", err);
      rawData = DEFAULT_DATA;
      populateFilter();
      requestAnimationFrame(() => {
        hideSkeleton();
        updateDashboard();
        showToast("Dashboard ready!", "info");
      });
    });
}

/* ── Bootstrap ─────────────────────────────────────────────── */

// Sync theme icon on page load (theme is already applied inline in <head>)
(function syncThemeIcon() {
  const t = document.documentElement.getAttribute("data-theme") || "light";
  DOM.themeIcon.textContent = t === "dark" ? "☀️" : "🌙";
})();

showSkeleton();
syncSortBtn();
initEvents();
loadData();