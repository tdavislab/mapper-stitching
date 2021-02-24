var entropy_scales = {};
class Graph{
    constructor(all_mappers, all_cols, selected_cols, connected_components, categorical_cols, other_cols, raw_data, xdata=[],ydata=[], x=0, y=0, k = 0){
        console.log( 'initttttttttttttttttttttttttttt') 
        this.all_mappers = all_mappers;
        this.all_cols = all_cols;
        this.selected_cols = selected_cols;
        this.raw_data = raw_data;
        this.k = k;
        console.log(this.raw_data)

        // d3.select(".sidebar-container").style("height", this.height)

        // histogram SVG
        // this.hist_margin = {"top":15, "left":10, "between":20, "bar_height":5};
        // this.hist_width = $(d3.select("#workspace-histogram").node()).width();
        // this.hist_height = this.hist_margin.top*2 + this.col_keys.length*(this.hist_margin.bar_height+this.hist_margin.between);
        // this.hist_scale = this.get_scale();

        // color functions
        this.COLORMAPS = {"- None -":undefined, 
        "Yellow, Red":["yellow", "red"], 
        "Purple, Red":["purple", "red"], 
        "Green, Blue":["green", "blue"]};
        

        this.entropy_label = {"entropy_dm": "DM", "entropy_wi": "WI", "entropy_am":"AM", "ph0":"Dim0 PH"};
        this.measures_label2id = {"Entropy: Distance Matrix": "entropy_dm", "Entropy: Wiener Index":"entropy_wi", "Entropy: Adjacent Matrix":"entropy_am", "0-Dim Homology":"ph0"};
        this.subgraphs = ['sub_graphs_v1', 'sub_graphs_v2'];

        this.toggle_subgraph_version();
        this.toggle_entropy_value();
        this.get_all_measures();
        this.get_color_scales();
        this.color_functions();
        this.draw_all_mappers();
        this.select_view();


		// this.graphSvg.append('text')
		// 	.attr('y', 20)
		// 	.text('Entropy (distance matrix): ' + f(ge1))
		// this.graphSvg.append('text')
		// 	.attr('y', 40)
		// 	.text('Entropy (Wiener index): ' + f(ge2))
		// this.graphSvg.append('text')
		// 	.attr('y', 60)
		// 	.text('Entropy (AM): ' + f(-mewEnt))
        // this.COLORMAPS = [
        //     { 'label': '- None -', 'scheme': null },
        //     // { 'label': 'Rainbow', 'scheme': 'interpolateRainbow' },
        //     { 'label': 'Yellow, Red', 'scheme': 'interpolateYlOrRd' },
        //     // { 'label': 'Yellow, Blue', 'scheme': 'interpolateYlOrBr' },
        //     // { 'label': 'Yellow, Green', 'scheme': 'interpolateYlGn' },
        //     // { 'label': 'Yellow, Green, Blue', 'scheme': 'interpolateYlGnBu' },
        //     { 'label': 'Purple, Red', 'scheme': 'interpolatePuRd' },
        //     // { 'label': 'Purple, Blue', 'scheme': 'interpolatePuBu' },
        //     // { 'label': 'Purple, Blue, Green', 'scheme': 'interpolatePuBuGn' },
        //     { 'label': 'Green, Blue', 'scheme': 'interpolateGnBu' },
        //     // { 'label': 'Red', 'scheme': 'interpolateOrRd' },
        //     // { 'label': 'Red, Blue', 'scheme': 'interpolateRdPu' },
        //     // { 'label': 'Blue', 'scheme': 'interpolateBlues' },
        //     // { 'label': 'Blue, Purple', 'scheme': 'interpolateBuPu' }
        //   ]      
        
        // this.label_column = "row index";

        // this.size_functions();
        // this.select_view();
        // this.selection_nodes();
    }

    toggle_subgraph_version(){
        let that = this;
        let subgraph_text2label = {"Interior Subgraph": "sub_graphs_v1", "Boundary Subgraph": "sub_graphs_v2"};
        let subgraph_dropdown = document.getElementById("subgraph_version-select");
        this.subgraph_version = subgraph_text2label[subgraph_dropdown.options[subgraph_dropdown.selectedIndex].text];

        subgraph_dropdown.onchange = function(){
            that.subgraph_version = subgraph_text2label[subgraph_dropdown.options[subgraph_dropdown.selectedIndex].text];
            console.log(that.subgraph_version);
            that.get_color_scales();
            that.color_functions();
            that.draw_all_mappers();
        }
    }

    toggle_entropy_value(){
        if(d3.select("#entropy_values").property("checked")){
            // show values
            d3.selectAll(".entropy_value_text").style("visibility", "visible");
        } else {
            // hide values
            d3.selectAll(".entropy_value_text").style("visibility", "hidden");
        }
        d3.select("#entropy_values").on("change", ()=>{
            if(d3.select("#entropy_values").property("checked")){
                // show values
                d3.selectAll(".entropy_value_text").style("visibility", "visible");
            } else {
                // hide values
                d3.selectAll(".entropy_value_text").style("visibility", "hidden");
            }
        })
    }

    select_view(){
        d3.select("#graph_view").classed("selected", true);
        d3.select("#graph_view")
            .on("click", ()=>{
                d3.selectAll(".viewer-graph__toolbar-item").classed("selected", false);
                d3.select("#graph_view").classed("selected", true);
                this.draw_all_mappers();
            })
        d3.select("#scatter_matrix_view")
            .on("click", ()=>{
                d3.selectAll(".viewer-graph__toolbar-item").classed("selected", false);
                d3.select("#scatter_matrix_view").classed("selected", true);
                this.draw_all_mappers("scatter_matrix");
            })
    }

    get_color_scales(){
        let entropy_dm = [];
        let entropy_wi = [];
        let entropy_am = [];
        let ph0 = []

        let entropy_dm_diff = [];
        let entropy_wi_diff = [];
        let entropy_am_diff = [];
        let ph0_diff = []

        this.all_mappers.forEach(mapper=>{
            for(let v in mapper[this.subgraph_version].measures){
                let m = mapper[this.subgraph_version].measures[v];
                entropy_dm = entropy_dm.concat(m.entropy_dm);
                entropy_wi = entropy_wi.concat(m.entropy_wi);
                entropy_am = entropy_am.concat(m.entropy_am);
                ph0 = ph0.concat(m.ph0);
            }
            if(mapper.vars.length > 1){
                for(let v in mapper[this.subgraph_version].measures){
                    let md = mapper[this.subgraph_version].measures_diff[v];
                    entropy_dm_diff = entropy_dm_diff.concat(md.entropy_dm);
                    entropy_wi_diff = entropy_wi_diff.concat(md.entropy_wi);
                    entropy_am_diff = entropy_am_diff.concat(md.entropy_am);
                    ph0_diff = ph0_diff.concat(md.ph0);
                }
                
            }
        });

        // range = [min, max];
        // let entropy_dm_range = [Math.floor(Math.min(...entropy_dm)), Math.ceil(Math.max(...entropy_dm))];
        let entropy_dm_range = [Math.floor(Math.min(...entropy_dm)*10)/10, Math.ceil(Math.max(...entropy_dm))+0.5];
        let entropy_wi_range = [Math.floor(Math.min(...entropy_wi)), Math.ceil(Math.max(...entropy_wi))];
        let entropy_am_range = [Math.floor(Math.min(...entropy_am)*10)/10, Math.ceil(Math.max(...entropy_am))+0.5];
        let ph0_range = [Math.floor(Math.min(...ph0)), Math.ceil(Math.max(...ph0))];

        // let dm_scale = d3.scaleSequential(d3.interpolateOrRd).domain(entropy_dm_range);
        let dm_scale = d3.scaleSequential(function(t){
            // let dt = Math.min((entropy_dm_range[1] - entropy_dm_range[0])/5, 0.3);
            let dt = 0.3
            return d3.interpolateOrRd(t+dt);
            })
            .domain(entropy_dm_range);
        let wi_scale = d3.scaleSequential(d3.interpolateOrRd).domain(entropy_wi_range);
        let am_scale = d3.scaleSequential(function(t){
            // let dt = Math.min((entropy_dm_range[1] - entropy_dm_range[0])/5, 0.3);
            let dt = 0.3
            return d3.interpolateOrRd(t+dt);
            })
            .domain(entropy_am_range);
        let ph0_scale = d3.scaleOrdinal(d3.schemeReds[Math.ceil(Math.max(...ph0))]);
        this.ph0_scale_dict = {};
        for(let i=1; i<=Math.ceil(Math.max(...ph0)); i++){
            this.ph0_scale_dict[i] = ph0_scale(i);
        }
        // let ph0_scale = d3.scaleSequential(d3.interpolateOrRd).domain(ph0_range);
        // let ph0_scale = d3.scaleOrdinal(d3.schemeReds[ph0_range[1]]).domain(ph0_range);
        this.measures_color_scales = {"entropy_dm": dm_scale, "entropy_wi": wi_scale, "entropy_am": am_scale, "ph0":ph0_scale};

        let entropy_dm_diff_range = [Math.floor(Math.min(...entropy_dm_diff)*10)/10, Math.ceil(Math.max(...entropy_dm_diff))+0.5];
        let entropy_wi_diff_range = [Math.floor(Math.min(...entropy_wi_diff)), Math.ceil(Math.max(...entropy_wi_diff))];
        let entropy_am_diff_range = [Math.floor(Math.min(...entropy_am_diff)*10)/10, Math.ceil(Math.max(...entropy_am_diff))+0.5];
        let ph0_diff_range = [Math.floor(Math.min(...ph0_diff)), Math.ceil(Math.max(...ph0_diff))];

        let dm_diff_scale = d3.scaleSequential(function(t){
            // let dt = Math.min((entropy_dm_diff_range[1] - entropy_dm_diff_range[0])/3, 0.3);
            let dt = 0.3;
            return d3.interpolateGnBu(t+dt);
            })
            .domain(entropy_dm_diff_range);
        let wi_diff_scale = d3.scaleSequential(d3.interpolatePuBu).domain(entropy_wi_diff_range);
        let am_diff_scale = d3.scaleSequential(function(t){
            // let dt = Math.min((entropy_dm_diff_range[1] - entropy_dm_diff_range[0])/3, 0.3);
            let dt = 0.3;
            return d3.interpolateGnBu(t+dt);
            })
            .domain(entropy_am_diff_range);
        
        let ph0_diff_val = Math.max(ph0_diff_range[1] - ph0_diff_range[0], 3);

        let ph0_diff_scale = d3.scaleOrdinal(d3.schemeBlues[ph0_diff_val]);
        this.ph0_diff_scale_dict = {};
        for(let i=Math.floor(Math.min(...ph0_diff)); i<=Math.ceil(Math.max(...ph0_diff)); i++){
            this.ph0_diff_scale_dict[i] = ph0_diff_scale(i+1-Math.floor(Math.min(...ph0_diff)));
        }
        this.measures_diff_color_scales = {"entropy_dm": dm_diff_scale, "entropy_wi": wi_diff_scale, "entropy_am": am_diff_scale, "ph0":ph0_diff_scale};

    }

    color_functions(){
        let that=this;
        let value_dropdown = document.getElementById("color_function_values");
        this.measure_id = this.measures_label2id[value_dropdown.options[value_dropdown.selectedIndex].text];
        // this.draw_color_legend(this.measure_id);
        if(this.measure_id === "ph0"){
            this.draw_color_legend_categorical(this.ph0_scale_dict, this.ph0_diff_scale_dict);
        } else{
            this.draw_color_legend(this.measure_id);   
        }
        value_dropdown.onchange = function(){
            that.measure_id = that.measures_label2id[value_dropdown.options[value_dropdown.selectedIndex].text];
            if(that.measure_id === "ph0"){
                that.draw_color_legend_categorical(that.ph0_scale_dict, that.ph0_diff_scale_dict);
            } else{
                that.draw_color_legend(that.measure_id);   
            }
            that.draw_all_mappers();
        }

        this.map_type = d3.select('input[name="map-type"]:checked').node().value;
        d3.select("#color-map-form")
        .on("change", ()=>{
            this.map_type = d3.select('input[name="map-type"]:checked').node().value;
            console.log(this.map_type)
            if(this.map_type === "map-categorical"){
                $('#color-legend-svg').remove();
            } else{ // this.map_type === "map-continuous"
                this.draw_color_legend(this.measure_id);
            }
            this.draw_all_mappers();     
        });
    }

    draw_color_legend(color_val){
        $('#color-legend-svg').remove();
        $('#block_body-inner_color').append('<svg width="0" height="0" id="color-legend-svg"></svg>');
        let color_scale = this.measures_color_scales[color_val];
        let color_scale2 = this.measures_diff_color_scales[color_val];
        let width = $(d3.select("#workspace-color_functions").node()).width();
        // let height = 60*Object.keys(color_scales).length;
        let height = 60*2;
        let axisMargin = 20;
        let textWidth = 20;
        let colorTileNumber = 50;
        let colorTileHeight = 20;
        let colorTileWidth = (width - (axisMargin * 2) - textWidth) / colorTileNumber;
        // let colorTileWidth = (width - (axisMargin * 2)) / colorTileNumber;
        let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height);

        let axisDomain = color_scale.domain();
        let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
        let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin*2- textWidth]);
        let axis = d3.axisBottom(axisScale).tickValues(tickValues)
        svg.append("g").attr("transform", `translate(${textWidth},${40})`).call(axis);
        svg.append("text")
                .attr("transform", `translate(0,${40})`)
            .text(()=>{
                if(color_val === "ph0"){
                    return "LH";
                } else {
                    return "LE";
                }
            })
        let legendGroup = svg.append("g")
            .attr("transform", `translate(${textWidth},0)`);
            // .attr("transform", `translate(0,${i*60})`);
        let domainStep = (axisDomain[1] - axisDomain[0])/colorTileNumber;
        let rects = d3.range(axisDomain[0], axisDomain[1], domainStep);
        let rg = legendGroup.selectAll("rect").data(rects)
            .enter().append("rect")
            .attr('x', d=>axisScale(d))
            .attr('y', 10)
            .attr('width', colorTileWidth-1)
            .attr('height',colorTileHeight)
            .attr('fill', d=>color_scale(d));

        // legend for LHD/LED
        let axisDomain2 = color_scale2.domain();
        let tickValues2 = [axisDomain2[0], d3.mean(axisDomain2), axisDomain2[1]];
        let axisScale2 = d3.scaleLinear().domain(axisDomain2).range([axisMargin, width - axisMargin*2- textWidth]);
        let axis2 = d3.axisBottom(axisScale2).tickValues(tickValues2)
        svg.append("g").attr("transform", `translate(${textWidth},${60+40})`).call(axis2);
        svg.append("text")
                .attr("transform", `translate(0,${60+40})`)
            .text(()=>{
                if(color_val === "ph0"){
                    return "LHD";
                } else {
                    return "LED";
                }
            })
        let legendGroup2 = svg.append("g")
            .attr("transform", `translate(${textWidth},60)`);
            // .attr("transform", `translate(0,${i*60})`);
        let domainStep2 = (axisDomain2[1] - axisDomain2[0])/colorTileNumber;
        let rects2 = d3.range(axisDomain2[0], axisDomain2[1], domainStep2);
        let rg2 = legendGroup2.selectAll("rect").data(rects2)
            .enter().append("rect")
            .attr('x', d=>axisScale2(d))
            .attr('y', 10)
            .attr('width', colorTileWidth-1)
            .attr('height',colorTileHeight)
            .attr('fill', d=>color_scale2(d));

        // for(let i=0; i<Object.keys(color_scales).length; i++){
        //     let color_scale = color_scales[Object.keys(color_scales)[i]];
        //     let axisDomain = color_scale.domain();
        //     let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
        //     let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin*3]);
        //     let axis = d3.axisBottom(axisScale).tickValues(tickValues);
        //     svg.append("g").attr("transform", `translate(${textWidth},${i*60+40})`).call(axis);
        //     svg.append("text")
        //         .attr("transform", `translate(0,${i*60+40})`)
        //         .text(this.entropy_label[Object.keys(color_scales)[i]])
        //     let legendGroup = svg.append("g").attr("transform", `translate(${textWidth},${i*60})`);
        //     let domainStep = (axisDomain[1] - axisDomain[0])/colorTileNumber;
        //     let rects = d3.range(axisDomain[0], axisDomain[1], domainStep);
        //     let rg = legendGroup.selectAll("rect").data(rects)
        //         .enter().append("rect")
        //         .attr('x', d=>axisScale(d))
        //         .attr('y', 10)
        //         .attr('width', colorTileWidth-1)
        //         .attr('height',colorTileHeight)
        //         .attr('fill', d=>color_scale(d));
        // };
    }

    draw_all_mappers(plot_type="mapper_graph"){
        this.clear_mapper();

        // init graph container
        this.svg_container = d3.select("#graphSVG-container");
        this.canvas_width = $(this.svg_container.node()).width();
        this.canvas_height = d3.select("#workspace-graph").node().offsetHeight - 3*d3.select(".viewer-graph__toolbar").node().offsetHeight;

        let n = this.selected_cols.length;
        let padding = 10;
        let graph_width = this.canvas_width / n;
        let graph_height = (this.canvas_height - n*padding) / n;

        for(let i=0; i<n; i++){
            let row_container = this.svg_container.append("div").classed("row", true)
                .style("padding", "10px 15px")
                .style("padding-left", "30px")
                .style("padding-bottom", "0px");
            row_container.append("div")
                // .style("position", "relative")
                // .style("z-index", 1000)
                .attr("id", `column${i}`)
                .style("float", "left")
                // .style("padding-top", `${graph_height/2}px`)
                .style("padding-left", "0px")
                .style("padding-right", "10px")
                .style("width", "1%");
            for(let j=0; j<n; j++){
                let cell_container = row_container.append("div")
                    // .classed(`col-${Math.floor(12/n)}`, true)
                    .style("float", "left")
                    .style("width", `${98/n}%`)
                    .classed("outline", true);
                if(i===0){
                    cell_container.append("div")
                        .classed("column_title", true)
                        .html(this.selected_cols[j]);
                }
                if(j===0){
                    d3.select(`#column${i}`)
                        .style("padding-top", `${graph_height/2+5*this.selected_cols[i].length}px`)
                        .append("div")
                        .classed("rotated_text", true)
                        .html(this.selected_cols[i]);
                }
                let graph_container = cell_container.append("div").classed("graph-container", true);
                let cell_svg = graph_container.append("svg")
                    .attr("id", `graph_svg${i}${j}`)
                    .attr("width", graph_width)
                    .attr("height", graph_height);
                cell_svg.append("g")
                    .classed("graph", true)
                    .attr("id", `graph${i}${j}`);
                cell_svg.append("g")
                    .attr("id", `graph${i}${j}_entropy`);
            }
        }

        this.col_index = {};
        this.col_index_reverse = {};
        this.selected_cols.forEach((c,i)=>{ 
            this.col_index[c] = i; 
            this.col_index_reverse[i] = c;
        });
        console.log("col index", this.col_index)

        this.graph_width = graph_width;
        this.graph_height = graph_height;

        if(plot_type === "mapper_graph"){
            // let color_scale_categorical = d3.scaleOrdinal(d3.schemeCategory10);
            let color_scale_categorical = d3.scaleOrdinal(d3.schemeTableau10);
            this.all_mappers.forEach(mapper=>{
                this.subgraphs.forEach(subg=>{
                    mapper[subg].color_dict = {};
                    mapper.vars.forEach(v=>{
                        mapper[subg].color_dict[v] = [];
                        for(let i=0; i<mapper[subg][v].length; i++){
                            mapper[subg].color_dict[v].push(color_scale_categorical(i));
                        }
                    })
                })
                this.draw_mapper(mapper);
            })
        } else if(plot_type === "scatter_matrix"){
            console.log("scatter_matrix")
            this.draw_scatter_plot();
        }
        
    }

    get_all_measures(){
        this.all_mappers.forEach(mapper=>{
            this.subgraphs.forEach(subg=>{
                mapper[subg].measures = {};
                if(mapper.vars.length === 1){
                    let v = mapper.vars[0];
                    let xdata = Object.values(this.raw_data[v]);
                    let ydata = Object.values(this.raw_data[v]);
                    mapper[subg].measures[v] = this.compute_entropy(mapper[subg][v], xdata, ydata);
                    mapper[subg].measures[v].ph0 = [];
                    mapper[subg][v].forEach(subg_v=>{
                        mapper[subg].measures[v].ph0.push(subg_v.ph0.length);
                    });
                } else{ // mapper.vars.length === 2
                    let v1 = mapper.vars[0];
                    let v2 = mapper.vars[1];
                    let xdata = Object.values(this.raw_data[v1]);
                    let ydata = Object.values(this.raw_data[v2]);
                    mapper[subg].measures[v1] = this.compute_entropy(mapper[subg][v1], xdata, ydata);
                    mapper[subg].measures[v2] = this.compute_entropy(mapper[subg][v2], ydata, xdata);
                    mapper[subg].measures[v1].ph0 = [];
                    mapper[subg][v1].forEach(subg_v1=>{
                        mapper[subg].measures[v1].ph0.push(subg_v1.ph0.length);
                    });
                    mapper[subg].measures[v2].ph0 = [];
                    mapper[subg][v2].forEach(subg_v2=>{
                        mapper[subg].measures[v2].ph0.push(subg_v2.ph0.length);
                    });
                }
            })            
        }) 
        // compute LED / LHD
        let d1_mapper_dict = {};
        let d2_mappers = [];
        let f = d3.format(".2f");
        this.all_mappers.forEach(mapper=>{
            if(mapper.vars.length === 1){
                d1_mapper_dict[mapper.vars[0]] = mapper;
            } else {
                d2_mappers.push(mapper);
            }
        })
        d2_mappers.forEach(mapper=>{
            let col1 = mapper.vars[0];
            let col2 = mapper.vars[1];
            this.subgraphs.forEach(subg=>{
                mapper[subg].measures_diff = {};
                mapper[subg].measures_diff[col1] = {};
                mapper[subg].measures_diff[col2] = {};
                let mapper_col1 = d1_mapper_dict[col1];
                let mapper_col2 = d1_mapper_dict[col2];
                for(let ms in this.entropy_label){
                    mapper[subg].measures_diff[col1][ms] = [];
                    mapper[subg].measures_diff[col2][ms] = [];
                    for(let i=0; i<mapper[subg][col1].length; i++){ // length = # intervals
                        let diff1 = f(parseFloat(mapper[subg].measures[col1][ms][i]) - parseFloat(mapper_col1[subg].measures[col1][ms][i]));
                        mapper[subg].measures_diff[col1][ms].push(diff1);
                        let diff2 = f(parseFloat(mapper[subg].measures[col2][ms][i]) - parseFloat(mapper_col2[subg].measures[col2][ms][i]));
                        mapper[subg].measures_diff[col2][ms].push(diff2);
                    }
                }
                
            })

        })

    }

    compute_entropy(sub_graph, xdata, ydata){
        let entropies = {'entropy_dm':[], 'entropy_wi':[], 'entropy_am':[]};
        for(let i=0; i<sub_graph.length; i++){
            // let nodes = sub_graph[i].nodes.slice(0);
            // let links = sub_graph[i].links.slice(0);

            let nodes = [];
            let links = [];
            sub_graph[i].nodes.forEach(node=>{
                nodes.push(JSON.parse(JSON.stringify(node)));
            })
            sub_graph[i].links.forEach(link=>{
                links.push(JSON.parse(JSON.stringify(link)));
            })


            let nodes_idx = {};
            for(let i=0; i<nodes.length; i++){
                nodes_idx[nodes[i].id] = i+1;
                // nodes[i].id_entity = nodes[i].id;
                nodes[i].id = i+1;
            }
            for(let edge of links){
                edge.source = nodes_idx[edge.source.toString()];
                edge.target = nodes_idx[edge.target.toString()];
            }

            let cyElements = []

            for (let node of nodes) {
                let pointSet = new Set(node.vertices);
                let x = xdata.filter((d, i) => pointSet.has(i));
                let y = ydata.filter((d, i) => pointSet.has(i));
                let c = corr(x,y);
                node.corr = Math.abs(c);
                cyElements.push({data: {id: node.id}})
            }
    
            var mewEnt = 0;
            var totalWeight = 0;
            if(links.length > 0){
                for (let edge of links) {
                    let s = nodes[edge.source - 1].vertices;
                    let t = nodes[edge.target - 1].vertices;
                    t = new Set(t)
                    let intersection = setIntersection(s, t)
                    let jaccardIndex = 1 - intersection.size / (s.length + t.size - intersection.size);
                    totalWeight += jaccardIndex;
                    edge.jaccardIndex = jaccardIndex;
                    cyElements.push({data: {source: edge.source, target: edge.target,
                    jaccardIndex: jaccardIndex}})
                }
                for (let edge of links) {
                    let jaccardIndex = edge.jaccardIndex / totalWeight;
                    if (jaccardIndex && totalWeight)
                        mewEnt += jaccardIndex * Math.log(jaccardIndex);
                }
            }
            
    
            cy.add(cyElements);
            let dm = distanceMatrix(function(d) {return d.data('jaccardIndex')});
            // console.log("dm matrix", dm.matrix)
            let ge1 = globalEntropy1(dm.matrix)
            let ge2 = globalEntropy2(dm.matrix)
            // let ge3 = 0;
            // let le1 = localEntropy1(dm.sd, dm.distanceSum);
            // let le2 = localEntropy2(dm.jSpheres);
    
            // for (let node of nodes) {
            //     node.le1 = le1[node.id];
            //     node.le2 = le2[node.id];
            //     node.graphID = this.k;
            //     ge3 += node.le1;
            // }
    
            cy.elements().remove()

            let f = d3.format(".2f");
            entropies['entropy_dm'].push(f(ge1));
            entropies['entropy_wi'].push(f(ge2));
            entropies['entropy_am'].push(f(-mewEnt));
        }
        return entropies;
    }

    draw_entropy(g, entropy, mapper, col){
        let entropy_g = d3.select("#graph"+g+"_entropy");
        let n =  entropy.length;
        let bar_width = this.graph_width/20;
        let bar_height = Math.min(this.graph_height/(2*n), 20);
        let eg = entropy_g.append("g").attr("transform", `translate(${this.graph_width-6*bar_width}, ${this.graph_height/4})`);
        
        eg.append("text")
            .attr("x", bar_width)
            .text(()=>{
                if(this.measure_id === "ph0"){
                    return "LH";
                } else {
                    return "LE";
                }
            });
        
        let eg_g = eg.selectAll("g").data(entropy)
            .enter().append("g")
            .attr("transform", (d,i)=>`translate(${bar_width}, ${i*bar_height+8})`)
        // eg.selectAll("rect").data(entropy)
            // .enter().append("rect")
        eg_g.append("rect")
            .attr("class", "viewer-graph__rect")
            .attr("id", (d,i)=>"rect_"+g+"_"+i)
            // .attr("x", bar_width)
            // .attr("y", (d,i)=>i*bar_height+8)
            .attr("width", bar_width)
            .attr("height", bar_height)
            .attr("fill", (d,i)=>{
                if(this.map_type === "map-continuous"){
                    return this.measures_color_scales[this.measure_id](d);
                } else {
                    return mapper[this.subgraph_version].color_dict[col][i];
                }
            })
            .attr("stroke", "grey")
            // .on("click", mouseover)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);
        eg_g.append("text")
            .classed("entropy_value_text", true)
            .attr("x", -bar_width*1.5)
            .attr("y", bar_height*2/3)
            .text(d=>d)
            .style("visibility", "hidden");
        eg.append("text")
            // .attr("class", "tooltip")
            .attr("id", "tooltip"+g)
            // .style("visibility", "hidden");

        

        let that = this;

        function mouseover(d, i){
            d3.select("#graph"+g).selectAll(".viewer-graph__vertex-group").classed("faded", true);
            mapper[that.subgraph_version][col][i].nodes.forEach(n=>{
                d3.select("#node_"+g+"_"+n.id).classed("faded", false);
            })
            let coords = d3.mouse(this);
            d3.select("#tooltip"+g)
                .attr("transform", `translate(${coords[0]-30}, ${coords[1]})`)
                .text(d)
                .style("visibility", "visible");
        }
        function mouseout(){
            d3.select("#graph"+g).selectAll(".viewer-graph__vertex-group").classed("faded", false);
            d3.select("#tooltip"+g).style("visibility", "hidden");
        }
            
            
        // let n =  entropy[Object.keys(entropy)[0]].length;
        // let bar_width = 30;
        // let bar_height = 20;
        // // let bar_height = this.graph_height/(2*n);
        // for(let k=0; k<Object.keys(entropy).length; k++){
        //     let e = entropy[Object.keys(entropy)[k]];
        //     let eg = g.append("g").attr("transform", `translate(${this.graph_width*3/4}, ${this.graph_height/4})`);
        //     eg.append("text")
        //         .attr("x", k*bar_width+5)
        //         .text(this.entropy_label[Object.keys(entropy)[k]]);
        //     eg.selectAll("rect").data(e)
        //         .enter().append("rect")
        //         .attr("x", k*bar_width)
        //         .attr("y", (d,i)=>i*bar_height+8)
        //         .attr("width", bar_width)
        //         .attr("height", bar_height)
        //         .attr("fill", d=>this.entropy_color_scales[Object.keys(entropy)[k]](d))
        //         .attr("stroke", "grey");
        // }
    }

    draw_entropy_diff(g, entropy_diff){
        let entropy_g = d3.select("#graph"+g+"_entropy");
        let n =  entropy_diff.length;
        let bar_width = this.graph_width/20;
        let bar_height = Math.min(this.graph_height/(2*n), 20);
        let eg = entropy_g.append("g").attr("transform", `translate(${this.graph_width-5*bar_width}, ${this.graph_height/4})`);

        eg.append("text")
            .attr("x", bar_width+5)
            .text(()=>{
                if(this.measure_id === "ph0"){
                    return "LHD";
                } else {
                    return "LED";
                }
            });
        let eg_g = eg.selectAll("g").data(entropy_diff)
            .enter().append("g")
            .attr("transform", (d,i)=>`translate(${bar_width}, ${i*bar_height+8})`)
        // eg.selectAll("rect").data(entropy_diff)
            // .enter().append("rect")
        eg_g.append("rect")
            .attr("class", "viewer-graph__rect")
            .attr("id", (d,i)=>"rect2_"+g+"_"+i)
            // .attr("x", bar_width)
            // .attr("y", (d,i)=>i*bar_height+8)
            .attr("width", bar_width)
            .attr("height", bar_height)
            .attr("fill", d=>{
                if(this.measure_id==="ph0"){
                    return this.ph0_diff_scale_dict[parseInt(d)];
                } else{
                    return this.measures_diff_color_scales[this.measure_id](d);
                }
            })
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        eg_g.append("text")
            .classed("entropy_value_text", true)
            .attr("x", bar_width*4/3)
            .attr("y", bar_height*2/3)
            .text(d=>d)
            .style("visibility", "hidden");

        eg.append("text")
            // .attr("class", "tooltip")
            .attr("id", "tooltip_diff"+g)
            // .style("visibility", "hidden");
        
        function mouseover(d){
            let coords = d3.mouse(this);
            d3.select("#tooltip_diff"+g)
                .attr("transform", `translate(${coords[0]+10}, ${coords[1]})`)
                .text(d)
                .style("visibility", "visible");
        }
        function mouseout(){
            d3.select("#tooltip_diff"+g).style("visibility", "hidden");
        }
    }

    draw_scatter_plot(){
        let group_id = [];
        for(let i=0; i<this.selected_cols.length; i++){
            for(let j=0; j<this.selected_cols.length; j++){
                let v1 = this.selected_cols[i];
                let v2 = this.selected_cols[j];
                let v1_idx = this.col_index[v1];
                let v2_idx = this.col_index[v2];
                group_id.push(`${v1_idx}${v2_idx}`);
            }
        }

        group_id.forEach(g=>{
            let col1 = this.col_index_reverse[parseInt(g.slice(0,1))];
            let col2 = this.col_index_reverse[parseInt(g.slice(1))];

            let graph_g = d3.select("#graph"+g).append("g");
            let margin = 40;
            if(col1 === col2){
                // text col_name
                graph_g.append("text")
                    .attr("transform", `translate(${this.graph_width/2-margin-5*col1.length}, ${this.graph_height/2})`)
                    .style("font-size", "30px")
                    .text(col1);
            } else {
                // draw scatter plot
                console.log(col1, col2)
                let x_val = Object.values(this.raw_data[col1]);
                let y_val = Object.values(this.raw_data[col2]);
                let pt_val = [];
                let x_scale = d3.scaleLinear()
                    .domain([Math.min(...x_val), Math.max(...x_val)])
                    .range([2*margin, this.graph_width-3*margin])
                let y_scale = d3.scaleLinear()
                    .domain([Math.min(...y_val), Math.max(...y_val)])
                    .range([this.graph_height-margin, margin])
                for(let i=0; i<x_val.length; i++){
                    pt_val.push({"x":x_val[i], "y":y_val[i]});
                }
                let ng = graph_g.selectAll("circle").data(pt_val)
                    .enter().append("circle")
                    .attr("cx", d=>x_scale(d.x))
                    .attr("cy", d=>y_scale(d.y))
                    .attr("r", 1)
                    .attr("fill", "none") 
                    .attr("stroke", "black")
                    .style("opacity", 0.8);
                let x_axis = d3.axisBottom(x_scale).ticks(Math.floor(10/this.selected_cols.length));
                let y_axis = d3.axisLeft(y_scale).ticks(Math.floor(10/this.selected_cols.length)); 
                graph_g.append("g").attr("transform",  `translate(0, ${this.graph_height-margin})`).call(x_axis);
                // graph_g.append("text").attr("transform",  `translate(${this.graph_width/2-margin+col1.length}, ${this.graph_height-5})`).text(col1);
                graph_g.append("g").attr("transform",  `translate(${2*margin}, 0)`).call(y_axis);
                // graph_g.append("text").attr("transform",  `translate(${margin/2+10}, ${this.graph_height/2+2*col2.length}) rotate(270)`).text(col2);
            }
        })
    }

    draw_mapper(mapper){
        let mapper_graph = mapper.mapper;
        let nodes = mapper_graph.nodes;
        let links = mapper_graph.links;        

        let group_id = [];
        if(mapper.vars.length === 1){
            let v = mapper.vars[0];
            let v_idx = this.col_index[v];
            group_id.push(`${v_idx}${v_idx}`);
        } else { // mapper.vars.length === 2
            let v1 = mapper.vars[0];
            let v2 = mapper.vars[1];
            let v1_idx = this.col_index[v1];
            let v2_idx = this.col_index[v2];
            group_id.push(`${v1_idx}${v2_idx}`);
            group_id.push(`${v2_idx}${v1_idx}`);
        }

        group_id.forEach(g=>{
            let col1 = this.col_index_reverse[parseInt(g.slice(0,1))];
            let col2 = this.col_index_reverse[parseInt(g.slice(1))];
            // 1. draw graph
            // d3.select("#graph"+g).call(d3.zoom().on("zoom", zoom_actions));
            let graph_g = d3.select("#graph"+g).append("g");
            let simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(function(d) { return d.id; }))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(this.graph_width/3, this.graph_height/2))
            .force("x", d3.forceX().strength(0.2))
            .force("y", d3.forceY().strength(0.2));

            let lg = graph_g.selectAll("line").data(links)
                .enter().append("line")
                .classed("viewer-graph__edge",true)
                .attr("id",d=>"link"+d.source.id+"_"+d.target.id)
			    // .attr('stroke-width', (d) => d.jaccardIndex * 20);
            
            let ng = graph_g.selectAll("g").data(nodes)
                .enter().append("g")
                .attr("class", "viewer-graph__vertex-group")
                .attr("id",(d)=>"node_"+g+"_"+d.id)
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("mouseover", (d)=>{
                    d3.select("#graph"+g+"_entropy").selectAll(".viewer-graph__rect").classed("faded", true);
                    d[this.subgraph_version+col1].forEach(s=>{
                        d3.select("#rect_"+g+"_"+s).classed("faded", false);
                        d3.select("#rect2_"+g+"_"+s).classed("faded", false);
                    })
                })
                .on("mouseout", ()=>{
                    d3.select("#graph"+g+"_entropy").selectAll(".viewer-graph__rect").classed("faded", false);
                });
            ng.append("circle")
                .classed("viewer-graph__vertex",true)
                .attr("r", 12);

            // Pie Chart
            let pie = d3.pie()
                .value(d => d.value)
                .sort(null);
            
            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(12);   
            
            let pg = ng.append("g")
                .attr("class", "pie-group");
            
            pg.selectAll("path").data(d=>pie(prepare_pie_data(d[this.subgraph_version+col1])))
                .enter().append("path")
                .attr("d", d=>arc(d))
                .attr("fill", d=>{
                    if(this.map_type === "map-continuous"){
                        return this.measures_color_scales[this.measure_id](mapper[this.subgraph_version]['measures'][col1][this.measure_id][d.data.idx]);
                    } else{
                        return mapper[this.subgraph_version]['color_dict'][col1][d.data.idx];
                    }
                    
                })
                .attr("stroke", "whitesmoke")
                .attr("stroke-width", "1px");
                // .style("opacity", 0.6);
            

            let lbg = graph_g.selectAll("text").data(nodes)
                .enter().append("text")
                .classed("viewer-graph__label", true)
                .attr("id",(d)=>"node-label"+d.id)
                .text((d)=>d.id);

            simulation
                .nodes(nodes)
                    .on("tick", ticked);
    
            simulation.force("link")
                .links(links);

            //add zoom capabilities
            const zoom_handler = d3.zoom()
                .on("zoom", zoom_actions);

            // drag_handler(ng);
            zoom_handler(d3.select("#graph_svg"+g));
            
            function ticked() {
                lg
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                
                let radius = 8;
                ng
                    .attr("transform", function (d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });

                lbg
                    .attr("x",d=>d.x-3)
                    .attr("y",d=>d.y+4);
            }
            function zoom_actions() {
                graph_g.attr("transform", d3.event.transform);
            }

            function dragstarted(d) {
                if (!d3.event.active) {simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;}
            }
        
            function dragged(d) {
                d.fx = d3.event.x;
                d.fy = d3.event.y;
            }
        
            function dragended(d) {
                if (!d3.event.active) {simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;}
            }

            function prepare_pie_data (subgraphs) {
                let pie_data = [];
                subgraphs.forEach(idx=>{
                    let p = {};
                    p.value = 10;
                    p.idx = idx;
                    pie_data.push(p);
                })
                return pie_data
            }

            // 2. draw entropy
            let entropy = mapper[this.subgraph_version].measures[col1][this.measure_id];
            // this.text_entropy(graph_g, entropy);
            this.draw_entropy(g, entropy, mapper, col1);    
            if(col1 != col2){
                let entropy_diff = mapper[this.subgraph_version].measures_diff[col1][this.measure_id]
                this.draw_entropy_diff(g, entropy_diff);
            }
        })

        
        
       
        
        // let ng = this.node_group.selectAll("g").data(this.nodes);
        // ng.exit().remove();
        // ng = ng.enter().append("g").merge(ng)
        //     .attr("class", "viewer-graph__vertex-group");
        // ng.append("circle")
        //     .classed("viewer-graph__vertex",true)
        //     .attr("id",(d)=>"node"+d.id)
        //     .attr("r", 12)
        //     .call(d3.drag()
        //         .on("start", dragstarted)
        //         .on("drag", dragged)
        //         .on("end", dragended))
            // .on("mouseover", (d)=>{
            //     if(this.if_select_node) {
            //         if(this.selected_nodes.indexOf(d.id) === -1){
            //             d3.select("#node"+d.id).classed("selectable", true).style("fill", "white");
            //             d3.select("#node-label"+d.id).style("fill", "#555");
            //         }
            //     } else if(this.if_select_cluster) {
            //         if(this.selected_nodes.indexOf(d.id) === -1) {
            //             let cluster = this.connected_components[d.clusterId];
            //             cluster.forEach(nId=>{
            //                 d3.select("#node"+(nId+1).toString()).classed("selectable", true).style("fill", "white");
            //                 d3.select("#node-label"+(nId+1).toString()).style("fill", "#555");
            //             })
            //         }
            //     }
                // else if(this.if_select_path){
                //     if(this.selected_nodes.length === 0){
                //         d3.select("#node"+d.id).classed("selectable", true);
                //         d3.select("#node-label"+d.id).style("fill", "#555");
                //     }
                //     else { // this.selected_nodes.length > 0
                //         let path = this.dijkstra(this.path_start_id);
                //         this.highlight_path(path, this.path_start_id, d.id);
                //     }
                // }

			// 	var f = d3.format(".2f");
			// 	tooltipDiv.transition()
			// 		.duration(200)
			// 		.style("opacity", .9);
			// 	tooltipDiv.html('E: ' + f(d.le1) + ', C:' + f(d.corr))
			// 		.style("left", (d3.event.pageX) + "px")
			// 		.style("top", (d3.event.pageY - 28) + "px");
            // })
            // .on("mouseout", ()=>{
            //     if(this.if_select_node || this.if_select_cluster || this.if_select_path){
            //         this.unhighlight_selectable();
            //         this.fill_vertex(this.color_col);
            //     }             
			// 	tooltipDiv.transition()
			// 		.duration(500)
			// 		.style("opacity", 0);
            // })
            // .on("click",(d)=>{
			// 	console.log( 'cllii') 
			// 	console.log( this) 
            //     this.clicking = true;
			// 	console.log( this.if_select_node) 
            //     if(this.if_select_node){
			// 		console.log( 'select node mode') 
            //         this.unhighlight_selectable();
            //         if(this.selected_nodes.indexOf(d.id)===-1){ // Selecting nodes
            //             this.selected_nodes.push(d.id);
            //             d3.select("#node"+d.id).classed("selected",true).style("fill", "white");
            //             d3.select("#node-label"+d.id).style("fill","#555");
            //         } else{ // Unselecting
            //             this.selected_nodes.splice(this.selected_nodes.indexOf(d.id),1);
            //             d3.select("#node"+d.id).classed("selected",false);
            //             this.fill_vertex(this.color_col);
            //         }
            //         this.draw_hist();
            //     } else if(this.if_select_cluster){
                    // this.unhighlight_selectable();
                    // let cluster = this.connected_components[d.clusterId];
                    // this.selected_nodes = [];
                    // cluster.forEach(nodeId=>{
                    //     this.selected_nodes.push((nodeId+1).toString());
                    // })
                    // this.nodes.forEach(node=>{
                    //     if(node.clusterId === d.clusterId){
                    //         d3.select("#node"+node.id).classed("selected", true).style("fill", "white");
                    //         d3.select("#node-label"+node.id).style("fill","#555");
                    //     } else{
                    //         d3.select("#node"+node.id).classed("selected", false);
                    //         this.fill_vertex(this.color_col);
                    //     }
                    // })
                    // this.draw_hist();
                // } else if(this.if_select_path){
                //     this.unhighlight_selectable();
                //     if(this.selected_nodes.length===0){
                //         this.selected_nodes.push(d.id);
                //         d3.select("#node"+d.id).classed("selected",true).style("fill", "white");
                //         d3.select("#node-label"+d.id).style("fill","#555");
                //         this.selectable_nodes = this.connected_components[d.clusterId].map(nIdx=>(nIdx+1).toString());
                //         this.selectable_nodes.splice(this.selectable_nodes.indexOf(d.id),1);
                //         this.path_start_id = d.id;
                //     } else if(this.selectable_nodes.indexOf(d.id)!=-1){
                //         let startId = this.path_start_id;
                //         let path = this.dijkstra(startId);
                //         let currentId = d.id;
                //         let kk = 0;
                //         while (currentId!=startId && kk < 500){
                //             this.selected_nodes.push(currentId);
                //             this.selectable_nodes.splice(this.selectable_nodes.indexOf(currentId), 1);
                //             let nextId = path[currentId];
                //             d3.select("#link"+currentId+"_"+nextId).classed("selected", true);
                //             d3.select("#link"+nextId+"_"+currentId).classed("selected", true);
                //             d3.select("#node"+currentId).classed("selected",true).style("fill", "white");
                //             d3.select("#node-label"+currentId).style("fill","#555");
                //             currentId = nextId;
                //             kk += 1;
                //         }
                //         this.path_start_id = d.id;
                    // }
                    // this.nodes.forEach(node=>{
                    //     if(this.selectable_nodes.indexOf(node.id)===-1 && this.selected_nodes.indexOf(node.id)===-1){
                    //         d3.select("#node"+node.id).classed("unselectable", true);
                    //     } else{
                    //         d3.select("#node"+node.id).classed("unselectable", false);
                    //     }
                    // })
                    // this.draw_hist();
            //     }
            //     console.log(this.selected_nodes)
            //     this.text_cluster_details(this.selected_nodes, this.label_column, this.labels);
            // });

        // let lg = this.link_group.selectAll("line").data(this.links);
        // lg.exit().remove();
        // lg = lg.enter().append("line").merge(lg);
        // lg
        //     .classed("viewer-graph__edge",true)
        //     .attr("id",d=>"link"+d.source.id+"_"+d.target.id)
		// 	.attr('stroke-width', (d) => d.jaccardIndex * 20)

        // let lbg = this.label_group.selectAll("text").data(this.nodes);
        // lbg.exit().remove();
        // lbg = lbg.enter().append("text").merge(lbg);
        // lbg
        //     .classed("viewer-graph__label", true)
        //     .attr("id",(d)=>"node-label"+d.id)
        //     .text((d)=>d.id);

        // simulation
        //     .nodes(this.nodes)
        //         .on("tick", ticked);

        // simulation.force("link")
        //     .links(this.links);

        
    
        


        // drag_handler(ng);
        // zoom_handler(d3.select(this.graphSvg.node().parentNode).select('rect'));
        // console.log(d3.select(this.graphSvg.node().parentNode).select('rect'));

    }

    // color_functions(){
    //     let selections = ['- None -', 'Number of points', 'Local entropy 1', 'Local entropy 2', 'Correlation'].concat(this.col_keys);
    //     selections = selections.concat(this.categorical_cols);
    //     let vg = d3.select("#color_function_values").selectAll("option").data(selections);
    //     vg.exit().remove();
    //     vg = vg.enter().append("option").merge(vg)
    //         .html(d=>d);

    //     let mg = d3.select("#color_function_maps").selectAll("option").data(Object.keys(this.COLORMAPS));
    //     mg.exit().remove();
    //     mg = mg.enter().append("option").merge(mg)
    //         .html(d=>d);

    //     let scale_options = ["Default range", "Data range", "Custom range"];
    //     let sg = d3.select("#color_function_scale").selectAll("option").data(scale_options);
    //     sg.exit().remove();
    //     sg = sg.enter().append("option").merge(sg)
    //         .html(d=>d);

    //     let that=this;
    //     let value_dropdown = document.getElementById("color_function_values");
    //     let value = value_dropdown.options[value_dropdown.selectedIndex].text;
    //     let map_dropdown = document.getElementById("color_function_maps");
    //     let map = map_dropdown.options[map_dropdown.selectedIndex].text;
    //     let scale_dropdown = document.getElementById("color_function_scale");
    //     let scale = scale_dropdown.options[scale_dropdown.selectedIndex].text;
        
    //     value_dropdown.onchange = function(){
    //         value = value_dropdown.options[value_dropdown.selectedIndex].text;
    //         that.color_col = value;
    //         if(that.col_keys.indexOf(value)!=-1 || value==="Number of points" || value==='Local entropy 1' || value==='Local entropy 2' || value==='Correlation'){
    //             $('#color-legend-svg').remove();
    //             if(scale === "Default range"){
    //                 that.colorScale.domain([0,1]);
    //             } else if(scale === "Data range"){
    //                 that.colorScale.domain(that.find_col_domain(value));
    //             }
    //             if(map!='- None -'){
    //                 that.draw_color_legend(that.colorScale);
    //                 that.fill_vertex(value);
    //             }
    //             $("#color_function_maps").prop("disabled", false);
    //             $("#color_function_scale").prop("disabled", false);
    //         } else if(that.categorical_cols.indexOf(value)!=-1){
    //             console.log(value)
    //             let color_dict = that.fill_vertex_categorical(value);
    //             that.draw_color_legend_categorical(color_dict);
    //             $("#color_function_maps").prop("disabled", true);
    //             $("#color_function_scale").prop("disabled", true);
    //         } else if(value === "- None -"){
    //             that.colorScale.domain([undefined, undefined]); 
    //             that.fill_vertex(value);
    //             $("#color_function_maps").prop("disabled", false);
    //             $("#color_function_scale").prop("disabled", false);
    //         }
            
    //     }
        
    //     map_dropdown.onchange = function(){
    //         map = map_dropdown.options[map_dropdown.selectedIndex].text;
    //         if(that.COLORMAPS[map]){
    //             that.colorScale.range(that.COLORMAPS[map]);
    //             that.draw_color_legend(that.colorScale);
    //         } else { 
    //             that.colorScale.range([undefined, undefined]); 
    //             $('#color-legend-svg').remove();
    //         }
    //         that.fill_vertex(value);
    //     }

    //     scale_dropdown.onchange = function(){
    //         scale = scale_dropdown.options[scale_dropdown.selectedIndex].text;
    //         let scale_range_container = document.getElementById("scale-range-container-inner");
    //         if(scale === "Custom range"){
    //             scale_range_container.style.maxHeight = scale_range_container.scrollHeight + "px";
    //         } else {
    //             scale_range_container.style.maxHeight = null;
    //         }
    //         if(scale === "Default range"){
    //             that.colorScale.domain([0,1]);
    //         } else if (scale === "Data range"){
    //             that.colorScale.domain(that.find_col_domain(value));
    //         }
    //         if(map!='- None -'){
    //             that.draw_color_legend(that.colorScale);
    //             that.fill_vertex(value);
    //         }
    //     }

    //     d3.select("#apply_scale")
    //         .on("click", ()=>{
    //             let scale_left = parseFloat(d3.select("#scale-interval-left").node().value);
    //             let scale_right = parseFloat(d3.select("#scale-interval-right").node().value);
    //             if(scale_left > scale_right){
    //                 alert("Invalid range!")
    //             } else{
    //                 that.colorScale.domain([scale_left, scale_right]);
    //                 if(map!='- None -'){
    //                     that.draw_color_legend(that.colorScale);
    //                     that.fill_vertex(value);
    //                 }
    //             }
    //         })
    // }

    // draw_color_legend(color_scale){
    //     console.log(color_scale.domain())
    //     // reset svg 
    //     $('#color-legend-svg').remove();
    //     $('#block_body-inner_color').append('<svg width="0" height="0" id="color-legend-svg"></svg>');
    //     // draw legend
    //     let width = $(d3.select("#workspace-color_functions").node()).width();
    //     let height = 60;
    //     let axisMargin = 20;
    //     let colorTileNumber = 50;
    //     let colorTileHeight = 20;
    //     let colorTileWidth = (width - (axisMargin * 2)) / colorTileNumber;
    //     let axisDomain = color_scale.domain();
    //     let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height);

    //     // axis
    //     let tickValues = [axisDomain[0], d3.mean(axisDomain), axisDomain[1]];
    //     let axisScale = d3.scaleLinear().domain(axisDomain).range([axisMargin, width - axisMargin*3]);
    //     let axis = d3.axisBottom(axisScale).tickValues(tickValues);

    //     svg.append("g").attr("transform", "translate(0,40)").call(axis);

    //     let legendGroup = svg.append("g")

    //     let domainStep = (axisDomain[1] - axisDomain[0])/colorTileNumber;
    //     let rects = d3.range(axisDomain[0], axisDomain[1], domainStep)
    //     let rg = legendGroup.selectAll("rect").data(rects);
    //     rg.exit().remove();
    //     rg = rg.enter().append("rect").merge(rg);
    //     rg
    //         .attr('x', d=>axisScale(d))
    //         .attr('y', 10)
    //         .attr('width', colorTileWidth-1)
    //         .attr('height',colorTileHeight)
    //         .attr('fill', d=>color_scale(d));
    // }

    draw_color_legend_categorical(color_dict, color_dict2){
        // reset svg 
        $('#color-legend-svg').remove();
        $('#block_body-inner_color').append('<svg width="0" height="0" id="color-legend-svg"></svg>');
        // draw legend
        let color_array = d3.entries(color_dict);
        let width = $(d3.select("#workspace-color_functions").node()).width();
        let margin = 10;
        let rect_height = 15;
        let rect_width = 30;
        let rect_margin = 8;
        let textWidth = 30;
        let height = color_array.length*(rect_height+rect_margin)+margin*2;
        let svg = d3.select("#color-legend-svg").attr('width', width).attr('height', height*2);

        console.log(color_array)

        svg.append("text").attr("transform", `translate(0,${2*margin})`).text("LH");

        let lg = svg.selectAll("g").data(color_array);
        lg.exit().remove();
        lg = lg.enter().append("g").merge(lg)
            .attr("transform", "translate("+(margin+textWidth)+","+margin+")")
        lg.append("rect")
            .attr("x",0)
            .attr("y",(d,i)=>i*(rect_height+rect_margin))
            .attr("height", rect_height)
            .attr("width",rect_width)
            .attr("fill", d=>d.value)
            .style("opacity", 0.8);

        lg.append("text")
            .attr("x", rect_width+margin*3)
            .attr("y", (d,i)=>i*(rect_height+rect_margin)+8)
            .text(d=>d.key);

        svg.append("text").attr("transform", `translate(0,${height+2*margin})`).text("LHD");
        let color_array2 = d3.entries(color_dict2);
        let lg2 = svg.append("g").selectAll("g").data(color_array2);
        lg2.exit().remove();
        lg2 = lg2.enter().append("g").merge(lg2)
            .attr("transform", "translate("+(margin+textWidth)+","+(margin+height)+")")
        lg2.append("rect")
            .attr("x",0)
            .attr("y",(d,i)=>i*(rect_height+rect_margin))
            .attr("height", rect_height)
            .attr("width",rect_width)
            .attr("fill", d=>d.value)
            .style("opacity", 0.8);

        lg2.append("text")
            .attr("x", rect_width+margin*3)
            .attr("y", (d,i)=>i*(rect_height+rect_margin)+8)
            .text(d=>d.key);
    }

    size_functions(){
        let selections = ['- None -', 'Number of points', 'Local entropy 1',
		'Local entropy 2', 'Correlation'].concat(this.col_keys);
        let sg = d3.select("#size_function_values").selectAll("option").data(selections);
        sg.exit().remove();
        sg = sg.enter().append("option").merge(sg)
            .html(d=>d);

        this.size_scales = {};
        for(let i=0; i<this.col_keys.length; i++){
            let c = this.col_keys[i];
            let v = this.nodes.map(d=>d.avgs[c]);
            this.size_scales[c] = d3.scaleLinear()
                .domain([Math.min(...v), Math.max(...v)])
                .range([6,18])
        }
        let v = this.nodes.map(d=>d.size);
        this.size_scales['Number of points'] = d3.scaleLinear()
            .domain([Math.min(...v), Math.max(...v)])
            .range([6,18])
        this.size_scales['Correlation'] = d3.scaleLinear()
            .domain([0,1])
            .range([6,18])

        // let le1 = this.nodes.map(d=>d.le1);
        // entropy_scales[this.nodes[0].graphID]['Local entropy 1'] = d3.scaleLinear()
        //     .domain([Math.min(...le1), Math.max(...le1)])
        //     .range([6,18])

        // let le2 = this.nodes.map(d=>d.le2);
        // entropy_scales[this.nodes[0].graphID]['Local entropy 2'] = d3.scaleLinear()
        //     .domain([Math.min(...le2), Math.max(...le2)])
        //     .range([6,18])

        let size_dropdown = document.getElementById("size_function_values");
        let size = size_dropdown.options[size_dropdown.selectedIndex].text;
        let that = this;
        size_dropdown.onchange = function(){
            size = size_dropdown.options[size_dropdown.selectedIndex].text;
            if(size === "Number of points"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>that.size_scales[size](d.size));
			} else if(size === "Correlation"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>that.size_scales[size](d.corr));
			} else if(size === "Local entropy 1"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>entropy_scales[d.graphID][size](d.le1));
			} else if(size === "Local entropy 2"){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>entropy_scales[d.graphID][size](d.le2));
            } else if(that.size_scales[size]){
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", d=>that.size_scales[size](d.avgs[size]));
            } else {
                d3.selectAll(".viewer-graph__vertex")
                    .attr("r", 12);
            }
            let arc = d3.arc().innerRadius(0);
            d3.selectAll(".pie-group-piece")
                .attr("d", d=>{
                    let r = d3.select("#node"+d.data.node_id).attr("r")
                    arc.outerRadius(r);
                    return arc(d);
                })
        }
    }

    assign_cc2node(){
        for(let cluster_key in this.connected_components){
            let cluster = this.connected_components[cluster_key];
            for(let i=0; i<cluster.length; i++){
                let nodeId = cluster[i];
                this.nodes[nodeId].clusterId = cluster_key;
            }
        }
    }

    find_neighbor_nodes(){
        this.nodes.forEach(node=>{
            node.neighbor_nodes = [];
        })
        this.links.forEach(link=>{
            this.nodes[link.source-1].neighbor_nodes.push(link.target.toString());
            this.nodes[link.target-1].neighbor_nodes.push(link.source.toString());
        })
    }

    get_scale(){
        // let hist_scale = {};
        // let col_ranges = {};
        // for(let i=0; i<this.col_keys.length; i++){
        //     col_ranges[this.col_keys[i]] = {"max":-Infinity, "min":Infinity};
        // }
        // this.nodes.forEach(n=>{
        //     for(let col_key in n.avgs){
        //         if(n.avgs[col_key]<col_ranges[col_key].min){
        //             col_ranges[col_key].min = n.avgs[col_key];
        //         }
        //         if(n.avgs[col_key]>col_ranges[col_key].max){
        //             col_ranges[col_key].max = n.avgs[col_key];
        //         }
        //     }
        // })
        // for(let i=0; i<this.col_keys.length; i++){
        //     let col_key = this.col_keys[i]
        //     hist_scale[col_key] = d3.scaleLinear()
        //         .domain([col_ranges[col_key].min, col_ranges[col_key].max])
        //         .range([this.hist_margin.left*6, this.hist_width-this.hist_margin.left*10]);
        // }
        // return hist_scale;
        let max_val = -Infinity;
        let min_val = Infinity;
        this.nodes.forEach(n=>{
            for(let col_key in n.avgs){
                if(n.avgs[col_key]<min_val){
                    min_val = n.avgs[col_key];
                }
                if(n.avgs[col_key]>max_val){
                    max_val = n.avgs[col_key];
                }
            }
        })
        min_val = Math.min(0, min_val);
        let hist_scale = d3.scaleLinear()
            .domain([min_val, max_val])
            .range([0, this.hist_width-this.hist_margin.left*10]);
        return hist_scale
    }

    clear_mapper(){
        d3.select('#graphSVG-container').selectAll(".row").remove();
        // $('#graphSVG-container').append('<svg id="graphSVG"></svg>');
        // $('#size_function_values').remove();
        // $('#size-function-container').append('<select class="custom-select"  name="size_function_values" id="size_function_values"></select>');
        // $('#color_function_values').remove();
        // $('#color_function_maps').remove();
        // $('#color-function-values-container').append('<select class="custom-select"  name="color_function_values" id="color_function_values"></select>');
        // $('#color-function-maps-container').append('<select class="custom-select"  name="color_function_maps" id="color_function_maps"></select>');
        // $('#color-legend-svg').remove();
    }

    // selection_nodes(){
    //     d3.select("#unselect-view")
    //         .on("click",()=>{
    //             this.select_view();
    //         })
    //     d3.select("#select-node")
    //         .on("click",()=>{
    //             this.select_node();
    //         })
    //     d3.select("#select-cluster")
    //         .on("click", ()=>{
    //             this.select_cluster();
    //         })
    //     d3.select("#select-path")
    //         .on("click", ()=>{
    //             this.select_path();
    //         })
    // }

    // select_node(){
	// 	console.log( this) 
    //     if(!this.if_select_node){
    //         d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //         d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //         d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     }
    //     this.selected_nodes = [];
    //     this.if_select_node = true;
	// 	console.log( this.if_select_node) 
    //     d3.select("#select-node").classed("selected", true);
    //     d3.select("#unselect-view").classed("selected", false);
    //     this.if_select_cluster = false;
    //     d3.select("#select-cluster").classed("selected", false);
    //     this.if_select_path = false;
    //     d3.select("#select-path").classed("selected", false);
    //     d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //     d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //     d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     if(this.col_keys.indexOf(this.color_col)!=-1 || this.color_col==="Number of points"){
    //         this.fill_vertex(this.color_col);
    //     } else if(this.categorical_cols.indexOf(this.color_col)!=-1){
    //         let color_dict = this.fill_vertex_categorical(this.color_col);
    //     }
    // }

    // select_cluster(){
    //     if(!this.if_select_cluster){
    //         d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //         d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //         d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     }
    //     this.selected_nodes = [];
    //     this.if_select_cluster = true;
    //     d3.select("#select-cluster").classed("selected", true);
    //     d3.select("#unselect-view").classed("selected", false);
    //     this.if_select_node = false;
    //     d3.select("#select-node").classed("selected", false);
    //     this.if_select_path = false;
    //     d3.select("#select-path").classed("selected", false);
    //     d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //     d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //     d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     if(this.col_keys.indexOf(this.color_col)!=-1 || this.color_col==="Number of points"){
    //         this.fill_vertex(this.color_col);
    //     } else if(this.categorical_cols.indexOf(this.color_col)!=-1){
    //         let color_dict = this.fill_vertex_categorical(this.color_col);
    //     }
    // }

    // select_path(){
    //     if(!this.if_select_path){
    //         d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //         d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //         d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     }
    //     this.selected_nodes = [];
    //     this.selectable_nodes = [];
    //     this.nodes.forEach(node=>{
    //         this.selectable_nodes.push(node.id);
    //     })
    //     this.if_select_path = true;
    //     d3.select("#select-path").classed("selected", true);
    //     d3.select("#unselect-view").classed("selected", false);
    //     this.if_select_node = false;
    //     d3.select("#select-node").classed("selected", false);
    //     this.if_select_cluster = false;
    //     d3.select("#select-cluster").classed("selected", false);
    //     if(this.col_keys.indexOf(this.color_col)!=-1 || this.color_col==="Number of points"){
    //         this.fill_vertex(this.color_col);
    //     } else if(this.categorical_cols.indexOf(this.color_col)!=-1){
    //         let color_dict = this.fill_vertex_categorical(this.color_col);
    //     }
    // }

    // select_view(){
    //     this.selected_nodes = [];
    //     d3.select("#unselect-view").classed("selected", true);
    //     this.if_select_node = false;
    //     d3.select("#select-node").classed("selected", false);
    //     this.if_select_cluster = false;
    //     d3.select("#select-cluster").classed("selected", false);
    //     this.if_select_path = false;
    //     d3.select("#select-path").classed("selected", false);
    //     d3.selectAll(".viewer-graph__vertex").classed("selected", false);
    //     this.remove_hist();
    //     d3.selectAll(".viewer-graph__vertex").classed("selected",false);
    //     d3.selectAll(".viewer-graph__vertex").classed("unselectable",false);
    //     d3.selectAll(".viewer-graph__edge").classed("selected", false);
    //     if(this.col_keys.indexOf(this.color_col)!=-1 || this.color_col==="Number of points"){
    //         this.fill_vertex(this.color_col);
    //     } else if(this.categorical_cols.indexOf(this.color_col)!=-1){
    //         let color_dict = this.fill_vertex_categorical(this.color_col);
    //     }
    //     this.text_cluster_details([], this.label_column, this.labels);

    // }

    draw_hist(){
        this.remove_hist();
        let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        for(let i=0; i<this.selected_nodes.length; i++){
            let node_index = parseInt(this.selected_nodes[i])-1;
            let node = this.nodes[node_index];
            d3.select("#workspace-histogram").select(".block_body-inner").append("div").attr("id","div"+i)
            d3.select("#workspace-histogram").select(".block_body-inner").select("#div"+i).append("h6").classed("text-center", true).html("Node #"+node.id);
            let hist_svg = d3.select("#workspace-histogram").select(".block_body-inner").select("#div"+i).append("svg")
                .attr("width", this.hist_width)
                .attr("height", this.hist_height);
            let avgs = d3.entries(node.avgs);
            for(let j=0; j<avgs.length; j++){
                hist_svg.append("text")
                    .classed("hist_value", true)
                    .attr("x", this.hist_margin.left)
                    .attr("y", j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top)
                    .text(Math.round(avgs[j].value*100)/100);

                hist_svg.append("rect")
                    .classed("hist_bar", true)
                    .attr("x",this.hist_margin.left*6)
                    .attr("y",j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top)
                    .attr("height", 5)
                    // .attr("width", this.hist_scale[avgs[j].key](avgs[j].value))
                    .attr("width", this.hist_scale(avgs[j].value))
                    .attr("fill", colorScale(j));
                
                hist_svg.append("text")
                    .classed("hist_label", true)
                    .attr("x", this.hist_margin.left*6+5)
                    .attr("y", j*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top-5)
                    .text(avgs[j].key);
            }

            hist_svg.append("line")
                .classed("hist_bar_boundary", true)
                .attr("x1", this.hist_margin.left*6)
                .attr("y1",0)
                .attr("x2", this.hist_margin.left*6)
                .attr("y2",(avgs.length-1)*(this.hist_margin.between+this.hist_margin.bar_height)+this.hist_margin.top);
        }
    }

    remove_hist(){
        d3.select("#workspace-histogram").selectAll("svg").remove();
        d3.select("#workspace-histogram").selectAll("h6").remove();
    }

    dijkstra(startId){

        let path = {};
        let nodeList = [startId].concat(this.selectable_nodes.slice(0));
        let distances = {};
        nodeList.forEach(nId=>{ distances[nId] = Infinity; })
        
        distances[startId] = 0;

        let unvisited = nodeList.slice(0);

        while(unvisited.length > 0) {
            let currentId = undefined;
            let nearestDistance = Infinity;

            unvisited.forEach(nId=>{
                if(distances[nId] < nearestDistance) {
                    currentId = nId;
                    nearestDistance = distances[nId];
                }
            });
            unvisited.splice(unvisited.indexOf(currentId), 1);

            // no unvisited node in current cluster
            if (currentId === undefined){
                break;
            }

            let currentIdx = parseInt(currentId)-1;
            let currentNode = this.nodes[currentIdx];
            currentNode.neighbor_nodes.forEach(nbId=>{
                if(unvisited.indexOf(nbId)!=-1){
                    if(distances[nbId] > distances[currentId]+1){
                        distances[nbId] = distances[currentId] + 1;
                        path[nbId] = currentId;
                    }
                }
            })
        }

        return path;
    }

    highlight_path(path, fromId, toId){
        let currentId = toId;
        let kk = 0;
        while (currentId!=fromId && kk < 500){
            let nextId = path[currentId];
            if(this.selected_nodes.indexOf(currentId)===-1){
                d3.select("#node"+currentId).classed("highlighted_path", true).style("fill", "white");
                d3.select("#node-label"+currentId).style("fill", "#555");
                d3.select("#link"+currentId+"_"+nextId).classed("highlighted_path", true);
                d3.select("#link"+nextId+"_"+currentId).classed("highlighted_path", true);

            }
            currentId = nextId;
            kk += 1;
        }
    }

    unhighlight_selectable(){
        d3.selectAll(".viewer-graph__vertex").classed("highlighted_path", false);
        d3.selectAll(".viewer-graph__vertex").classed("selectable", false);
        d3.selectAll(".viewer-graph__edge").classed("highlighted_path", false);
    }

    text_cluster_details(nodes, label_column, labels){
        console.log(labels)
        let details_text = "";
        let vertices_list = [];
        nodes.forEach(nId => {
            let node_index = parseInt(nId)-1;
            let node = this.nodes[node_index];
            node.vertices.forEach(v=>{
                if(vertices_list.indexOf(v)===-1){
                    vertices_list.push(parseInt(v));
                }
            })
        })
        vertices_list.sort((a,b)=>d3.ascending(a,b));
        if(label_column === "row index"){
            vertices_list.forEach(v=>{
                details_text += v + " ";
            })
        } else{
            if(labels){
                vertices_list.forEach(v=>{
                    details_text += labels[v] + " ";
                })
            }
        }
        d3.select("#nodes-details-labels").html(details_text);

    }

    find_col_domain(col_key){
        let min_val = Infinity;
        let max_val = -Infinity;
		console.log( col_key) 
        if(col_key === 'Number of points') {
            this.nodes.forEach(node=>{
                if(node.size<min_val){
                    min_val = node.size;
                }
                if(node.size>max_val){
                    max_val = node.size;
                }
            })
		} else if(col_key === 'Local entropy 1') {
			return entropy_scales[this.nodes[0].graphID]['Local entropy 1'].domain();
		} else if(col_key === 'Local entropy 2') {
			console.log(entropy_scales[this.nodes[0].graphID]['Local entropy 2'].domain())
			return [0,5]//entropy_scales[this.nodes[0].graphID]['Local entropy 2'].domain();
		} else if (col_key == 'Correlation') {
			return [0,1];
        } else {
            this.nodes.forEach(node=>{
                if(node.avgs[col_key]<min_val){
                    min_val = node.avgs[col_key];
                }
                if(node.avgs[col_key]>max_val){
                    max_val = node.avgs[col_key];
                }
            })
        }
        return [min_val,max_val];
    }

    fill_vertex(col_key){
        d3.selectAll(".pie-group").remove();
        d3.selectAll(".viewer-graph__vertex")
            .style("fill", d=>{
                if(d3.select("#node"+d.id).classed("selected")===false){
                    if(col_key === "Number of points"){
                        return this.colorScale(d.size)
					} else if(col_key === "Local entropy 1"){
						let domain = entropy_scales[d.graphID]['Local entropy 1'].domain();
						this.colorScale.domain(domain);
                        return this.colorScale(d.le1)
					} else if(col_key === "Local entropy 2"){
						let domain = entropy_scales[d.graphID]['Local entropy 2'].domain();
						this.colorScale.domain(domain);
                        return this.colorScale(d.le2)
					} else if (col_key == 'Correlation') {
						this.colorScale.domain([0,1]);
                        return this.colorScale(d.corr)
                    } else{
                        return this.colorScale(d.avgs[col_key]);
                    }
                }
                });
        d3.selectAll(".viewer-graph__label")
            .style("fill", d=>{
                let circle_rgb = d3.select("#node"+d.id).style("fill");
                let rgb = circle_rgb.replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',');
                for (let i = 0; i < rgb.length; i++){ rgb[i] = (i === 3 ? 1 : 255) - rgb[i] };
                return 'rgb(' + rgb.join(',') + ')';
            })
    }

    // unfill_vertex(){
    //     d3.selectAll(".pie-group").remove();
    //     d3.selectAll(".viewer-graph__vertex").style("fill", "white");
    //     d3.selectAll(".viewer-graph__label").style("fill", "#555");
    // }

    fill_vertex_categorical(col_key){
        d3.selectAll(".pie-group").remove();
        let color_categorical = d3.scaleOrdinal(d3.schemeCategory10);
        let color_dict = {};
        let idx = 0;

        // let that = this;
        let pie = d3.pie()
                .value(d => d.value)
                .sort(null);

        let pg = d3.selectAll(".viewer-graph__vertex-group").append("g")
            .attr("class", "pie-group");
        
        let arc = d3.arc().innerRadius(0);

        pg.selectAll("path").data(d=>pie(prepare_pie_data(d)))
            .enter().append("path")
            .attr("class", "pie-group-piece")
            .attr("d", d=> {
                let r = d3.select("#node"+d.data.node_id).attr("r")
                arc.outerRadius(r);
                return arc(d);
            })
            .attr("fill", d=>d.data.color)
            .attr("stroke", "#696969")
            .style("opacity", 0.6);

        function prepare_pie_data(node){
            let pie_data = [];
            for(let c in node.categorical_cols_summary[col_key]){
                let p = {};
                p.category_id = c;
                p.value = node.categorical_cols_summary[col_key][c];
                p.node_id = node.id;
                if(Object.keys(color_dict).indexOf(c)!=-1){
                    p.color = color_dict[c];
                } else {
                    p.color = color_categorical(idx);
                    idx += 1;
                    color_dict[c] = p.color;
                }
                pie_data.push(p);
            }
            return pie_data;
        }
        return color_dict;
    }
}
