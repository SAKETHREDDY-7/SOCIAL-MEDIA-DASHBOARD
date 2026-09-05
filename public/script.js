const platformColors = {
  Instagram: "#170cf5",
  Facebook: "#2cddfc",
  Twitter: "#ffa200",
  LinkedIn: "#1edf65",
  TikTok: "#ff0f87",
  YouTube: "#ee0000"
};

const platformFilter = document.getElementById("platformFilter");
const metricButtons = [...document.querySelectorAll(".metric-btn")];
const followersValue = document.getElementById("followersValue");
const likesValue = document.getElementById("likesValue");
const engagementValue = document.getElementById("engagementValue");
const topPlatformValue = document.getElementById("topPlatformValue");
const performanceTable = document.getElementById("performanceTable");
const legend = document.getElementById("legend");
const barChartTitle = document.getElementById("barChartTitle");
const barChartSubtitle = document.getElementById("barChartSubtitle");
const platformChartMode = document.getElementById("platformChartMode");
const audienceChartMode = document.getElementById("audienceChartMode");
const allPlatformsBtn = document.getElementById("allPlatformsBtn");
const donutChartTitle = document.getElementById("donutChartTitle");
const donutChartSubtitle = document.getElementById("donutChartSubtitle");
const chartTooltip = document.getElementById("chartTooltip");
const spotlightTitle = document.getElementById("spotlightTitle");
const spotlightDescription = document.getElementById("spotlightDescription");
const spotlightMetrics = document.getElementById("spotlightMetrics");
const spotlightFollowers = document.getElementById("spotlightFollowers");
const spotlightLikes = document.getElementById("spotlightLikes");
const spotlightEngagement = document.getElementById("spotlightEngagement");
const spotlightFollowersContext = document.getElementById("spotlightFollowersContext");
const spotlightLikesContext = document.getElementById("spotlightLikesContext");
const spotlightEngagementContext = document.getElementById("spotlightEngagementContext");
const spotlightFollowersBar = document.getElementById("spotlightFollowersBar");
const spotlightLikesBar = document.getElementById("spotlightLikesBar");
const spotlightEngagementBar = document.getElementById("spotlightEngagementBar");

let platformData = [];
let activeMetric = "followers";
let activePlatform = "all";
let chartMode = "platforms";

const audienceProfiles = {
  Instagram: [42, 45, 8, 5],
  Facebook: [48, 39, 7, 6],
  Twitter: [58, 34, 3, 5],
  LinkedIn: [55, 40, 1, 4],
  TikTok: [44, 43, 9, 4],
  YouTube: [46, 42, 8, 4]
};

const audienceSegments = ["Men", "Women", "Children", "Other"];
const audienceColors = ["#170cf5", "#ff0f87", "#ffa200", "#1edf65"];

function formatNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
}

function formatMetricValue(metric, value) {
  if (metric === "engagement") return `${Number(value).toFixed(1)}%`;
  return formatNumber(Number(value));
}

function getMetricValue(item, metric) {
  if (metric === "followers") return Number(item.followers);
  if (metric === "likes") return Number(item.likes);
  return Number(item.engagement);
}

function populateFilter() {
  const platforms = [...new Set(platformData.map(d => d.platform))];
  platforms.forEach(platform => {
    const option = document.createElement("option");
    option.value = platform;
    option.textContent = platform;
    platformFilter.appendChild(option);
  });
}

function getFilteredData() {
  const selected = platformFilter.value;
  activePlatform = selected;
  if (selected === "all") return platformData;
  return platformData.filter(d => d.platform === selected);
}

function selectPlatform(platform) {
  platformFilter.value = platform;
  chartMode = platform === "all" ? "platforms" : "audience";
  updateDashboard();
}

function animateValue(element, startValue, endValue, suffix = "") {
  const duration = 500;
  const start = performance.now();

  function updateFrame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startValue + (endValue - startValue) * eased;
    element.textContent = `${current.toFixed(endValue >= 100 ? 0 : 2)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(updateFrame);
    }
  }

  requestAnimationFrame(updateFrame);
}

function updateSummary(data) {
  const totalFollowers = d3.sum(data, d => Number(d.followers));
  const totalLikes = d3.sum(data, d => Number(d.likes));
  const engagementAvg = totalFollowers ? (totalLikes / totalFollowers) * 100 : 0;

  const followerTarget = formatNumber(totalFollowers);
  const likeTarget = formatNumber(totalLikes);
  const engagementTarget = engagementAvg.toFixed(2) + "%";

  followersValue.textContent = "0";
  likesValue.textContent = "0";
  engagementValue.textContent = "0%";

  animateValue(followersValue, 0, totalFollowers, "");
  animateValue(likesValue, 0, totalLikes, "");
  animateValue(engagementValue, 0, engagementAvg, "%");

  const top = [...data].sort((a, b) => Number(b.followers) - Number(a.followers))[0];
  topPlatformValue.textContent = top ? top.platform : "-";
}

function updateSpotlight() {
  const selected = platformData.find(item => item.platform === activePlatform);

  if (!selected) {
    spotlightTitle.textContent = "Select a platform to see more";
    spotlightDescription.textContent = "Choose a platform from the filter, chart, legend, or table to inspect its performance.";
    spotlightMetrics.hidden = true;
    return;
  }

  const totalFollowers = d3.sum(platformData, item => Number(item.followers));
  const totalLikes = d3.sum(platformData, item => Number(item.likes));
  const maxEngagement = d3.max(platformData, item => Number(item.engagement)) || 1;
  const followers = Number(selected.followers);
  const likes = Number(selected.likes);
  const engagement = Number(selected.engagement);
  const audienceShare = (followers / totalFollowers) * 100;
  const likesShare = (likes / totalLikes) * 100;

  spotlightTitle.textContent = selected.platform;
  spotlightDescription.textContent = `Detailed performance breakdown for ${selected.platform}.`;
  spotlightFollowers.textContent = formatNumber(followers);
  spotlightLikes.textContent = formatNumber(likes);
  spotlightEngagement.textContent = `${engagement.toFixed(1)}%`;
  spotlightFollowersContext.textContent = `${audienceShare.toFixed(1)}% of total followers`;
  spotlightLikesContext.textContent = `${likesShare.toFixed(1)}% of total likes`;
  spotlightEngagementContext.textContent = `${(engagement / maxEngagement * 100).toFixed(0)}% of best platform rate`;
  spotlightFollowersBar.style.width = `${audienceShare}%`;
  spotlightLikesBar.style.width = `${likesShare}%`;
  spotlightEngagementBar.style.width = `${engagement / maxEngagement * 100}%`;
  [spotlightFollowersBar, spotlightLikesBar, spotlightEngagementBar].forEach(bar => {
    bar.style.background = platformColors[selected.platform] || "var(--primary)";
  });
  spotlightMetrics.hidden = false;
}

function attachTableInteractions() {
  const rows = [...performanceTable.querySelectorAll("tr")];
  rows.forEach(row => {
    row.addEventListener("mouseenter", () => highlightPlatform(row.dataset.platform));
    row.addEventListener("mouseleave", clearHighlights);
    row.addEventListener("focus", () => highlightPlatform(row.dataset.platform));
    row.addEventListener("blur", clearHighlights);
    row.addEventListener("click", () => {
      selectPlatform(row.dataset.platform);
    });
  });
}

function renderTable(data) {
  performanceTable.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");
    row.dataset.platform = item.platform;
    row.tabIndex = 0;
    if (activePlatform !== "all" && item.platform === activePlatform) {
      row.classList.add("is-selected");
    }

    row.innerHTML = `
      <td>${item.platform}</td>
      <td>${formatNumber(Number(item.followers))}</td>
      <td>${formatNumber(Number(item.likes))}</td>
      <td>${item.engagement}%</td>
    `;
    performanceTable.appendChild(row);
  });

  attachTableInteractions();
}

function highlightPlatform(platformName) {
  const target = platformName || activePlatform;

  if (!target || target === "all") {
    clearHighlights();
    return;
  }

  d3.selectAll(".bar")
    .classed("is-active", d => d.platform === target)
    .style("opacity", d => d.platform === target ? 1 : 0.45);

  d3.selectAll(".donut-slice")
    .classed("is-active", d => d.data.platform === target)
    .style("opacity", d => d.data.platform === target ? 1 : 0.4);

  const legendItems = [...legend.querySelectorAll("li")];
  legendItems.forEach(item => {
    const isActive = item.dataset.platform === target;
    item.classList.toggle("is-active", isActive);
    item.classList.toggle("is-muted", !isActive);
  });

  const rows = [...performanceTable.querySelectorAll("tr")];
  rows.forEach(row => {
    row.classList.toggle("is-selected", row.dataset.platform === target);
  });
}

function clearHighlights() {
  d3.selectAll(".bar")
    .classed("is-active", false)
    .style("opacity", 1);

  d3.selectAll(".donut-slice")
    .classed("is-active", false)
    .style("opacity", 1);

  [...legend.querySelectorAll("li")].forEach(item => {
    item.classList.remove("is-active", "is-muted");
  });

  [...performanceTable.querySelectorAll("tr")].forEach(row => {
    row.classList.remove("is-selected");
  });
}

function getAudienceData(platform) {
  const shares = audienceProfiles[platform] || [45, 42, 8, 5];
  return shares.map((share, index) => ({
    segment: audienceSegments[index],
    share,
    color: audienceColors[index]
  }));
}

function showChartTooltip(event, content) {
  chartTooltip.innerHTML = content;
  chartTooltip.classList.add("is-visible");
  chartTooltip.style.left = `${event.clientX + 14}px`;
  chartTooltip.style.top = `${event.clientY + 14}px`;
}

function hideChartTooltip() {
  chartTooltip.classList.remove("is-visible");
}

function platformTooltip(item, extra = "") {
  return `<strong>${item.platform}</strong>${extra}<span>Followers: ${formatNumber(Number(item.followers))}</span><span>Likes: ${formatNumber(Number(item.likes))}</span><span>Engagement: ${item.engagement}%</span>`;
}

function audienceTooltip(platform, segment, share) {
  const item = platformData.find(data => data.platform === platform);
  return platformTooltip(item, `<em>${segment}: ${share}% (estimated)</em>`);
}

function renderBarChart(data) {
  const container = document.getElementById("barChart");
  container.innerHTML = "";

  const selectedPlatform = platformData.find(item => item.platform === activePlatform);
  if (chartMode === "audience" && selectedPlatform) {
    container.setAttribute("aria-label", `Estimated audience mix for ${selectedPlatform.platform}`);
    renderAudienceChart(container, selectedPlatform.platform);
    return;
  }

  container.setAttribute("aria-label", "Bar chart showing followers by platform");

  const width = container.clientWidth || 550;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 48, left: 52 };

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(data.map(d => d.platform))
    .range([margin.left, width - margin.right])
    .padding(0.3);

  const yMax = d3.max(data, d => getMetricValue(d, activeMetric)) || 1;
  const y = d3.scaleLinear()
    .domain([0, yMax * 1.25])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#64748b"));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatMetricValue(activeMetric, d)))
    .call(g => g.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#64748b"));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.platform))
    .attr("y", d => y(getMetricValue(d, activeMetric)))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(getMetricValue(d, activeMetric)))
    .attr("rx", 8)
    .attr("fill", d => platformColors[d.platform] || "#4f46e5")
    .on("mousemove", (event, d) => showChartTooltip(event, platformTooltip(d)))
    .on("mouseenter", (_, d) => highlightPlatform(d.platform))
    .on("mouseleave", () => {
      hideChartTooltip();
      clearHighlights();
    })
    .on("click", (_, d) => {
      selectPlatform(d.platform);
    })
    .append("title")
    .text(d => `${d.platform}: ${formatMetricValue(activeMetric, getMetricValue(d, activeMetric))}`);
}

function renderAudienceChart(container, platform) {
  const audienceData = getAudienceData(platform);
  const width = container.clientWidth || 550;
  const height = 320;
  const margin = { top: 20, right: 20, bottom: 48, left: 52 };
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  const x = d3.scaleBand()
    .domain(audienceData.map(d => d.segment))
    .range([margin.left, width - margin.right])
    .padding(0.3);
  const y = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.selectAll("text").style("font-size", "12px").style("fill", "#64748b"));
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
    .call(g => g.selectAll("text").style("font-size", "12px").style("fill", "#64748b"));

  svg.selectAll(".segment-bar")
    .data(audienceData)
    .enter()
    .append("rect")
    .attr("class", "segment-bar")
    .attr("x", d => x(d.segment))
    .attr("y", d => y(d.share))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.share))
    .attr("rx", 8)
    .attr("fill", d => d.color)
    .on("mousemove", (event, d) => showChartTooltip(event, audienceTooltip(platform, d.segment, d.share)))
    .on("mouseleave", hideChartTooltip)
    .append("title")
    .text(d => `${d.segment}: ${d.share}% (estimated)`);
}

function renderDonutChart(data) {
  const container = document.getElementById("donutChart");
  container.innerHTML = "";
  legend.innerHTML = "";

  const selectedPlatform = platformData.find(item => item.platform === activePlatform);
  if (chartMode === "audience" && selectedPlatform) {
    renderAudienceDonut(container, selectedPlatform.platform);
    return;
  }

  donutChartTitle.textContent = "Audience Share";
  donutChartSubtitle.textContent = "Share of followers across platforms";

  const width = 260;
  const height = 260;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie()
    .sort(null)
    .value(d => Number(d.followers));

  const arc = d3.arc()
    .innerRadius(radius * 0.55)
    .outerRadius(radius);

  const arcs = pie(data);

  svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", "donut-slice")
    .attr("d", arc)
    .attr("fill", d => platformColors[d.data.platform] || "#4f46e5")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .on("mousemove", (event, d) => {
      const totalFollowers = d3.sum(data, item => Number(item.followers));
      const share = (d.value / totalFollowers) * 100;
      showChartTooltip(event, platformTooltip(d.data, `<em>Audience share: ${share.toFixed(1)}%</em>`));
    })
    .on("mouseenter", (_, d) => highlightPlatform(d.data.platform))
    .on("mouseleave", () => {
      hideChartTooltip();
      clearHighlights();
    })
    .append("title")
    .text(d => `${d.data.platform}: ${formatNumber(Number(d.data.followers))}`);

  data.forEach(item => {
    const li = document.createElement("li");
    li.dataset.platform = item.platform;
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = platformColors[item.platform] || "#4f46e5";

    const text = document.createElement("span");
    text.textContent = `${item.platform} (${formatNumber(Number(item.followers))})`;

    li.appendChild(dot);
    li.appendChild(text);
    legend.appendChild(li);
  });

  [...legend.querySelectorAll("li")].forEach(li => {
    li.addEventListener("mouseenter", () => highlightPlatform(li.dataset.platform));
    li.addEventListener("mouseleave", clearHighlights);
    li.addEventListener("click", () => {
      selectPlatform(li.dataset.platform);
    });
  });
}

function renderAudienceDonut(container, platform) {
  donutChartTitle.textContent = `${platform} Audience Share`;
  donutChartSubtitle.textContent = "Estimated audience breakdown";

  const audienceData = getAudienceData(platform);
  const width = 260;
  const height = 260;
  const radius = Math.min(width, height) / 2;
  const svg = d3.select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("aria-label", `Estimated audience share for ${platform}`)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);
  const pie = d3.pie().sort(null).value(d => d.share);
  const arc = d3.arc()
    .innerRadius(radius * 0.55)
    .outerRadius(radius);

  svg.selectAll("path")
    .data(pie(audienceData))
    .enter()
    .append("path")
    .attr("class", "donut-slice audience-slice")
    .attr("d", arc)
    .attr("fill", d => d.data.color)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .on("mousemove", (event, d) => showChartTooltip(event, audienceTooltip(platform, d.data.segment, d.data.share)))
    .on("mouseleave", hideChartTooltip)
    .append("title")
    .text(d => `${d.data.segment}: ${d.data.share}% (estimated)`);

  audienceData.forEach(item => {
    const li = document.createElement("li");
    li.dataset.segment = item.segment;
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = item.color;
    const text = document.createElement("span");
    text.textContent = `${item.segment} (${item.share}%)`;
    li.append(dot, text);
    legend.appendChild(li);
  });
}

function updateDashboard() {
  const data = getFilteredData();
  const hasSelectedPlatform = activePlatform !== "all";
  audienceChartMode.disabled = !hasSelectedPlatform;
  allPlatformsBtn.hidden = !hasSelectedPlatform;
  if (!hasSelectedPlatform) chartMode = "platforms";
  platformChartMode.classList.toggle("active", chartMode === "platforms");
  audienceChartMode.classList.toggle("active", chartMode === "audience");
  barChartTitle.textContent = chartMode === "audience" ? `${activePlatform} Audience Mix` : "Followers by Platform";
  barChartSubtitle.textContent = chartMode === "audience"
    ? "Estimated audience breakdown"
    : "Compare your audience across platforms";
  updateSummary(data);
  updateSpotlight();
  renderTable(data);
  renderBarChart(data);
  renderDonutChart(data);
}

metricButtons.forEach(button => {
  button.addEventListener("click", () => {
    metricButtons.forEach(btn => btn.classList.toggle("active", btn === button));
    activeMetric = button.dataset.metric;
    updateDashboard();
  });
});

platformChartMode.addEventListener("click", () => {
  chartMode = "platforms";
  updateDashboard();
});

audienceChartMode.addEventListener("click", () => {
  if (activePlatform === "all") return;
  chartMode = "audience";
  updateDashboard();
});

allPlatformsBtn.addEventListener("click", () => {
  platformFilter.value = "all";
  chartMode = "platforms";
  updateDashboard();
});

d3.csv("data.csv").then(data => {
  platformData = data;
  populateFilter();
  updateDashboard();
});

platformFilter.addEventListener("change", () => {
  chartMode = platformFilter.value === "all" ? "platforms" : "audience";
  updateDashboard();
});