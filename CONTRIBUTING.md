# この Bot へ貢献

## パッケージマネージャー

package.jsonに書かれているバージョンのpnpmを使用してください
Node.js / pnpmはVoltaで導入することをおすすめします

## Node.js

最低バージョンは、v20.11.0 / v21.2.0 です
Aqued の公式インスタンスでは v22.7.0を使用しています

## Issue を作成するとき

1. その内容の Issue が既に存在していないかを確認して下さい(クローズ済みのものも)
2. 内容を書き込みます(テンプレートの場合は文字などを変更します)
3. ラベルをつけます(ラベルについては下記記載)
4. Issue を作成します

## Pull request を作成する時

1. その内容の Pull request が既に存在していないかを確認して下さい(マージ済み、クローズ済みのものも)
2. もう実装されていないか確認して下さい
3. Issueを作ります(上記参照)
4. Fork し、コードを書いて、内容を書き込みます
5. Pull request を作成します(develop ブランチによろしくお願いいたします)

## Issueラベル

10：内容
20：変更対象
30：優先度
40：ヘルプ
50：難易度
60：実装状況
70：リリース状況
99：解決以外のクローズ時

## コミットメッセージ

型(スコープ(任意)): タイトル

### 型

build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test<br/>
[Angular のコミット規約](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type)

### コミットメッセージの例

- 新機能<br>
  `feat(MongoDB): add 'set' method`<br>
- バグ修正

```
fix(MongoDB): Make the correct connection to MongoDB
close #32
```

<br>

## コミット

可能な場合は署名付きコミットでお願いします！
