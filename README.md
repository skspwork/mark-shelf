# markshelf

[![npm version](https://img.shields.io/npm/v/markshelf.svg)](https://www.npmjs.com/package/markshelf)
[![license](https://img.shields.io/npm/l/markshelf.svg)](./LICENSE)
[![ghcr](https://img.shields.io/badge/ghcr.io-markshelf--base-blue)](https://github.com/skspwork/mark-shelf/pkgs/container/markshelf-base)

Git リポジトリ内の Markdown ドキュメントを「読むため」に特化した構造化ビューア。

- 独立した全画面ブラウザビューアで疲れずに読める
- ドキュメント間の依存をリンクグラフで俯瞰
- リンクホバーで中身をポップアップ表示
- ファイル保存が即反映（リロード不要）

## クイックスタート

### npx（ローカル閲覧）

対象リポジトリのルートで：

```bash
npx markshelf
```

`http://localhost:3000` で起動します。

### Docker（配布・相乗り）

```bash
# ドキュメントをボリュームマウントで
docker run --rm -p 3000:3000 \
  -v "$PWD/docs:/docs" \
  ghcr.io/skspwork/markshelf-base:latest
```

自分のドキュメントを焼き込んだイメージを作りたい場合：

```dockerfile
# your-project/Dockerfile
FROM ghcr.io/skspwork/markshelf-base:latest

COPY .git /.git
COPY docs /docs

# サブパスで配信するなら
ENV BASE_PATH=/wiki
```

詳細は [docker/README.md](docker/README.md) を参照。

## 主な機能

- **ツリービュー** — フォルダ展開/折りたたみ、状態永続化、検索
- **リンクグラフ** — マークダウンリンク + 自動マッチで参照関係を有向グラフで表示、深さ切替、フォルダ除外フィルタ、拡大率永続化
- **プレビューポップアップ** — リンクホバーで内容を即確認、ネスト対応
- **変更履歴 / タイムライン** — git ログから自動生成
- **ファイル共有 URL** — `?file=path/to/foo.md` で特定ファイルを直接開ける
- **ファイル変更の自動反映** — エディタで保存 → ブラウザが自動更新（SSE）

## 設定

| 環境変数 | デフォルト | 説明 |
|---------|----------|------|
| `MARKSHELF_ROOT` | `process.cwd()` / Docker は `/docs` | ドキュメントルート |
| `BASE_PATH` | なし | Next.js basePath（Docker のみ） |
| `PORT` | `3000` | リッスンポート |

## ドキュメント構成

[docs/](docs/) 配下で要求定義 → 要件定義 → 仕様の 3 階層で自己文書化しています。書き方の規約は各カテゴリの README を参照:

- [docs/要求定義/README.md](docs/要求定義/README.md)
- [docs/要件定義/README.md](docs/要件定義/README.md)
- [docs/仕様/README.md](docs/仕様/README.md)

## 開発

```bash
npm install
npm run dev
```

Next.js 16 + React 19 + Cytoscape + simple-git で構成。ローカルで dev サーバを立てる際は `MARKSHELF_ROOT` を指定しないと cwd（リポジトリ自身）がドキュメントルートになる点に注意。

## ライセンス

[MIT](./LICENSE) © sksp.work
