## Mapper Stitching Documentation

<!-- Mapper Interactive is a web-based framework for interactive analysis and visualization of high-dimensional point cloud data built upon the Mapper algorithm. It is an open source software released under the MIT License. -->

<!-- The Mapper algorithm is a tool from topological data analysis first introduced by Gurjeet Singh, Facundo Mémoli and Gunnar Carlsson in 2007 (http://dx.doi.org/10.2312/SPBG/SPBG07/091-100). -->

Please find the source code on [GitHub](https://github.com/tdavislab/mapper-stitching).

### Cite

Stitch Fix for Mapper and Information Gains. Bala Krishnamoorthy, Nathaniel Saul, Bei Wang. 2021.

<!-- ### Video -->

<!-- [![Screenshot of video](video-teaser.png)](https://www.youtube.com/watch?v=z2VEkv1apF8) -->

### Installation
```shell
git clone git@github.com:tdavislab/mapper-stitching.git
cd mapper-stitching
python3 run.py
```

After running the above commands, you can run Mapper Stitching by visiting http://127.0.0.1:8080/ on the local machine (If possible, please use Chrome).

### Dependencies
This software requires [Kepler Mapper](https://kepler-mapper.scikit-tda.org/), [scikit-learn](https://scikit-learn.org/stable/), [NetworkX](https://networkx.github.io/) and [flask](https://flask.palletsprojects.com/en/1.1.x/) to run.

If you do not have these packages installed, please use the following command to intall them.

```bash
pip install scikit-learn
pip install kmapper
pip install networkx
pip install flask
pip install flask_assets
```

<!-- To perform linear regression, please also make sure you have [statsmodels](https://www.statsmodels.org/stable/index.html) installed. -->
<!-- ```bash
pip install statsmodels
``` -->
