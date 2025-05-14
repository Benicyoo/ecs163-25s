/**** Gen AI was used to create these visualizations ***** */
//handles size of graphs
const width = window.innerWidth;
const height = window.innerHeight;
let barLeft = 0, barTop = 0;
let barMargin = {top: 20, right: 30, bottom: 80, left: 60},
    barWidth = 400 - barMargin.left - barMargin.right,
    barHeight = 350 - barMargin.top - barMargin.bottom;

let scatterLeft = 400, scatterTop = 0;
let scatterMargin = {top: 10, right: 30, bottom: 40, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 350 - scatterMargin.top - scatterMargin.bottom;

let starLeft = 0, starTop = 400;
let starMargin = {top: 10, right: 30, bottom: 30, left: 60},
    starWidth = width - starMargin.left - starMargin.right,
    starHeight = height-450 - starMargin.top - starMargin.bottom;

//preprocesses the data extract attributes to visualize
d3.csv("cosmetics.csv").then(data => {
  data.forEach(d => {
    d.Price = +d.Price;
    d.Rank = +d.Rank;
    d.Combination = +d.Combination;
    d.Dry = +d.Dry;
    d.Normal = +d.Normal;
    d.Oily = +d.Oily;
    d.Sensitive = +d.Sensitive;
  });
  //calls function to generate graphs
  drawAll(data)
});
function drawAll(data) {
  //selects the svg element in html to add graphs to 
  const svg = d3.select("svg");

  // === 1. BAR CHART ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gBar = svg.append("g")
    .attr("transform", `translate(${barLeft}, ${barTop})`);

  drawBarChart(gBar, data);
   
  // === 2. SCATTER PLOT ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gScatter = svg.append("g")
    .attr("transform", `translate(${scatterLeft}, ${scatterTop})`);

  drawScatterPlot(gScatter, data);
 
  // === 3. RADAR PLOT ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gStar = svg.append("g")
    .attr("transform", `translate(${starLeft}, ${starTop})`);

  drawStarPlot(gStar, data);
    
}

function drawBarChart(g,data) {

  const margin = barMargin;
  const width = barWidth + margin.left + margin.right;
  const height = barHeight + margin.top + margin.bottom;

  //aggregates data to count how many occurances there are
  const labels = d3.nest()
    .key(d => d.Label)
    .rollup(v => v.length)
    .entries(data);

  //creates bars
  const x = d3.scaleBand()
    .domain(labels.map(d => d.key))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  //creates scale of bars
  const y = d3.scaleLinear()
    .domain([0, d3.max(labels, d => d.value)])
    .range([height - margin.bottom, margin.top+10]);
  g.attr("width", width).attr("height", height);

  //adds bars to gbar group
  g.selectAll("rect")
    .data(labels)
    .enter()
    .append("rect")
    .attr("x", d => x(d.key))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue");

  //creates x axis
  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  //creates y axis
  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  //creates x label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Product Type");

  //creates y label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Products");

  //creates Bar value labels
  g.selectAll("text.bar")
    .data(labels)
    .enter()
    .append("text")
    .attr("class", "bar")
    .attr("x", d => x(d.key) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill", "#333")
    .text(d => d.value);
}
function drawScatterPlot(g, data) {

  const margin = scatterMargin;
  const width = scatterWidth + margin.left + margin.right;
  const height = scatterHeight + margin.top + margin.bottom;

  //creates scale for x axis
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Price)).nice()
    .range([margin.left, width - margin.right]);
  //creates scale for y axis
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Rank)).nice()
    .range([height - margin.bottom, margin.top]);

  g.attr("width", width).attr("height", height);
  //creates dots for data
  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Price))
    .attr("cy", d => y(d.Rank))
    .attr("r", 4)
    .attr("fill", "orange");

  //creates X-axis
  g.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  //creates Y-axis
  g.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  //creates X-axis label
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Price");

  //creates Y-axis label
  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Rank");
}
function drawStarPlot(g,data) {
  const variables = ["Combination", "Dry", "Normal", "Oily", "Sensitive"];
  
  const width = 300, height = 300, radius = 100;
  const centerX = width / 2;
  const centerY = height / 2;

  g.attr("width", width).attr("height", height);

  const angleSlice = (2 * Math.PI) / variables.length;

  //Computes averages
  const avgValues = {};
  variables.forEach(v => {
    avgValues[v] = d3.mean(data, d => d[v]);
  });

  //Normalize by max of the averages 
  const maxValue = d3.max(Object.values(avgValues));
  //Draw axes
  variables.forEach((varName, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    //adds line for attribute
    g.append("line")
      .attr("x1", centerX)
      .attr("y1", centerY)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", "gray");
    //adds text for attribute
    g.append("text")
      .attr("x", centerX + (radius + 10) * Math.cos(angle))
      .attr("y", centerY + (radius + 10) * Math.sin(angle))
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text(varName);
  });

  //Convert average values into coordinates
  const points = variables.map((varName, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const value = avgValues[varName] / maxValue; // normalize
    const x = centerX + radius * value * Math.cos(angle);
    const y = centerY + radius * value * Math.sin(angle);
    return [x, y];
  });
  points.push(points[0]); // close the shape

  //Draw the average polygon
  g.append("path")
    .datum(points)
    .attr("fill", "steelblue")
    .attr("fill-opacity", 0.3)
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()(points));

  //Creates label
  g.append("text")
    .attr("x", centerX)
    .attr("y", centerY+radius+15)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .text("Average Skin Type Profile");
}
