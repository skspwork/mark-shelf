# REQ1.2: Docker 起動

[R6.1 — Docker 配信](../../要求定義/R6-デプロイ柔軟性/R6.1-Docker配信.md) を満たすため、公式 Docker イメージとして配布し、`docker run` だけで閲覧サーバーが立ち上がるようにする。

## 要件

- `ghcr.io/skspwork/markshelf-base` として公開イメージを配布する
- ホストの `docs/` をボリュームマウントする運用と、下流の Dockerfile でイメージにドキュメントを焼き込む運用の両方をサポートする
- ホストに Node.js を要求しない（イメージ内で完結する）
- git 履歴を使いたい場合は `.git` をマウント／コピーすることで有効化できる

## 関連用語

- standalone
