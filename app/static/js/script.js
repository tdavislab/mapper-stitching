let that = this;
var gge1 = [];
var gge2 = [];
var gge3 = [];
var gge4 = [];

this.side_bar = new DataLoader([], []);

$("#import").click(function(){
    $("#files").click();
})

var tooltipDiv = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.select("#files")
    .on("change",()=>{
        let files = $('#files')[0].files[0];
        let fileReader = new FileReader();
        fileReader.onload = function(fileLoadedEvent) {
            let textFromFileLoaded = fileLoadedEvent.target.result;
            $.ajax({
                type: "POST",
                url: "/data_process",
                data: textFromFileLoaded,
                dataType:'text',
                success: function (response) {
                    response = JSON.parse(response);
                    that.side_bar = new DataLoader(response.columns, response.categorical_columns, response.other_columns);
                },
                error: function (error) {
                    console.log("error",error);
                    alert("Incorrect data format!");
                }
            })
            d3.select(".columns-group")
                .style("max-height","1000px")
                .style("visibility", "visible")
        }
        fileReader.readAsText(files, "UTF-8");
    })


d3.select("#mapper_loader")
    .on("click",()=>{
        if(that.side_bar.all_cols.length>0){
            let mapper_data = {"cols":that.side_bar.selected_cols, "all_cols":that.side_bar.all_cols, "categorical_cols":that.side_bar.categorical_cols, "config":that.side_bar.config};
			console.log( that.side_bar.config) 
            $.post("/mapper_loader",{
                data: JSON.stringify(mapper_data)
            }, function(res){
				console.log(res);
				// let rawData = res.rawData;
				// let xdata = Object.values(rawData[columns[i]])//[{x: 1, y: 1}, {x: 2, y: 4},{x: 3, y: 9}, {x: 4, y: 16}, {x: 5, y: 25}];
				// let ydata = Object.values(rawData[columns[j]])//[{x: 1, y: 1}, {x: 2, y: 4},{x: 3, y: 9}, {x: 4, y: 16}, {x: 5, y: 25}];
				let all_mappers = new Graph(res.allMappers, that.side_bar.all_cols, that.side_bar.selected_cols, res.connected_components, that.side_bar.categorical_cols, that.side_bar.other_cols, res.rawData);
				// let allMappers = res.allMappers;
				// console.log( allMappers) 
				// let n = that.side_bar.selected_cols.length;
				// const size = 900;
				// d3.select('.viewer-graph__graph').selectAll('svg').remove();
				// let svg = d3.select('.viewer-graph__graph').append('svg')
				// 	.attr('width', size)
				// 	.attr('height', size);

				// let k = 0
				// let labelG = svg.append('g');
				// for (let i = 0; i < n; i++) { //allMappers.length; i++) {
				// 		let width = size / n;
				// 		labelG.append('text')
				// 			.attr('x', width * i + width / 2)
				// 			.attr('y', 10)
				// 			.text(that.side_bar.selected_cols[i])

				// 		labelG.append('text')
				// 			.attr('y', width * i + width / 2)
				// 			.attr('x', 0)
				// 			.text(that.side_bar.selected_cols[i])
				// }
				// let rawData = res.rawData;
				// for (let i = 0; i < n; i++) { //allMappers.length; i++) {
				// 	for (let j = i; j < n; j++) {//allMappers.length; i++) {
				// 		let res = allMappers[k];
				// 		k += 1;
				// 		let width = size / n;
				// 		let height = size / n;
				// 		let padding = 10;
				// 		let x = j * (width + padding);
				// 		let y = i * (height + padding);
				// 		let g = svg.append('g')
				// 			.attr('class', 'graph')
							// .attr('transform', `translate(${x+20}, ${y+20})`);

				// 		g.append('rect')
				// 			.attr('width', width)
				// 			.attr('height', height)
				// 			.attr('stroke', '#ecf1f5')
				// 			.style('fill', '#ecf1f5')

				// 		var clip = g.append("defs").append("svg:clipPath")
				// 			.attr("id", "clip")
				// 			.append("svg:rect")
				// 			.attr("id", "clip-rect")
				// 			.attr("x", "0")
				// 			.attr("y", "0")
				// 			.attr('stroke', '#ecf1f5')
				// 			.attr("width", width)
				// 			.attr("height", height);

				// 		var graphG = g.append("g")
				// 			.attr("clip-path", "url(#clip)")
				// 			.attr('id', 'graph_' + k)
				// 		let columns = that.side_bar.selected_cols;
				// 		let xdata = Object.values(rawData[columns[i]])
				// 		let ydata = Object.values(rawData[columns[j]])
				// 		console.log( 'varssss') 
				// 		console.log( res.vars) 
				// 		new Graph(res.mapper, that.side_bar.all_cols, res.connected_components, that.side_bar.categorical_cols, that.side_bar.other_cols, graphG, width, height, x, y, k,xdata,ydata, res.sub_graphs);
				// 	}
				// }
				// k=0
				// for (let i = 0; i < n; i++) { //allMappers.length; i++) {
				// 	for (let j = 0; j <= i; j++) {//allMappers.length; i++) {
				// 		let res = allMappers[k];
				// 		k += 1;
				// 		let width = size / n;
				// 		let height = size / n;
				// 		let padding = 10;
				// 		let x = j * (width + padding);
				// 		let y = i * (height + padding);
				// 		let g = svg.append('g')
				// 			.attr('class', 'graph')
				// 			.attr('transform', `translate(${x+20}, ${y+20})`);

				// 		g.append('rect')
				// 			.attr('width', width)
				// 			.attr('height', height)
				// 			.attr('stroke', '#ecf1f5')
				// 			.style('fill', '#ecf1f5')

				// 		var clip = g.append("defs").append("svg:clipPath")
				// 			.attr("id", "clip")
				// 			.append("svg:rect")
				// 			.attr("id", "clip-rect")
				// 			.attr("x", "0")
				// 			.attr("y", "0")
				// 			.attr('stroke', '#ecf1f5')
				// 			.attr("width", width)
				// 			.attr("height", height);

				// 		var graphG = g.append("g")
				// 			.attr("clip-path", "url(#clip)")
				// 			.attr('id', 'graph_' + k)
				// 		let columns = that.side_bar.selected_cols;
				// 		let xdata = Object.values(rawData[columns[i]])
				// 		let ydata = Object.values(rawData[columns[j]])
				// 		console.log( 'varssss') 
				// 		console.log( res.vars) 
				// 		new Graph(res.mapper, that.side_bar.all_cols, res.connected_components, that.side_bar.categorical_cols, that.side_bar.other_cols, graphG, width, height, x, y, k,xdata,ydata, res.sub_graphs);
				// 	}
				// }

				// select();


				// rawData = res.rawData;
				// for (let i = 0; i < n; i++) {
				// 	for (let j = i+1; j < n; j++) {
				// 		const size = 900;
				// 		let ssvg = d3.select('.viewer-graph__graph').select('svg');
				// 		console.log( 'faffaf') 

				// 		console.log( i + ', ' + j) 
				// 		let width = size / n - 10;
				// 		let height = size / n;
				// 		let padding = 10;
				// 		let dx = i * (width + padding);
				// 		let dy = j * (height + padding);
				// 		let svg = ssvg.append('g')
				// 			.attr('class', 'scatterplot')
				// 			.attr('transform', `translate(${dx+10 + i*10}, ${dy})`);
				// 		console.log([i,j])
				// 		let columns = that.side_bar.selected_cols;
				// 		let xdata = Object.values(rawData[columns[i]])//[{x: 1, y: 1}, {x: 2, y: 4},{x: 3, y: 9}, {x: 4, y: 16}, {x: 5, y: 25}];
				// 		let ydata = Object.values(rawData[columns[j]])//[{x: 1, y: 1}, {x: 2, y: 4},{x: 3, y: 9}, {x: 4, y: 16}, {x: 5, y: 25}];

				// 			// Add X axis
				// 			var x = d3.scaleLinear()
				// 				.domain([d3.min(xdata), d3.max(xdata)])
				// 				.range([ 0, width - padding]);
				// 			svg.append("g")
				// 				.attr("transform", "translate(0," + height + ")")
				// 				.call(d3.axisBottom(x));

				// 			// Add Y axis
				// 			var y = d3.scaleLinear()
				// 				.domain([d3.min(ydata), d3.max(ydata)])
				// 				.range([ height - padding, 0]);
				// 			svg.append("g")
				// 				.call(d3.axisLeft(y));

				// 			let points = []
							
				// 			for (let i = 0; i < xdata.length; i++) {
				// 				points.push({
				// 					x: x(xdata[i]),
				// 					y: y(ydata[i])
				// 				})
				// 			}
				// 			// Add dots
				// 			svg.append('g')
				// 				.classed('circleGroup', true)
				// 				.selectAll("dot")
				// 				.data(points)
				// 				.enter()
				// 				.append("circle")
				// 				.attr("cx", function (d) { return d.x } )
				// 				.attr("cy", function (d, i) { return d.y } )
				// 				.attr("r", 1.5)
				// 				.style("fill", "#69b3a2")

				// 	}
				// }
				// selectScatterPlot();
				//that.graph = new Graph(res.mapper, that.side_bar.all_cols, res.connected_components, that.side_bar.categorical_cols, that.side_bar.other_cols, ssvg, width, height);
				//that.graph = new Graph(res.mapper, that.side_bar.all_cols, res.connected_components, that.side_bar.categorical_cols, that.side_bar.other_cols, sssvg, width, height);
				console.log( 'before reg') 
				//d3.select('.scatterplot').select('.circleGroup').call(brush);

				// that.regression = new Regression(that.side_bar.all_cols);
            })
        } else{
            alert("Please import a dataset frist!")
        } 
    })


let coll  = document.getElementsByClassName("block_title");
for(let i=0; i<coll.length; i++){
    coll[i].addEventListener("click", function(){
        this.classList.toggle("collapsed")
        let block_body = this.nextElementSibling;
        console.log(block_body.id)
        if (block_body.style.maxHeight){
            block_body.style.maxHeight = null;
        } else {
            // block_body.style.maxHeight = block_body.scrollHeight + "px";
            if(block_body.id === "block_body_histogram"){
                block_body.style.maxHeight = "500px";
            } else{
                block_body.style.maxHeight = "1000px";
            }
        } 
    })
}

let filtering_para_range = document.getElementById("filtering-para-range");
let filtering_range_containers = document.getElementsByClassName("param-range-container-inner_filtering")
filtering_para_range.addEventListener("click", function(){
    for(let i=0; i<filtering_range_containers.length; i++){

        if(filtering_range_containers[i].style.maxHeight){
            filtering_range_containers[i].style.maxHeight = null;
        } else{
            filtering_range_containers[i].style.maxHeight = filtering_range_containers[i].scrollHeight + "px";
        }
    }
})

let clustering_para_range = document.getElementById("clustering-para-range");
let clustering_range_containers = document.getElementsByClassName("param-range-container-inner_clustering");
clustering_para_range.addEventListener("click", function(){
    for(let i=0; i<clustering_range_containers.length; i++){
        if(clustering_range_containers[i].style.maxHeight){
            clustering_range_containers[i].style.maxHeight = null;
        } else{
            clustering_range_containers[i].style.maxHeight = clustering_range_containers[i].scrollHeight + "px";
        }
    }
})

// let label_column_dropdown = document.getElementById("label_column_selection");
// label_column_dropdown.onchange = function(){
//     let label_column = label_column_dropdown.options[label_column_dropdown.selectedIndex].text;
//     console.log(label_column)
//     if(that.graph){
//         let labels;
//         if(label_column != "row index"){
//             $.ajax({
//                 type: "POST",
//                 url: "/update_cluster_details",
//                 data: label_column,
//                 dataType:'text',
//                 success: function (response) {
//                     labels = JSON.parse(response).labels;
//                     that.graph.label_column = label_column;
//                     that.graph.labels = labels;        
//                     that.graph.text_cluster_details(that.graph.selected_nodes, label_column, labels);

//                 },
//                 error: function (error) {
//                     console.log("error",error);
//                 }
//             })
//         } else {
//             that.graph.label_column = label_column;
//             that.graph.labels = labels;  
//             that.graph.text_cluster_details(that.graph.selected_nodes, label_column, labels);
//         }
//     }
// }

function select() {
	let pointSet = [];
	let selected;
	d3.selectAll('.graph').selectAll('circle')
		.on('click', function(d) {
			pointSet = new Set(d.vertices);
			selected = d3.select(this).classed('selected')
			let fillColor = selected ? '#fff' : 'red';

			d3.selectAll('.graph')
				.selectAll('circle')
				.filter((d) => setIntersection(d.vertices, pointSet).size > 0)
				.style('fill', fillColor)
				.classed('selected', !selected)

			fillColor = selected ? '#69b3a2' : 'red'; 
			var dat = d3.selectAll('.scatterplot').selectAll('circle')
				.filter((d, i) => pointSet.has(i))
				.style('fill', fillColor)
				.classed('selected', !selected)
				.data()
			let x = dat.map(d => d.x);
			let y = dat.map(d => d.y);
			console.log( corr(x,y)) 
		})
}

function corr(d1, d2) {
  let { min, pow, sqrt } = Math
  let add = (a, b) => a + b
  let n = min(d1.length, d2.length)
  if (n === 0) {
    return 0
  }
  [d1, d2] = [d1.slice(0, n), d2.slice(0, n)]
  let [sum1, sum2] = [d1, d2].map(l => l.reduce(add))
  let [pow1, pow2] = [d1, d2].map(l => l.reduce((a, b) => a + pow(b, 2), 0))
  let mulSum = d1.map((n, i) => n * d2[i]).reduce(add)
  let dense = sqrt((pow1 - pow(sum1, 2) / n) * (pow2 - pow(sum2, 2) / n))
  if (dense === 0) {
    return 0
  }
  return (mulSum - (sum1 * sum2 / n)) / dense
}
const setIntersection = (a, b) => new Set([...a].filter(x => b.has(x)));

function selectScatterPlot() {
	d3.selectAll('.scatterplot').selectAll('circle')
		.on('click', function(d, i) {
			let pointSet = new Set([i]);
			let selected = d3.select(this).classed('selected')
			let fillColor = selected ? '#fff' : 'red';

			console.log( fillColor) 
			console.log( selected) 

			d3.selectAll('.scatterplot')
				.selectAll('circle')
				.filter((d, i) => setIntersection([i], pointSet).size > 0)
				.style('fill', fillColor)
				.classed('selected', !selected)

			d3.selectAll('.graph')
				.selectAll('circle')
				.filter((d) => setIntersection(d.vertices, pointSet).size > 0)
				.style('fill', fillColor)
				.classed('selected', !selected)
		})
}

/*
const brush = d3.brush()
	.on("start brush end", brushed);

//d3.select('.scatterplot').call(brush);
let dot = d3.select('.scatterplot').selectAll('circle')
function brushed(selection) {
	let value = [];
	console.log( selection) 
	if (selection) {
		const [[x0, y0], [x1, y1]] = selection;
		dot.style("fill", "gray")
			.filter(d => x0 <= d.x && d.x < x1 && y0 <= d.y && d.y < y1)
			.style("fill", "steelblue")
	} else {
		dot.style("stroke", "steelblue");
	}
}
*/
