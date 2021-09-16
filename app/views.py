from flask import render_template,request, url_for, jsonify, redirect, Response, send_from_directory
from app import app
from app import APP_STATIC
from app import APP_ROOT
import json
import numpy as np
import pandas as pd
import os
import re
# from kmapper import KeplerMapper, Cover
from .kmapper import KeplerMapper, Cover
from sklearn import cluster
import networkx as nx
import sklearn
# from sklearn.linear_model import LinearRegression
# import statsmodels.api as sm
from sklearn.decomposition import PCA
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import KernelDensity
from scipy.spatial import distance
from sklearn.cluster import KMeans


@app.route('/')
@app.route('/MapperInteractive_new')
def index():
    return render_template('index.html')

@app.route('/data_process', methods=['POST','GET'])
def process_text_data():
    '''
    Check for:
    1. Missing value
    2. Non-numerical elements in numerical cols
    3. If cols are non-numerical, check if cols are categorical
    '''
    text_data = request.get_data().decode('utf-8').splitlines()
    cols = text_data[0].split(',')
    mat = [n.split(',') for n in text_data] # csv: if an element is empty, it will be "".
    newdf1 = np.array(mat)[1:]
    rows2delete = np.array([])
    cols2delete = []
    
    ### Delete missing values ###
    for i in range(len(cols)):
        col = newdf1[:,i]
        if np.sum(col == "") >= 0.2*len(newdf1): # if less than 80% elements in this column are numerical, delete the whole column
            cols2delete.append(i)
        else:
            rows2delete = np.concatenate((rows2delete, np.where(col=="")[0]))
    rows2delete = np.unique(rows2delete).astype("int")
    newdf2 = np.delete(np.delete(newdf1, cols2delete, axis=1), rows2delete, axis=0)
    cols = [cols[i] for i in range(len(cols)) if i not in cols2delete]

    ### check if numerical cols ###
    cols_numerical_idx = []
    cols_categorical_idx = []
    cols_others_idx = []
    rows2delete = np.array([], dtype=np.int8)
    r1 = re.compile(r'^-?\d+(?:\.\d+)?$')
    r2 = re.compile(r'[+\-]?[^A-Za-z]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)') # scientific notation
    vmatch = np.vectorize(lambda x:bool(r1.match(x) or r2.match(x)))
    for i in range(len(cols)):
        col = newdf2[:,i]
        col_match = vmatch(col)
        if np.sum(col_match) >= 0.8*len(newdf1): # if more than 90% elements can be converted to float, keep the col, and delete rows that cannot be convert to float:
            cols_numerical_idx.append(i)
            rows2delete = np.concatenate((rows2delete, np.where(col_match==False)[0]))
        else: 
            ### check if categorical cols### 
            if len(np.unique(col)) <= 60: # if less than 10 different values: categorical
                cols_categorical_idx.append(i)
            else:
                cols_others_idx.append(i)
    newdf3 = newdf2[:, cols_numerical_idx+cols_categorical_idx+cols_others_idx]
    newdf3 = np.delete(newdf3, rows2delete, axis=0)
    newdf3_cols = [cols[idx] for idx in cols_numerical_idx+cols_categorical_idx+cols_others_idx]
    newdf3 = pd.DataFrame(newdf3)
    newdf3.columns = newdf3_cols
    # write the data frame
    newdf3.to_csv(APP_STATIC+"/uploads/processed_data.csv", index=False) 
    # write the cols info
    cols_numerical = [cols[idx] for idx in cols_numerical_idx]
    cols_categorical = [cols[idx] for idx in cols_categorical_idx]
    cols_others = [cols[idx] for idx in cols_others_idx]
    cols_dict = {'cols_numerical':cols_numerical, 'cols_categorical':cols_categorical, 'cols_others':cols_others}
    with open(APP_STATIC+"/uploads/cols_info.json", 'w') as f:
        f.write(json.dumps(cols_dict, indent=4))
    return jsonify(columns=cols_numerical, categorical_columns=cols_categorical, other_columns=cols_others)

@app.route('/mapper_loader', methods=['POST','GET'])
def get_graph():
    mapper_data = request.form.get('data')
    mapper_data = json.loads(mapper_data)
    selected_cols = mapper_data['cols']
    all_cols = mapper_data['all_cols'] # all numerical cols
    categorical_cols = mapper_data['categorical_cols']
    data = pd.read_csv(APP_STATIC+"/uploads/processed_data.csv")
    data_categorical = data[categorical_cols]
    data = data[all_cols]

    # data = data[selected_cols].astype("float")
    config = mapper_data["config"]
    norm_type = config["norm_type"]
    eps = config["eps"]
    min_samples = config["min_samples"]

    #### TODO: update filter_parameters ####
    filter_parameters = config

    # filter functions
    interval = int(config["interval"])
    overlap = float(config["overlap"]) / 100
    
    # normalization
    if norm_type == "none":
        pass
    elif norm_type == "0-1": # axis=0, min-max norm for each column
        scaler = MinMaxScaler()
        data = scaler.fit_transform(data)
    else:
        data = sklearn.preprocessing.normalize(data, norm=norm_type, axis=0, copy=False, return_norm=False)
    data = pd.DataFrame(data, columns = all_cols)
    raw_data = data.to_dict()
    all_mappers = []
    for i in range(0, len(selected_cols)):
        for j in range(i, len(selected_cols)):
            filter_function = [selected_cols[i], selected_cols[j]]
            if i == j:
                filter_function = [selected_cols[i]]
            print(filter_function)
            filter_parameters['filter'] = filter_function

            mapper_result = run_mapper(data, selected_cols, interval, overlap, eps, min_samples, filter_function, filter_parameters)
            mapper_result['ph0'] = compute_ph0(mapper_result)
            mapper_result['ph1'] = compute_ph1(mapper_result)
            # if len(categorical_cols) > 0:
            #     for node in mapper_result['nodes']:
            #         vertices = node['vertices']
            #         data_categorical_i = data_categorical.iloc[vertices]
            #         node['categorical_cols_summary'] = {}
            #         for col in categorical_cols:
            #             node['categorical_cols_summary'][col] = data_categorical_i[col].value_counts().to_dict()
            # connected_components = compute_cc(mapper_result)
            # all_mappers.append({'mapper':mapper_result, 'connected_components': connected_components, 'vars': filter_function})
            all_mappers.append({'mapper':mapper_result, 'vars': filter_function})
    for i in range(len(all_mappers)):
        mapper_i = all_mappers[i]
        mapper_i['sub_graphs_v1'] = {}
        mapper_i['sub_graphs_v2'] = {}
        cols = mapper_i['vars']
        for col in cols:
            mapper_i['sub_graphs_v1'][col] = get_subgraph_v1(data[col], col, mapper_i['mapper'])
            mapper_i['sub_graphs_v2'][col] = get_subgraph_v2(data[col], col, mapper_i['mapper'])

    return jsonify(allMappers=all_mappers, rawData=raw_data) #jsonify(mapper=mapper_result, connected_components=connected_components)    

@app.route('/update_cluster_details', methods=['POST','GET'])
def update_cluster_details():
    label_column = request.get_data().decode('utf-8')
    df = pd.read_csv(APP_STATIC+"/uploads/processed_data.csv") 
    with open(APP_STATIC+"/uploads/cols_info.json") as f:
        cols_dict = json.load(f)
    labels = df[label_column]
    if label_column in cols_dict['cols_numerical']:
        labels = np.round(labels,2)
    labels = list(labels)
    return jsonify(labels=labels)

def run_mapper(data_array, col_names, interval, overlap, dbscan_eps, dbscan_min_samples, filter_function, filter_parameters=None):
        """This function is called when the form is submitted. It triggers construction of Mapper. 

        Each parameter of this function is defined in the configuration.

        To customize the Mapper construction, you can inherit from :code:`KeplerMapperConfig` and customize this function.


        Parameters
        -------------

        interval: int
            Number of intervals 

        overlap: float
            Percentage of overlap. This value will be divided by 100 to produce proporition.
        
        dbscan_eps: float
            :code:`eps` parameter for the DBSCAN clustering used in Kepler Mapper construction.
        
        dbscan_min_samples: int
            :code:`min_samples` parameter for the DBSCAN clustering used in Kepler Mapper construction.

        filter_function: str
            Projection for constructing the lens for Kepler Mapper.

        """
        # data_array = np.array(data_array)

        km_result = _call_kmapper(data_array, col_names, 
            interval,
            overlap,
            float(dbscan_eps),
            float(dbscan_min_samples),
            filter_function,
            filter_parameters
        )
        return _parse_result(data_array, km_result)

def _call_kmapper(data, col_names, interval, overlap, eps, min_samples, filter_function, filter_parameters=None):
    print(filter_parameters)
    mapper = KeplerMapper()
    # col_names = ['GrowthRate']
#     col_names = ['215121_x_at', '211430_s_at', '209138_x_at', 'AFFX-r2-P1-cre-3_at',
#        '214677_x_at', '221651_x_at', '221671_x_at', '217022_s_at',
#        'AFFX-hum_alu_at', 'AFFX-r2-P1-cre-5_at']
#     info_cols = ['age','chemo',
#  'hormonal',
#  'amputation',
#  'histtype',
#  'diam',
#  'posnodes',
#  'grade',
#  'angioinv',
#  'lymphinfil',
#  'barcode']

#     with open(APP_STATIC+"/uploads/cols_info.json") as f:
#         cols_dict = json.load(f)
#     col_names = cols_dict['cols_numerical']
    # col_names = [col for col in col_names if col not in info_cols]
    if len(col_names) == 1:
        data_new = np.array(data[col_names[0]]).reshape(-1,1)
    else:
        data_new = np.array(data[col_names])

    if len(filter_function) == 1:
        f = filter_function[0]
        lens = compute_lens(f, data, mapper, filter_parameters)
        
    elif len(filter_function) == 2:
        lens = []
        for f in filter_function:
            lens_f = compute_lens(f, data, mapper, filter_parameters)
            lens.append(lens_f)
        lens = np.concatenate((lens[0], lens[1]), axis=1)

    graph, cover_centers, cover_radius = mapper.map_parallel(lens, data_new, clusterer=cluster.DBSCAN(eps=eps, min_samples=min_samples), cover=Cover(n_cubes=interval, perc_overlap=overlap))
    cover_centers_new = [list(cover_centers[i]) for i in range(len(cover_centers))]
    cover_centers_new = np.array(cover_centers_new)
    cover_radius_new = list(cover_radius)

    cover_centers_dict = {}
    cover_radius_dict = {}

    for i in range(len(filter_function)):
        cover_centers_i = list(set(list(cover_centers_new[:,i])))
        cover_centers_i.sort()
        cover_centers_dict[filter_function[i]] = cover_centers_i
        cover_radius_dict[filter_function[i]] = cover_radius_new[i]

    return {"graph":graph, "cover_centers":cover_centers_dict, "cover_radius":cover_radius_dict}

def compute_lens(f, data, mapper, filter_parameters=None):
    data_array = np.array(data)
    if f in ["sum", "mean", "median", "max", "min", "std", "l2norm"]:
        lens = mapper.fit_transform(data_array, projection=f).reshape(-1,1)
    elif f == "Density":
        density_kernel = filter_parameters['density_kernel']
        density_bandwidth = filter_parameters['density_bandwidth']
        print("density", density_kernel, density_bandwidth)
        kde = KernelDensity(kernel=density_kernel, bandwidth=density_bandwidth).fit(data_array)
        lens = kde.score_samples(data_array).reshape(-1,1)
        scaler = MinMaxScaler()
        lens = scaler.fit_transform(lens)
    elif f == "Eccentricity":
        p = filter_parameters['eccent_p']
        distance_matrix = filter_parameters['eccent_dist']
        print("eccent", p, distance_matrix)
        pdist = distance.squareform(distance.pdist(data_array, metric=distance_matrix))
        lens = np.array([(np.sum(pdist**p, axis=1)/len(data_array))**(1/p)]).reshape(-1,1)
    elif f == "PC1":
        pca = PCA(n_components=min(2, data_array.shape[1]))
        lens = pca.fit_transform(data_array)[:,0].reshape(-1,1)
    elif f == "PC2":
        if data_array.shape[1] > 1:
            pca = PCA(n_components=2)
            lens = pca.fit_transform(data_array)[:,1].reshape(-1,1)
    else:
        lens = np.array(data[f]).reshape(-1,1)
    return lens

def _parse_result(data_array, km_result):
    graph = km_result['graph']
    col_names = data_array.columns
    data_array = np.array(data_array)
    data = {"nodes": [], "links": []}

    # nodes
    node_keys = graph['nodes'].keys()
    name2id = {}
    i = 1
    nodes_detail = {}
    for key in node_keys:
        name2id[key] = i
        cluster = graph['nodes'][key]
        nodes_detail[i] = cluster
        cluster_data = data_array[cluster]
        cluster_avg = np.mean(cluster_data, axis=0)
        cluster_avg_dict = {}
        for j in range(len(col_names)):
            cluster_avg_dict[col_names[j]] = cluster_avg[j]
        data['nodes'].append({
            "id": str(i),
            "size": len(graph['nodes'][key]),
            "avgs": cluster_avg_dict,
            "vertices": cluster
            })
        i += 1
    
    with open(APP_STATIC+"/uploads/nodes_detail.json","w") as f:
        json.dump(nodes_detail, f)

    # links
    links = set()
    for link_from in graph['links'].keys():
        for link_to in graph['links'][link_from]:
            from_id = name2id[link_from]
            to_id = name2id[link_to]
            left_id = min(from_id, to_id)
            right_id = max(from_id, to_id)
            links.add((left_id, right_id))
    for link in links:
        data['links'].append({"source": link[0], "target": link[1]})

    data['cover_centers'] = km_result['cover_centers']
    data['cover_radius'] = km_result['cover_radius']
    
    return data

def compute_cc(graph): 
    '''
    Compute connected components for the mapper graph
    '''
    G = nx.Graph()
    for node in graph['nodes']:
        nodeId = int(node['id'])-1
        G.add_node(nodeId)
    for edge in graph['links']:
        sourceId = int(edge['source'])-1
        targetId = int(edge['target'])-1
        G.add_edge(sourceId, targetId)
    cc = nx.connected_components(G)
    cc_list = []
    for c in cc:
        cc_list.append(list(c))
    return cc_list


# def get_intervals(col, interval, overlap):
#     # recover interval ranges
#     col_new = np.array(col)
#     interval_length = (np.max(col_new) - np.min(col_new)) / (interval - (interval-1)*overlap)
#     interval_details = []
#     current_min = np.min(col_new)
#     for i in range(interval):
#         current_max = current_min + interval_length
#         interval_details.append({'min':current_min, 'max':current_max})
#         current_min = current_min + (1-overlap) * interval_length
#     return interval_details

def get_subgraph_v1(col, col_name, mapper_graph):
    sub_graphs = []
    nodes_idx = {}
    cover_centers = mapper_graph['cover_centers'][col_name]
    cover_radius = mapper_graph['cover_radius'][col_name]
    # print(intervals)
    for i in range(len(cover_centers)):
        sub_graphs.append({'nodes':[], 'links':[]})

    for i in range(len(mapper_graph['nodes'])):
        node = mapper_graph['nodes'][i]
        col_i = col[node['vertices']]
        col_min = np.min(col_i)
        col_max = np.max(col_i)
        for j in range(len(cover_centers)):
            lb = cover_centers[j] - cover_radius
            ub = cover_centers[j] + cover_radius
            if col_min >= lb and col_max <= ub:
                sub_graphs[j]['nodes'].append(node)
                nodes_idx[node['id']] = j
                break
    # print(nodes_idx)
    for i in range(len(mapper_graph['links'])):
        link = mapper_graph['links'][i]
        source_idx = nodes_idx[str(link['source'])]
        target_idx = nodes_idx[str(link['target'])]
        if source_idx == target_idx:
            sub_graphs[source_idx]['links'].append(link)

    # add subgroup info to nodes
    for i in range(len(mapper_graph['nodes'])):
        node = mapper_graph['nodes'][i]
        node['sub_graphs_v1'+col_name] = [nodes_idx[node['id']]]

    # compute dim0 PH for subgraphs
    for subgraph in sub_graphs:
        subgraph['ph0'] = compute_ph0(subgraph)
        subgraph['ph1'] = compute_ph1(subgraph)

    return sub_graphs

def get_subgraph_v2(col, col_name, mapper_graph):
    print("subgraph_v2")
    print(col_name)
    sub_graphs = []
    nodes_idx = {}
    cover_centers = mapper_graph['cover_centers'][col_name]
    cover_radius = mapper_graph['cover_radius'][col_name]
    # print(intervals)
    for i in range(len(cover_centers)):
        sub_graphs.append({'nodes':[], 'links':[]})

    for i in range(len(mapper_graph['nodes'])):
        node = mapper_graph['nodes'][i]
        col_i = col[node['vertices']]
        col_min = np.min(col_i)
        col_max = np.max(col_i)
        for j in range(len(cover_centers)):
            lb = cover_centers[j] - cover_radius
            ub = cover_centers[j] + cover_radius
            if col_min >= lb and col_max <= ub:
                sub_graphs[j]['nodes'].append(node)
                nodes_idx[node['id']] = [j]
                break
    links_idx = {}
    for i in range(len(cover_centers)):
        links_idx[i] = []
    for i in range(len(mapper_graph['links'])):
        link = mapper_graph['links'][i]
        link_id = str(link['source'])+"-"+str(link['target'])
        source_idx = nodes_idx[str(link['source'])]
        target_idx = nodes_idx[str(link['target'])]
        for sidx in source_idx:
            sub_nodes_idx = [n['id'] for n in sub_graphs[sidx]['nodes']]
            if str(link['target']) not in sub_nodes_idx:
                sub_graphs[sidx]['nodes'].append(mapper_graph['nodes'][int(link['target'])-1])
                nodes_idx[str(link['target'])].append(sidx)
            if link_id not in links_idx[sidx]:
                sub_graphs[sidx]['links'].append(link)
                links_idx[sidx].append(link_id)
        for tidx in target_idx:
            sub_nodes_idx = [n['id'] for n in sub_graphs[tidx]['nodes']]
            if str(link['source']) not in sub_nodes_idx:
                sub_graphs[tidx]['nodes'].append(mapper_graph['nodes'][int(link['source'])-1])
                nodes_idx[str(link['source'])].append(tidx)
            if link_id not in links_idx[tidx]:
                sub_graphs[tidx]['links'].append(link)
                links_idx[tidx].append(link_id)

    # there might also be link between two nodes added from two different links
    for i in range(len(sub_graphs)):
        node_ids = []
        for node in sub_graphs[i]['nodes']:
            node_ids.append(node['id'])
        for link in mapper_graph['links']:
            if str(link['source']) in node_ids and str(link['target']) in node_ids:
                link_id = str(link['source'])+"-"+str(link['target'])
                if link_id not in links_idx[i]:
                    sub_graphs[i]['links'].append(link)
                    links_idx[i].append(link_id)

    # add subgroup info to nodes
    for i in range(len(mapper_graph['nodes'])):
        node = mapper_graph['nodes'][i]
        node['sub_graphs_v2'+col_name] = nodes_idx[node['id']]
    
    # compute dim0 PH for subgraphs
    for subgraph in sub_graphs:
        subgraph['ph0'] = compute_ph0(subgraph)
        subgraph['ph1'] = compute_ph1(subgraph)

    return sub_graphs

def compute_ph0(graph_data):
    """
    Get barcode of the input linegraph by computing its minimum spanning tree
    """
    nodes = graph_data['nodes']
    links = graph_data['links']
    components = []
    barcode = []
    for node in nodes:
        components.append([str(node['id'])])
    for link in links:
        source_id = str(link['source'])
        target_id = str(link['target'])
        source_cc_idx = find_cc_index(components, source_id)
        target_cc_idx = find_cc_index(components, target_id)
        if source_cc_idx != target_cc_idx:
            source_cc = components[source_cc_idx]
            target_cc = components[target_cc_idx]
            components = [components[i] for i in range(len(components)) if i not in [source_cc_idx, target_cc_idx]]
            components.append(source_cc + target_cc)
    return components

def compute_ph1(graph_data):
    nodes = graph_data['nodes']
    links = graph_data['links']
    with open(APP_STATIC+"/uploads/graph.txt", "w") as f:
        f.write("1\n")
        for node in nodes:
            node_id = str(node['id'])
            f.write("0 "+node_id+" 1\n")
        for link in links:
            source_id = str(link['source'])
            target_id = str(link['target'])
            f.write("1 "+source_id+" "+target_id+" 1\n")
    os.system(APP_STATIC+"/vendors/perseusMac nmfsimtop "+APP_STATIC+"/uploads/graph.txt "+APP_STATIC+"/uploads/graph_output")
    with open(APP_STATIC+"/uploads/graph_output_betti.txt") as f:
        ph1 = f.readlines()
        ph1 = ph1[1].split(" ")[3]
        if ph1 == '':
            ph1 = 0
        else:
            ph1 = int(ph1)
        print(ph1)

    return ph1

def find_cc_index(components, vertex_id):
    for i in range(len(components)):
        if vertex_id in components[i]:
            return i
        

        
    
