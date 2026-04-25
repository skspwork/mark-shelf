# SPEC4: API

[REQ3 プレビューとツリー](../../要件定義/REQ3-プレビューとツリー/README.md)、[REQ5 ファイル検索](../../要件定義/REQ5-ファイル検索/README.md)、[REQ6 ファイル監視](../../要件定義/REQ6-ファイル監視/README.md)、[REQ7 変更履歴](../../要件定義/REQ7-変更履歴/README.md) などが依存するサーバー API の一覧。

## 方針

- Next.js App Router の `app/api/*/route.ts` にそれぞれ 1 ハンドラを配置
- すべて同一オリジンで動き、Docker 等でサブパス配下に配信する場合は [SPEC1.3 basePath](../SPEC1-CLI/SPEC1.3-basePath.md) を経由する
- レスポンスは JSON 主体（`/api/asset` と `/api/watch` を除く）
- エラー時は `{ error: string }` と適切な HTTP ステータスを返す

既存の [SPEC2.1 — graph API](../SPEC2-グラフ描画/SPEC2.1-graph-api.md) もこの章の一部として扱う。
