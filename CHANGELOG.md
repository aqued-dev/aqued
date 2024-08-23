# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/aqued-dev/aqued/compare/3.3.0...HEAD)

## [3.3.0](https://github.com/aqued-dev/aqued/compare/3.2.1...3.3.0) - 2023-08-23

### Fixed

- Command Logでユーザー名がnullになる
- helpの説明が表示されない
- 起動ログが送信されない

### Changed

- ロールパネルでロール付与時にセレクトメニューを再構築します
- 各ライブラリをアップデート

## [3.2.1](https://github.com/aqued-dev/aqued/compare/3.2.0...3.2.1) - 2023-08-19

### Fixed

- ロールパネルでロールが付与できない

## [3.2.0](https://github.com/aqued-dev/aqued/compare/3.1.2...3.2.0) - 2023-07-30

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
