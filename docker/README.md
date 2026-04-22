# markshelf Docker image

`ghcr.io/sksp-work/markshelf-base` は `FROM` で拡張して使える markshelf のベースイメージです。自分のドキュメントをコピーするか、ボリュームマウントするだけで、複数 basePath・複数インスタンスを同一ポートに相乗りさせられます。起動時に Next.js のビルドがコンテナ内で走る設計なので、basePath を環境変数だけで差し替えられます。

## 最速の使い方（ボリュームマウント）

```bash
docker run --rm -p 3000:3000 \
  -v "$PWD/docs:/docs" \
  ghcr.io/sksp-work/markshelf-base:latest
```

`http://localhost:3000` で起動します。デフォルト basePath はなし。

## basePath を指定する

```bash
docker run --rm -p 3000:3000 \
  -v "$PWD/docs:/docs" \
  -e BASE_PATH=/wiki \
  ghcr.io/sksp-work/markshelf-base:latest
```

`http://localhost:3000/wiki` で起動します。起動時に `next build` が走るため初回は 20〜40 秒かかります。同じ basePath の再起動ならスタンプファイルでスキップされます。

## FROM 拡張で自分のイメージを作る

ドキュメントをイメージに焼き込みたい場合：

```dockerfile
# your-project/Dockerfile
FROM ghcr.io/sksp-work/markshelf-base:latest

# docs を /docs に配置するだけで良い
COPY ./docs /docs

# basePath を固定したい場合
ENV BASE_PATH=/wiki
```

ビルドして起動：

```bash
docker build -t my-wiki .
docker run --rm -p 3000:3000 my-wiki
```

## 複数アプリを 1 ポートに相乗り（nginx リバースプロキシ）

リポジトリ同梱の [docker-compose.example.yml](../docker-compose.example.yml) と [nginx.example.conf](../nginx.example.conf) を参照してください。`/wiki` と `/design` の 2 インスタンスを `:8080` にルーティングする例です。SSE (`/api/watch`) が通るよう `proxy_buffering off` と長めの `proxy_read_timeout` が設定済み。

## 環境変数

| 変数 | デフォルト | 説明 |
|------|----------|------|
| `BASE_PATH` | なし | Next.js の basePath（`/wiki` のように） |
| `MARKSHELF_ROOT` | `/docs` | ドキュメントルート。通常は変更不要 |
| `PORT` | `3000` | リッスンポート |
| `HOSTNAME` | `0.0.0.0` | リッスンアドレス |

## 注意点

- `/docs` は git リポジトリであることを推奨します（変更履歴・タイムライン機能のため）。git 管理外の場合、機能は黙ってスキップされます
- `BASE_PATH` を変更するとコンテナ起動時に Next.js が再ビルドされます。基本はコールドスタート時のみの遅延で、再起動後はスタンプファイルでスキップ
- `VOLUME /docs` は**宣言していません**。これは downstream の `COPY . /docs` が Docker の volume-layering ルールで破棄されるのを避けるためです
