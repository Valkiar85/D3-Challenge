var svg_wrapper_width = 1000;
var svg_wrapper_height = 700;

var table_margin = {
    top: 40,
    right: 70,
    bottom: 300,
    left: 130
  };
  
var width = svg_wrapper_width - table_margin.left - table_margin.right;
var height = svg_wrapper_height - table_margin.top - table_margin.bottom;

// DIV Class to Scatter
var scatter_chart = d3.select('#scatter')
  .append('div')
  .classed('scatter_chart', true);

// SVG Wrapper
var svg_wrapper = scatter_chart
  .append("svg")
  .attr("width", svg_wrapper_width)
  .attr("height", svg_wrapper_height);

// SVG Wrapper Group
var scatter_chart_group = svg_wrapper.append("g")
  .attr("transform", `translate(${table_margin.left}, ${table_margin.top})`);

// Parameters in Axis
var chosen_x_axis = "poverty";
var chosen_y_axis = "healthcare";

// Function Update xScale on Click on the Axis
function xScale(data_poverty, chosen_x_axis) {
    // create scales
    var x_linear_scale = d3.scaleLinear()
      .domain([d3.min(data_poverty, d => d[chosen_x_axis]) * 0.9,
        d3.max(data_poverty, d => d[chosen_x_axis]) * 1.3])
      .range([0, width]);
  
    return x_linear_scale;
  
}

// Function Update yScale on Click on the Axis
function yScale(data_poverty, chosen_y_axis) {
    // Create Scale Functions for the scatter_chart (chosen_y_axis)
    var y_linear_scale = d3.scaleLinear()
      .domain([d3.min(data_poverty, d => d[chosen_y_axis]) * 0.9,
        d3.max(data_poverty, d => d[chosen_y_axis]) * 1.3
      ])
      .range([height, 0]);
    return y_linear_scale;
}

// Update xAxis
  function renderx_axis(update_x_scale, x_axis) {
    var axis_bottom = d3.axisBottom(update_x_scale);
    x_axis.transition()
    .duration(1700)
    .call(axis_bottom);

  return x_axis;
}

// Update yAxis
  function rendery_axis(newYScale, y_axis) {
    var axis_left = d3.axisLeft(newYScale);
      y_axis.transition()
      .duration(1700)
      .call(axis_left);
  return y_axis;
}

// Function Transition to Circles
function renderCircles(group_circles, update_x_scale, chosen_x_axis, newYScale, chosen_y_axis) {
    group_circles.transition()
    .duration(1700)
    .attr('cx', data => update_x_scale(data[chosen_x_axis]))
    .attr('cy', data => newYScale(data[chosen_y_axis]))

  return group_circles;
}

// Function Update State Labels
function renderText(group_text, update_x_scale, chosen_x_axis, newYScale, chosen_y_axis) {
    group_text.transition()
    .duration(1700)
    .attr('x', d => update_x_scale(d[chosen_x_axis]))
    .attr('y', d => newYScale(d[chosen_y_axis]));

  return group_text
}

// Function Style x-axis Values Tooltips
function styleX(value, chosen_x_axis) {

  // Value Poverty
  if (chosen_x_axis === 'poverty') {
      return `${value}%`;
  }
  // Value Household Income
  else if (chosen_x_axis === 'income') {
      return `${value}`;
  }
  else {
    return `${value}`;
  }
}

// Function Update Circle with Tooltip
function updateToolTip(chosen_x_axis,chosen_y_axis, group_circles) {

    var xLabel,yLabel;

  // X Label Properties
    if (chosen_x_axis === "poverty") {
        xlabel = "Poverty:";
    }
    
    else if (chosen_x_axis === 'income'){
        xLabel = 'Median Income:';
    }
    
    else {
       xLabel = 'Age:';
        }

  // Y Label Properties
  
  if (chosen_y_axis ==='healthcare') {
       yLabel = "No Healthcare:"
  }
  else if(chosen_y_axis === 'obesity') {
       yLabel = 'Obesity:';
  }
  
  else{
     yLabel = 'Smokers:';
  }

  // Creation of Tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function(d) {
        return (`${d.state}<br>${xLabel} ${styleX(d[chosen_x_axis], chosen_x_axis)}<br>${yLabel} ${d[chosen_y_axis]}%`);
  });

  group_circles.call(toolTip);

  // Tooltip Mouseover Mouseout
  group_circles.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

    return group_circles;
  }
  
  // Retrieve Data from the CSV File and Execute everything below
d3.csv("assets/data/data.csv").then(function(data_poverty, err) {
    if (err) throw err;
    console.log(data_poverty);
    // parse data
    data_poverty.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;

    });

// Create xScale and yScale for the Scatter Chart
var x_linear_scale = xScale(data_poverty, chosen_x_axis);
var y_linear_scale = yScale(data_poverty, chosen_y_axis);

// Create Initial Axis
var axis_bottom = d3.axisBottom(x_linear_scale);
var axis_left = d3.axisLeft(y_linear_scale);

// X_Axis
var x_axis = scatter_chart_group.append("g")
.classed("x-axis", true)
.attr("transform", `translate(0, ${height})`)
.call(axis_bottom);

// Y_axis
var y_axis = scatter_chart_group.append('g')
.classed('y-axis', true)
.call(axis_left);

 // Append Circles
 var group_circles = scatter_chart_group.selectAll("circle")
 .data(data_poverty)
 .enter()
 .append("circle")
 .attr("cx", d => x_linear_scale(d[chosen_x_axis]))
 .attr("cy", d => y_linear_scale(d[chosen_y_axis]))
 .attr("r", 15)
 .attr("class","stateCircle")
 .attr("opacity", ".75");

// Append Text
var group_text = scatter_chart_group.selectAll('.stateText')
.data(data_poverty)
.enter()
.append('text')
.classed('stateText', true)
.attr('x', d => x_linear_scale(d[chosen_x_axis]))
.attr('y', d => y_linear_scale(d[chosen_y_axis]))
.attr('dy', 3)
.attr('font-size', '10px')
.text(function(d){return d.abbr});

// Group X-Axis Labels
 var group_xlabels = scatter_chart_group.append('g')
 .attr('transform', `translate(${width / 2}, ${height + 10 + table_margin.top})`);

// Label Poverty
var label_poverty = group_xlabels.append('text')
 .classed('aText', true)
 .classed('active', true)
 .attr('x', 0)
 .attr('y', 20)
 .attr('value', 'poverty')
 .text('In Poverty (%)');

 // Label Age
var label_age = group_xlabels.append('text')
 .classed('aText', true)
 .classed('inactive', true)
 .attr('x', 0)
 .attr('y', 40)
 .attr('value', 'age')
 .text('Age (Median)'); 

// Label Income
var label_income = group_xlabels.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 60)
      .attr('value', 'income')
      .text('Household Income (Median)')

// Group Y-Axis Labels
var group_ylabels = scatter_chart_group.append('g')
.attr('transform', `translate(${0 - table_margin.left/4}, ${height/2})`);

// Label Healthcare
var label_healthcare = group_ylabels.append('text')
      .classed('aText', true)
      .classed('active', true)
      .attr('x', 0)
      .attr('y', 0 - 20)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'healthcare')
      .text('Without Healthcare (%)');

// Label Smoker
    var label_smoker = group_ylabels.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 40)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'smokes')
      .text('Smoker (%)');

// Label Obese
    var label_obesse = group_ylabels.append('text')
      .classed('aText', true)
      .classed('inactive', true)
      .attr('x', 0)
      .attr('y', 0 - 60)
      .attr('dy', '1em')
      .attr('transform', 'rotate(-90)')
      .attr('value', 'obesity')
      .text('Obese (%)');

 // Tooltip Update
 var group_circles = updateToolTip(chosen_x_axis, chosen_y_axis, group_circles);

 // X Axis Event Listener
 group_xlabels.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if (value != chosen_x_axis) {

     // Chosen X with Value
     chosen_x_axis = value; 

     // X Scale
     x_linear_scale = xScale(data_poverty, chosen_x_axis);

     // Update X Axis
     x_axis = renderx_axis(x_linear_scale, x_axis);

     // Update Circles with X Values
     group_circles = renderCircles(group_circles, x_linear_scale, chosen_x_axis, y_linear_scale, chosen_y_axis);

     // Update Text
     group_text = renderText(group_text, x_linear_scale, chosen_x_axis, y_linear_scale, chosen_y_axis);

     // Update Tooltip
     group_circles = updateToolTip(chosen_x_axis, chosen_y_axis, group_circles);

     // Change Classes
     if (chosen_x_axis === 'poverty') {
       label_poverty.classed('active', true).classed('inactive', false);
       label_age.classed('active', false).classed('inactive', true);
       label_income.classed('active', false).classed('inactive', true);
     }
     else if (chosen_x_axis === 'age') {
       label_poverty.classed('active', false).classed('inactive', true);
       label_age.classed('active', true).classed('inactive', false);
       label_income.classed('active', false).classed('inactive', true);
     }
     else {
       label_poverty.classed('active', false).classed('inactive', true);
       label_age.classed('active', false).classed('inactive', true);
       label_income.classed('active', true).classed('inactive', false);
     }
   }
 });

 // Y Axis Event Listener
 group_ylabels.selectAll('text')
 .on('click', function() {
   var value = d3.select(this).attr('value');

   if(value !=chosen_y_axis) {

       // Chosen Y with Value  
       chosen_y_axis = value;

       // Y Scale
       y_linear_scale = yScale(data_poverty, chosen_y_axis);

       // Update Y Axis
       y_axis = rendery_axis(y_linear_scale, y_axis);

       // Update Circles with Y Values
       group_circles = renderCircles(group_circles, x_linear_scale, chosen_x_axis, y_linear_scale, chosen_y_axis);

       // Update Text
       group_text = renderText(group_text, x_linear_scale, chosen_x_axis, y_linear_scale, chosen_y_axis);

       // Update Tooltip
       group_circles = updateToolTip(chosen_x_axis, chosen_y_axis, group_circles);

       // Change Classes
       if (chosen_y_axis === 'obesity') {
         label_obesse.classed('active', true).classed('inactive', false);
         label_smoker.classed('active', false).classed('inactive', true);
         label_healthcare.classed('active', false).classed('inactive', true);
       }
       else if (chosen_y_axis === 'smokes') {
         label_obesse.classed('active', false).classed('inactive', true);
         label_smoker.classed('active', true).classed('inactive', false);
         label_healthcare.classed('active', false).classed('inactive', true);
       }
       else {
         label_obesse.classed('active', false).classed('inactive', true);
         label_smoker.classed('active', false).classed('inactive', true);
         label_healthcare.classed('active', true).classed('inactive', false);
       }
     }
   });
  });