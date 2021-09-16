# Mapper Stitching



<!-- Mapper Interactive is a web-based framework for interactive analysis and visualization of high-dimensional point cloud data  built upon the Mapper algorithm. It is an open source software released under the MIT License. -->

<!-- The Mapper algorithm is a tool from topological data analysis first introduced by Gurjeet Singh, Facundo Mémoli and Gunnar Carlsson in 2007 (http://dx.doi.org/10.2312/SPBG/SPBG07/091-100).  -->


## Installation

```bash
git clone git@github.com:tdavislab/mapper-stitching.git
cd mapper-stitching
python3 run.py
```

You can view the page at http://127.0.0.1:8080/ (If possible, please use Chrome).

## Dependencies
This software requires [Kepler Mapper](https://kepler-mapper.scikit-tda.org/), [scikit-learn](https://scikit-learn.org/stable/), [NetworkX](https://networkx.github.io/) and [flask](https://flask.palletsprojects.com/en/1.1.x/) to run.

If you do not have these packages installed, please use the following command to intall them.

```bash
pip install scikit-learn
pip install networkx
pip install flask
pip install flask_assets
```

<!-- ## Video -->

<!-- [![Screenshot of video](app/static/assets/video-teaser.png)](https://www.youtube.com/watch?v=z2VEkv1apF8) -->

<!-- ## License -->

<!-- This project is licensed under the MIT License - see the `LICENSE` file for details. -->

## Contributing

Pull requests are welcomed. 

## Cite

Stitch Fix for Mapper and Topological Gains. Youjia Zhou, Nathaniel Saul, Ilkin Safarli, Bala Krishnamoorthy, Bei Wang. 2021.



