# breadthfirst

[Cytoscape](./Cytoscape.md) のグラフレイアウトアルゴリズムの一つ。指定した root ノードから幅優先探索で距離を算出し、距離が同じノードを同じ階層に並べる。

markshelf では `directed: true` を指定して、参照元が上、参照先が下になる配置で使っている。
