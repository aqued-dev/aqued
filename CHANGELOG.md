# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/aqued-dev/aqued/compare/3.5.1...HEAD)

## [3.5.1](https://github.com/aqued-dev/aqued/compare/3.5.0...3.5.1) - 2025/05/25

### Fixed

- ディス速通知のコマンドメンションを修正

## [3.5.0](https://github.com/aqued-dev/aqued/compare/3.4.0...3.5.0) - 2025/05/25

### Added

- 1000兆円欲しい
- Embedの編集完了/削除ボタン
- 親指立てるゲーム(by @curtainch)
- じゃんけん(by @curtainch)

### Changed

- 各種ライブラリとNode.jsのアップデート
- 不要依存関係を削除
- Embedフィールドの準備

### Fixed

- メッセージ展開でbotをはじく
- 短冊を作成者以外削除出来なくする
- Embedを作成者以外編集できなくする
- URL チェックを復活
- ロールパネルのプルダウンメニューの項目が減る

### Deleted

- build コマンド

## [3.4.0](https://github.com/aqued-dev/aqued/compare/3.3.0...3.4.0) - 2024-08-23

### Added

- User Installのサポート
- MySQLへの移行準備
- Docker導入
- URLチェッカー(メッセージコンテキストコマンド)

### Removed

- URLチェッカー
- Artifacter

### Fixed

- 最新のNode.jsで動作しない

## [3.3.0](https://github.com/aqued-dev/aqued/compare/3.2.1...3.3.0) - 2024-08-23

### Fixed

- Command Logでユーザー名がnullになる
- helpの説明が表示されない
- 起動ログが送信されない

### Changed

- ロールパネルでロール付与時にセレクトメニューを再構築します
- 各ライブラリをアップデート

## [3.2.1](https://github.com/aqued-dev/aqued/compare/3.2.0...3.2.1) - 2024-08-19

### Fixed

- ロールパネルでロールが付与できない

## [3.2.0](https://github.com/aqued-dev/aqued/compare/3.1.2...3.2.0) - 2024-07-30

### Added

- ロールパネル
- 埋め込み生成

### Fixed

- ロールが実行者のロールよりも上位でもコマンドを実行できない
- Artifacterの修正
- GlobalNameなどに対応
- ユーザーデータを保存しないようにする
- アカウントが削除されていたらForce Pinを解除する
- 起動エラーの修正
-

## [3.1.2](https://github.com/aqued-dev/aqued/compare/3.1.1...3.1.2) - 2023-07-17

### Fixed

- superglobalchat のエラー

## [3.1.1](https://github.com/aqued-dev/aqued/compare/3.1.0...3.1.1) - 2023-07-17

### Fixed

- CWE-20

## [3.1.0](https://github.com/aqued-dev/aqued/compare/3.0.1...3.1.0) - 2023-07-16

### Added

- help コマンド。
- userstatus コマンド。

### Changed

- userinfo でステータスを確認できるように。
- グローバルチャット、スーパーグローバルチャットでのメッセージ返信の時の返信先メッセージを embed にするように。

## [3.0.1](https://github.com/aqued-dev/aqued/compare/3.0.0...3.0.1) - 2023-07-14

### Added

- グローバルチャットで招待リンクは送信できないように。

### Fixed

- afk の理由が表示されない。
- webhook が送信したメッセージを force pin するとエラーが発生する。

### Changed

- エラー ID をコードスパンで囲みます。

## [3.0.0](https://github.com/aqued-dev/aqued/releases/tag/3.0.0) - 2023-07-14
