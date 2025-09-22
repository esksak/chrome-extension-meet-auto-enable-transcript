# Chrome 拡張機能 ビルド・パッケージングスクリプト

Google Meet 文字起こし自動開始拡張機能のビルドとパッケージング用スクリプト集です。

## 📁 スクリプト一覧

### 🔨 `build.sh`

拡張機能をビルドするスクリプトです。

```bash
./scripts/build.sh
```

**機能:**

- `src/` フォルダから必要なファイルを `build/` フォルダにコピー
- manifest.json、content.js、アイコンファイルを含む
- バージョン情報の表示

### 📦 `package.sh`

Chrome Web Store 用の zip ファイルを作成するスクリプトです。

```bash
./scripts/package.sh
```

**機能:**

- 自動的に `build.sh` を実行
- `dist/` フォルダに zip ファイルを作成
- ファイル名は `アプリ名-vバージョン.zip` 形式
- zip ファイルの内容とサイズを表示

### 🧹 `clean.sh`

ビルドファイルと一時ファイルを削除するスクリプトです。

```bash
./scripts/clean.sh
```

**機能:**

- `build/` フォルダの削除
- `dist/` フォルダの削除
- 一時ファイル（.DS_Store、Thumbs.db 等）の削除

### 🔧 `dev-install.sh`

開発者モードで Chrome に拡張機能をインストールする手順を表示するスクリプトです。

```bash
./scripts/dev-install.sh
```

**機能:**

- 自動的に `build.sh` を実行
- Chrome 拡張機能のインストール手順を表示
- ビルドフォルダのパスを表示

## 🚀 使用方法

### 開発時

1. コードを編集
2. 開発用インストール: `./scripts/dev-install.sh`
3. Chrome で拡張機能をリロード

### リリース時

1. `src/manifest.json` でバージョンを更新
2. パッケージング: `./scripts/package.sh`
3. `dist/` フォルダ内の zip ファイルを Chrome Web Store にアップロード

### クリーンアップ

```bash
./scripts/clean.sh
```

## 📂 ディレクトリ構造

```
project/
├── src/                    # ソースファイル
│   ├── manifest.json
│   ├── content.js
│   └── icon*.png
├── scripts/                # ビルドスクリプト
│   ├── build.sh
│   ├── package.sh
│   ├── clean.sh
│   ├── dev-install.sh
│   └── README.md
├── build/                  # ビルド出力（自動生成）
└── dist/                   # パッケージ出力（自動生成）
```

## 🔗 関連リンク

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome 拡張機能開発ガイド](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 ドキュメント](https://developer.chrome.com/docs/extensions/mv3/)

## 💡 Tips

- **バージョン管理**: `src/manifest.json` の `version` フィールドを更新してからパッケージングしてください
- **テスト**: 本番リリース前に必ず `dev-install.sh` で動作確認を行ってください
- **ファイルサイズ**: Chrome Web Store のアップロード制限は 128MB です
- **権限**: 必要最小限の権限のみを `manifest.json` で指定してください
