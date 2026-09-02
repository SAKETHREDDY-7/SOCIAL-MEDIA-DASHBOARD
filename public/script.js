const platformColors = {
  Instagram: "#170cf5",
  Facebook: "#2cddfc",
  Twitter: "#ffa200",
  LinkedIn: "#1edf65",
  TikTok: "#ff0f87",
  YouTube: "#ee0000"
};

const platformFilter = document.getElementById("platformFilter");
const followersValue = document.getElementById("followersValue");
const likesValue = document.getElementById("likesValue");
const engagementValue = document.getElementById("engagementValue");
const topPlatformValue = document.getElementById("topPlatformValue");
const performanceTable = document.getElementById("performanceTable");
const legend = document.getElementById("legend");

let platformData = [];

function formatNumber(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + "K";
  }
  return value.toString();
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
  if (selected === "all") return platformData;
  return platformData.filter(d => d.platform === selected);
}

function updateSummary(data) {
  const totalFollowers = d3.sum(data, d => Number(d.followers));
  const totalLikes = d3.sum(data, d => Number(d.likes));
  const engagementAvg = totalFollowers ? (totalLikes / totalFollowers) * 100 : 0;

  followersValue.textContent = formatNumber(totalFollowers);
  likesValue.textContent = formatNumber(totalLikes);
  engagementValue.textContent = engagementAvg.toFixed(2) + "%";

  const top = [...data].sort((a, b) => Number(b.followers) - Number(a.followers))[0];
  topPlatformValue.textContent = top ? top.platform : "-";
}

function renderTable(data) {
  performanceTable.innerHTML = "";
  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.platform}</td>
      <td>${formatNumber(Number(item.followers))}</td>
      <td>${formatNumber(Number(item.likes))}</td>
      <td>${item.engagement}%</td>
    `;
    performanceTable.appendChild(row);
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

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => Number(d.followers)) || 1])
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
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => formatNumber(d)))
    .call(g => g.selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#64748b"));

  svg.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.platform))
    .attr("y", d => y(Number(d.followers)))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(Number(d.followers)))
    .attr("rx", 8)
    .attr("fill", d => platformColors[d.platform] || "#4f46e5")
    .append("title")
    .text(d => `${d.platform}: ${formatNumber(Number(d.followers))}`);
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
    .attr("d", arc)
    .attr("fill", d => platformColors[d.data.platform] || "#4f46e5")
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 2)
    .append("title")
    .text(d => `${d.data.platform}: ${formatNumber(Number(d.data.followers))}`);

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

d3.csv("data.csv").then(data => {
  platformData = data;
  populateFilter();
  updateDashboard();
});

platformFilter.addEventListener("change", updateDashboard);