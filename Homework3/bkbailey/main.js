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
    starWidth =  400 - starMargin.left - starMargin.right,
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
  const svgWidth = width;  // enough width to center charts horizontally
  const svgHeight = barHeight + scatterHeight + starHeight + 300; // total height for all + margins

  //selects the svg element in html to add graphs to 
  const svg = d3.select("svg")
  .attr("width", svgWidth)
  .attr("height",svgHeight)


  const barGroupX = (svgWidth - (barWidth + barMargin.left + barMargin.right)) / 2;
  const scatterGroupX = (svgWidth - (scatterWidth + scatterMargin.left + scatterMargin.right)) / 2;
  const starGroupX = (svgWidth - (starWidth + starMargin.left + starMargin.right)) / 2;

  const barGroupY = 20; // top margin
  const scatterGroupY = barGroupY + barHeight + barMargin.top + barMargin.bottom + 30; // spacing below bar chart
  const starGroupY = scatterGroupY + scatterHeight + scatterMargin.top + scatterMargin.bottom + 30; // spacing below scatter plot

  // === 1. BAR CHART ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gBar = svg.append("g")
    .attr("transform", `translate(${barGroupX}, ${barGroupY})`);

  drawBarChart(gBar, data);
   
  // === 2. SCATTER PLOT ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gScatter = svg.append("g")
    .attr("transform", `translate(${scatterGroupX}, ${scatterGroupY})`);

  drawScatterPlot(gScatter, data);
 
  // === 3. RADAR PLOT ===
  //creates a group element in the svg to hold the graph and positions it on page
  const gStar = svg.append("g")
    .attr("transform", `translate(${starGroupX}, ${starGroupY})`);

  drawStarPlot(gStar, data);
    
}
function drawBarChart(g, data) {
  const margin = barMargin;
  const width = barWidth + margin.left + margin.right;
  const height = barHeight + margin.top + margin.bottom;

  // Aggregate data: count of each label
  const labels = d3.nest()
    .key(d => d.Label)
    .rollup(v => v.length)
    .entries(data);
  //for label types
  const x = d3.scaleBand()
    .domain(labels.map(d => d.key))
    .range([margin.left, width - margin.right])
    .padding(0.2);
  //for counts
  const y = d3.scaleLinear()
    .domain([0, d3.max(labels, d => d.value)])
    .range([height - margin.bottom, margin.top + 10]);

  g.attr("width", width).attr("height", height);

  // Remove old bars and bind new data
  const bars = g.selectAll("rect").data(labels);
  bars.exit().remove();
  //creates bars and sets up on-click interaction
  bars.enter()
    .append("rect")
    .merge(bars)
    .attr("x", d => x(d.key))
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value))
    .attr("width", x.bandwidth())
    .attr("fill", "steelblue")
    .on("click", function(d) {
      d3.event.stopPropagation();
      //clears previous tooltips and resets bar color
      g.selectAll(".tooltip-group").remove();
      g.selectAll("rect")
        .transition()
        .duration(300)
        .attr("fill", "steelblue")
        .attr("transform", null);
      //changes bar to orange on click
      d3.select(this)
        .transition()
        .duration(300)
        .attr("fill", "orange");
      //counts how many products are from a single brand in a label category
      const filtered = data.filter(row => row.Label === d.key);
      const brandCounts = d3.nest()
        .key(row => row.Brand)
        .rollup(v => v.length)
        .entries(filtered)
        .filter(d => d.key)
        .sort((a, b) => b.value - a.value);
      //creates a tooltip object at the side of the chart
      const tooltipGroup = g.append("g")
        .attr("class", "tooltip-group")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`)
        .style("opacity", 0);
      //adds a background to the tooltip
      const tooltipBg = tooltipGroup.append("rect")
        .attr("fill", "lightyellow")
        .attr("stroke", "gray")
        .attr("rx", 4)
        .attr("ry", 4);
      //formats the text
      const tooltipText = tooltipGroup.append("text")
        .attr("x", 8)
        .attr("y", 16)
        .attr("font-size", "12px")
        .attr("fill", "black");
      //creates an object for the text for a clicked on label
      tooltipText.append("tspan")
        .text(`${d.key} Brands:`)
        .attr("x", 8)
        .attr("dy", "1.2em");
      //chooses top 10 brands
      brandCounts.slice(0, 10).forEach(({ key, value }) => {
        tooltipText.append("tspan")
          .text(`${key}: ${value}`)
          .attr("x", 8)
          .attr("dy", "1.2em");
      });
      if (brandCounts.length > 10) {
        tooltipText.append("tspan")
          .text("...")
          .attr("x", 8)
          .attr("dy", "1.2em");
      }
      //creates boundary box for formatting the background
      const bbox = tooltipText.node().getBBox();
      tooltipBg
        .attr("x", bbox.x - 4)
        .attr("y", bbox.y - 4)
        .attr("width", bbox.width + 8)
        .attr("height", bbox.height + 8);
      //animates the creation of the tooltip
      tooltipGroup.transition()
        .duration(300)
        .style("opacity", 1);
    });
  

  // Axes
  g.selectAll(".x-axis").remove();
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  g.selectAll(".y-axis").remove();
  g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Axis labels
  g.selectAll(".x-label").remove();
  g.append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Product Type");

  g.selectAll(".y-label").remove();
  g.append("text")
    .attr("class", "y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Number of Products");

  // Bar labels
  g.selectAll(".bar-labels").remove();
  const labelGroup = g.append("g").attr("class", "bar-labels");

  labelGroup.selectAll("text")
    .data(labels)
    .enter()
    .append("text")
    .attr("x", d => x(d.key) + x.bandwidth() / 2)
    .attr("y", d => y(d.value) - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "10px")
    .attr("fill", "#333")
    .text(d => d.value);
}






function drawScatterPlot(g, data) {
  const margin = scatterMargin;
  const width = scatterWidth + margin.left + margin.right;
  const height = scatterHeight + margin.top + margin.bottom;

  //creates linear scale for price data
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Price)).nice()
    .range([margin.left, width - margin.right]);
  //creates linear scale for ranking
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Rank)).nice()
    .range([height - margin.bottom, margin.top]);

  g.attr("width", width).attr("height", height);

  // Create a separate group for zoomable content
  const zoomLayer = g.append("g")
    .attr("class", "zoom-layer")
    .attr("transform", `translate(0, 0)`);

  g.append("defs").append("clipPath")
  .attr("id", "scatter-clip")
  .append("rect")
  .attr("x", margin.left)
  .attr("y", margin.top)
  .attr("width", width - margin.left - margin.right)
  .attr("height", height - margin.top - margin.bottom);

  //create container to be zoomed into
  const scatterContent = zoomLayer.append("g")
    .attr("class", "scatter-content")
    .attr("clip-path", "url(#scatter-clip)");

  const xAxis = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  const yAxis = g.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
  //creates pints for the graph
  const points = scatterContent.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Price))
    .attr("cy", d => y(d.Rank))
    .attr("r", 4)
    .attr("fill", "orange");
  //creates amount to zoom by
  const zoom = d3.zoom()
    .scaleExtent([0.5, 10])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

  function zoomed() {
    //function that handles moving data and changing axes
    const t = d3.event.transform;
    const newX = t.rescaleX(x);
    const newY = t.rescaleY(y);

    scatterContent.selectAll("circle")
      .attr("cx", d => newX(d.Price))
      .attr("cy", d => newY(d.Rank));

    xAxis.call(d3.axisBottom(newX));
    yAxis.call(d3.axisLeft(newY));
  }

  g.call(zoom);

  // Axes labels (not affected by zoom)
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Price");
  g.append("text")
  .attr("x", width / 2)
  .attr("y", height+5)
  .attr("text-anchor", "middle")
  .attr("font-size", "10px")
  .text("double click to zoom press minus to zoomout");

  g.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Rank");
  //creates a button to reset the zoom 
  const buttonSize = 24;
  const buttonGroup = g.append("g")
  .attr("class", "zoom-out-button")
  .attr("transform", `translate(${width - buttonSize - 10}, ${margin.top})`)
  .style("cursor", "pointer")
  .on("click", () => {
    g.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  });

// Draw button background
buttonGroup.append("rect")
  .attr("width", buttonSize)
  .attr("height", buttonSize)
  .attr("fill", "#eee")
  .attr("stroke", "#333")
  .attr("rx", 4)
  .attr("ry", 4);

// Draw minus sign
buttonGroup.append("line")
  .attr("x1", 6)
  .attr("y1", buttonSize / 2)
  .attr("x2", buttonSize - 6)
  .attr("y2", buttonSize / 2)
  .attr("stroke", "black")
  .attr("stroke-width", 2);

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
