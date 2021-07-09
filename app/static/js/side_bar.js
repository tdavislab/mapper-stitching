class DataLoader{
    constructor(all_cols, categorical_cols, other_cols){
        this.all_cols = all_cols;
        this.selected_cols = all_cols.slice(0);
        this.selectable_cols = [];
        this.categorical_cols = categorical_cols;
        this.other_cols = other_cols;

        this.config = {};
  
        this.draw_all_cols();
        this.draw_selected_cols();
        // this.draw_label_dropdown();
        this.initialize_config();
        this.edit_param();
    }

    initialize_config(){
        let that = this;

        // 1. Normalization
        this.config.norm_type = d3.select('input[name="norm-type"]:checked').node().value;
        d3.select("#norm-type-form")
            .on("change", ()=>{
                this.config.norm_type = d3.select('input[name="norm-type"]:checked').node().value;
            })

        //3. Parameters
        // interval
        let interval_slider = document.getElementById("interval_input");
        this.config.interval = interval_slider.value;
        interval_slider.oninput = function(){
            that.config.interval = this.value;
            d3.select("#interval_label")
                .html(this.value);
        }

        // overlap
        let overlap_slider = document.getElementById("overlap_input");
        this.config.overlap = overlap_slider.value;
        overlap_slider.oninput = function(){
            that.config.overlap = this.value;
            d3.select("#overlap_label")
                .html(this.value);
        }

        // eps
        let eps_slider = document.getElementById("eps_input");
        this.config.eps = eps_slider.value;
        eps_slider.oninput = function(){
            that.config.eps = this.value;
            d3.select("#eps_label")
                .html(this.value);
        }

        // min samples
        let min_samples_slider = document.getElementById("min_samples_input");
        this.config.min_samples = min_samples_slider.value;
        min_samples_slider.oninput = function(){
            that.config.min_samples = this.value;
            d3.select("#min_samples_label")
                .html(this.value);
        }
        

    }

    draw_all_cols(){
        let ag = d3.select("#all-columns-list").select("ul").selectAll("li").data(this.all_cols);
        ag.exit().remove();
        ag = ag.enter().append("li").merge(ag)
            .html(d=>d)
            .on("click",(d)=>{
                if(this.selected_cols.indexOf(d)===-1){
                    this.selected_cols.push(d);
                    this.selectable_cols.splice(this.selectable_cols.indexOf(d),1);
                    this.draw_selected_cols();
                    // this.initialize_filter();
                }
            });
    }

    draw_selected_cols(){
        let sg = d3.select("#selected-columns-list").select("ul").selectAll("li").data(this.selected_cols);
        sg.exit().remove();
        sg = sg.enter().append("li").merge(sg)
            .html(d=>d)
            .on("click",(d)=>{
                if(this.selected_cols.length>1){
                    this.selected_cols.splice(this.selected_cols.indexOf(d),1);
                    this.selectable_cols.push(d);
                    this.draw_selected_cols();
                    // this.initialize_filter();
                    
                } else {
                    alert("Please select at least 1 column!")
                }
            });
    }

    draw_label_dropdown(){
        if(this.all_cols.length > 0){
            let label_cols = ["row index"].concat(this.categorical_cols.concat(this.all_cols).concat(this.other_cols));
            let cg = d3.select("#label_column_selection").selectAll("option").data(label_cols);
            cg.exit().remove();
            cg = cg.enter().append("option").merge(cg)
                .classed("select-items", true)
                .html(d=>d);
        }
    }

    update_filter(){
        let mapper_dim = d3.select('input[name="mapper-dim"]:checked').node().value;
        let filter_dropdown = document.getElementById("filter_function_selection");
        let filter_dropdown2 = document.getElementById("filter_function_selection2");
        if (mapper_dim === "mapper_1d") {
            this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text];
        } else{
            this.config.filter = [filter_dropdown.options[filter_dropdown.selectedIndex].text, filter_dropdown2.options[filter_dropdown2.selectedIndex].text];
        }
    }

    edit_param(){
        this.edit_clustering_param();
        this.edit_filtering_param();
    }

    edit_filtering_param(){
        let filtering_param_ranges_limit = {"interval":{"left":1, "right":100}, "overlap":{"left":0, "right":100}};
        let filtering_param_ranges = {}
        let filtering_params = ['interval', 'overlap']
        for (let i=0; i<filtering_params.length; i++){
            let p = filtering_params[i];
            filtering_param_ranges[p] = {};
            filtering_param_ranges[p].left = d3.select("#range-"+p+"-left").node().value;
            filtering_param_ranges[p].right = d3.select("#range-"+p+"-right").node().value;
            d3.select("#range-"+p+"-left")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-left").node().value);
                    if(v >= filtering_param_ranges_limit[p].left && v<=filtering_param_ranges[p].right){
                        filtering_param_ranges[p].left = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().min = v;
                    } else {
                        alert("out of range!")
                    }
                })
            d3.select("#range-"+p+"-right")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-right").node().value);
                    if(v <= filtering_param_ranges_limit[p].right && v>=filtering_param_ranges[p].left){
                        filtering_param_ranges[p].right = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().max = v;
                    } else {
                        alert("out of range!")
                    }
                })
        }
    }

    edit_clustering_param(){
        let clustering_param_ranges_limit = {"eps":{"left":0, "right":100}, "min_samples":{"left":1, "right":100}};
        let clustering_param_ranges = {};
        let clustering_params = ['eps', 'min_samples'];
        for(let i=0; i<clustering_params.length; i++){
            let p = clustering_params[i];
            clustering_param_ranges[p] = {};
            clustering_param_ranges[p].left = d3.select("#range-"+p+"-left").node().value;
            clustering_param_ranges[p].right = d3.select("#range-"+p+"-right").node().value;
            d3.select("#range-"+p+"-left")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-left").node().value);
                    if(v >= clustering_param_ranges_limit[p].left && v<=clustering_param_ranges[p].right){
                        clustering_param_ranges[p].left = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().min = v;
                    } else {
                        alert("out of range!");
                    }
                })
            d3.select("#range-"+p+"-right")
                .on("change", ()=>{
                    let v = parseFloat(d3.select("#range-"+p+"-right").node().value);
                    if(v <= clustering_param_ranges_limit[p].right && v>=clustering_param_ranges[p].left){
                        clustering_param_ranges[p].right = v;
                        d3.select("#"+p+"_label").html(d3.select("#"+p+"_input").node().value)
                        d3.select("#"+p+"_input").node().max = v;
                    } else {
                        alert("out of range!");
                    }
                })
        }
    }

}
