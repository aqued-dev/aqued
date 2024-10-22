# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/aqued-dev/aqued/compare/3.4.0...HEAD)

## [3.5.0](https://github.com/aqued-dev/aqued/compare/3.4.0...3.5.0) - 2024

これはAquedの大規模リファクタリングアップデートも含まれています

## Added

- 1000兆円欲しいを生成するコマンド
- リファクタリングを実施
- デバッグログの追加
- コンソールログをWebhookで送信
- MySQLへの移行を完了
- 起動時にSnowFlakeを生成
- ページネーションの有効期限が切れる前にボットが終了した際のボタン無効化

## Fixed

- メッセージ展開でボットをブロックする問題を修正
- 短冊を作成者以外が削除できないように制限

## Changed

- グローバルチャットの最大文字数を1900文字に
- グローバルチャットのエラーを分かりやすく
- Artifacter・URLチェッカーを休止
- MongoDBを廃止
- TypeScriptの設定を見直し
- DockerのNode.jsイメージを更新
- フォルダ構成を見直し
- 設定ファイルの読み込み方法を変更
- クライアントの拡張方法を改善
- 使用ライブラリのアップデート
- 一部のメッセージコンポーネントのcustomIdを変更
- 一部のメッセージコンポーネントを再利用可能に
- ボットを再起動せずにコマンドやイベントを再読み込み可能に
- ロガーにPinoを採用

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
