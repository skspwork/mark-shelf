# SPEC5: 永続化

ビューア側（ブラウザ）で維持するユーザー設定と状態の実装仕様。

- [SPEC5.1 localStorage キー一覧](SPEC5.1-localStorage.md)
- [SPEC5.2 URL クエリ `?file=`](SPEC5.2-URLクエリ.md)

サーバー側の永続化はなく、設定はすべてブラウザに閉じる。複数タブで別々の設定を持ちたい場合は localStorage の仕様上、同一オリジンで共有される点に留意。
