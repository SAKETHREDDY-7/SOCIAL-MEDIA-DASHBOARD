const platformColors = {
  Instagram: "#4f46e5",
  Facebook: "#06b6d4",
  Twitter: "#f59e0b",
  LinkedIn: "#22c55e",
  TikTok: "#ec4899",
  YouTube: "#ef4444"
};

const defaultData = [
  { platform: "Instagram", followers: 1850000, likes: 280000, engagement: 15.2 },
  { platform: "Facebook", followers: 1250000, likes: 220000, engagement: 18.4 },
  { platform: "Twitter", followers: 980000, likes: 175000, engagement: 21.1 },
  { platform: "LinkedIn", followers: 640000, likes: 110000, engagement: 14.8 },
  { platform: "TikTok", followers: 2100000, likes: 390000, engagement: 17.6 },
  { platform: "YouTube", followers: 2600000, likes: 450000, engagement: 12.9 }
];

const platformFilter = document.getElementById("platformFilter");
const followersValue = document.getElementById("followersValue");
const likesValue = document.getElementById("likesValue");
const engagementValue = document.getElementById("engagementValue");
const topPlatformValue = document.getElementById("topPlatformValue");
const performanceTable = document.getElementById("performanceTable");
const legend = document.getElementById("legend");

let platformData = [];

function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }
  const num = Number(value);
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString();
}

function normalizeRow(row) {
  const keys = Object.keys(row);
  const getVal = (name) => {
    const matchedKey = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
    return matchedKey !== undefined ? row[matchedKey] : undefined;
  };

  const platform = getVal("platform") || getVal("station") || "Unknown";
  const followers = Number(getVal("followers")) || 0;
  const likes = Number(getVal("likes")) || 0;
  const engagement = getVal("engagement") || getVal("reach") || (followers > 0 ? ((likes / followers) * 100).toFixed(1) : "0");

  return {
    platform: String(platform).trim(),
    followers,
    likes,
    engagement: String(engagement).replace("%", "").trim()
  };
}

function populateFilter() {
  if (!platformFilter) return;
  const currentValue = platformFilter.value || "all";
  platformFilter.innerHTML = '<option value="all">All Platforms</option>';
  
  const platforms = [...new Set(platformData.map(d => d.platform))].filter(Boolean);
  platforms.forEach(platform => {
    const option = document.createElement("option");
    option.value = platform;
    option.textContent = platform;
    platformFilter.appendChild(option);
  });

  platformFilter.value = platforms.includes(currentValue) ? currentValue : "all";
}

function getFilteredData() {
  const selected = platformFilter ? platformFilter.value : "all";
  if (selected === "all") return platformData;
  return platformData.filter(d => d.platform === selected);
}

function updateSummary(data) {
  if (!data || data.length === 0) {
    followersValue.textContent = "0";
    likesValue.textContent = "0";
    engagementValue.textContent = "0%";
    topPlatformValue.textContent = "-";
    return;
  }

  const totalFollowers = d3.sum(data, d => Number(d.followers));
  const totalLikes = d3.sum(data, d => Number(d.likes));
  const engagementAvg = totalFollowers ? (totalLikes / totalFollowers) * 100 : 0;

  followersValue.textContent = formatNumber(totalFollowers);
  likesValue.textContent = formatNumber(totalLikes);
  engagementValue.textContent = engagementAvg.toFixed(1) + "%";

  const top = [...data].sort((a, b) => Number(b.followers) - Number(a.followers))[0];
  topPlatformValue.textContent = top ? top.platform : "-";
}

function renderTable(data) {
  if (!performanceTable) return;
  performanceTable.innerHTML = "";

  if (!data || data.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="4" style="text-align:center; padding: 24px; color: var(--muted);">No data available</td>`;
    performanceTable.appendChild(emptyRow);
    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.platform}</strong></td>
      <td>${formatNumber(Number(item.followers))}</td>
      <td>${formatNumber(Number(item.likes))}</td>
      <td>${item.engagement}%</td>
    `;
    performanceTable.appendChild(row);
  });
}

function renderBarChart(data) {
  const container = document.getElementById("barChart");
  if (!container) return;
  container.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:280px;color:var(--muted)">No data available</div>`;
    return;
  }

  const width = container.clientWidth || 550;
  const height = 320;
  const margin = { top: 24, right: 24, bottom: 48, left: 60 };

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", height);

  const x = d3.scaleBand()
    .domain(data.map(d => d.platform))
    .range([margin.left, width - margin.right])
    .padding(0.35);

  const maxVal = d3.max(data, d => Number(d.followers)) || 1;
  const y = d3.scaleLinear()
    .domain([0, maxVal])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // X Axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call(g => g.selectAll("text")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .style("fill", "#64748b"))
    .call(g => g.select(".domain").attr("stroke", "#e5eaf3"))
    .call(g => g.selectAll(".tick line").attr("stroke", "#e5eaf3"));

  // Y Axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatNumber(d)))
    .call(g => g.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#64748b"))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").attr("stroke", "#f1f5f9").attr("x2", width - margin.left - margin.right));

  // Bars
  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.platform))
    .attr("y", d => y(Number(d.followers)))
    .attr("width", x.bandwidth())
    .attr("height", d => Math.max(0, y(0) - y(Number(d.followers))))
    .attr("rx", 6)
    .attr("fill", d => platformColors[d.platform] || "#4f46e5")
    .style("transition", "opacity 0.2s ease")
    .on("mouseover", function() { d3.select(this).style("opacity", "0.85"); })
    .on("mouseout", function() { d3.select(this).style("opacity", "1"); })
    .append("title")
    .text(d => `${d.platform}: ${formatNumber(Number(d.followers))} followers`);
}

function renderDonutChart(data) {
  const container = document.getElementById("donutChart");
  if (!container || !legend) return;
  container.innerHTML = "";
  legend.innerHTML = "";

  if (!data || data.length === 0) {
    container.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;min-height:240px;color:var(--muted)">No data available</div>`;
    return;
  }

  const width = 240;
  const height = 240;
  const radius = Math.min(width, height) / 2;

  const svg = d3.select(container)
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const pie = d3.pie()
    .sort(null)
    .value(d => Number(d.followers));

  const arc = d3.arc()
    .innerRadius(radius * 0.55)
    .outerRadius(radius - 8);

  const arcs = pie(data);

  svg.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => platformColors[d.data.platform] || "#4f46e5")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .style("transition", "opacity 0.2s ease")
    .on("mouseover", function() { d3.select(this).style("opacity", "0.85"); })
    .on("mouseout", function() { d3.select(this).style("opacity", "1"); })
    .append("title")
    .text(d => `${d.data.platform}: ${formatNumber(Number(d.data.followers))} followers`);

  data.forEach(item => {
    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.style.background = platformColors[item.platform] || "#4f46e5";

    const text = document.createElement("span");
    text.textContent = `${item.platform} (${formatNumber(Number(item.followers))})`;

    li.appendChild(dot);
    li.appendChild(text);
    legend.appendChild(li);
  });
}

function updateDashboard() {
  const data = getFilteredData();
  updateSummary(data);
  renderTable(data);
  renderBarChart(data);
  renderDonutChart(data);
}

function loadDashboard(rawData) {
  platformData = rawData.map(normalizeRow);
  populateFilter();
  updateDashboard();
}

// Load data from data/data.csv, data.csv, or fallback dataset
function init() {
  if (window.location.protocol === "file:") {
    // Under file:// preview, fetch is blocked by browser CORS policy: load dataset directly
    loadDashboard(defaultData);
    return;
  }

  d3.csv("data/data.csv")
    .then(data => {
      if (data && data.length > 0) {
        loadDashboard(data);
      } else {
        throw new Error("Empty data/data.csv");
      }
    })
    .catch(() => {
      d3.csv("data.csv")
        .then(data => {
          if (data && data.length > 0) {
            loadDashboard(data);
          } else {
            loadDashboard(defaultData);
          }
        })
        .catch(err => {
          console.warn("Using fallback dataset:", err);
          loadDashboard(defaultData);
        });
    });
}

init();

if (platformFilter) {
  platformFilter.addEventListener("change", updateDashboard);
}

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const data = getFilteredData();
    renderBarChart(data);
  }, 150);
});