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

let platformData = [];
let activeMetric = "followers";
let activePlatform = "all";

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

function attachTableInteractions() {
  const rows = [...performanceTable.querySelectorAll("tr")];
  rows.forEach(row => {
    row.addEventListener("mouseenter", () => highlightPlatform(row.dataset.platform));
    row.addEventListener("mouseleave", clearHighlights);
    row.addEventListener("focus", () => highlightPlatform(row.dataset.platform));
    row.addEventListener("blur", clearHighlights);
    row.addEventListener("click", () => {
      const platform = row.dataset.platform;
      platformFilter.value = platform;
      updateDashboard();
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

function renderBarChart(data) {
  const container = document.getElementById("barChart");
  container.innerHTML = "";

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
    .on("mouseenter", (_, d) => highlightPlatform(d.platform))
    .on("mouseleave", clearHighlights)
    .on("click", (_, d) => {
      platformFilter.value = d.platform;
      updateDashboard();
    })
    .append("title")
    .text(d => `${d.platform}: ${formatMetricValue(activeMetric, getMetricValue(d, activeMetric))}`);
}

function renderDonutChart(data) {
  const container = document.getElementById("donutChart");
  container.innerHTML = "";
  legend.innerHTML = "";

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
    .on("mouseenter", (_, d) => highlightPlatform(d.data.platform))
    .on("mouseleave", clearHighlights)
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
      platformFilter.value = li.dataset.platform;
      updateDashboard();
    });
  });
}

function updateDashboard() {
  const data = getFilteredData();
  updateSummary(data);
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

d3.csv("data.csv").then(data => {
  platformData = data;
  populateFilter();
  updateDashboard();
});

platformFilter.addEventListener("change", updateDashboard);