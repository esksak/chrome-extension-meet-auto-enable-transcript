#!/bin/bash

# Chrome拡張機能のパッケージングスクリプト
# Chrome Web Store用のzipファイルを作成

set -e

echo "📦 Chrome拡張機能のパッケージングを開始します..."

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# パッチバージョンを1つ上げる
echo "🔢 パッチバージョンを更新します..."
CURRENT_VERSION=$(grep '"version"' src/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "現在のバージョン: $CURRENT_VERSION"

# バージョンを分解 (例: 1.0.0 -> major=1, minor=0, patch=0)
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
NEW_PATCH=$((patch + 1))
NEW_VERSION="${major}.${minor}.${NEW_PATCH}"

echo "新しいバージョン: $NEW_VERSION"

# manifest.jsonのバージョンを更新
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src/manifest.json

echo "✅ バージョンを $CURRENT_VERSION から $NEW_VERSION に更新しました"

# まずビルドを実行
echo "🔨 ビルドを実行します..."
bash scripts/build.sh

# ビルドディレクトリが存在することを確認
BUILD_DIR="build"
if [ ! -d "$BUILD_DIR" ]; then
    echo "❌ エラー: ビルドディレクトリが見つかりません"
    exit 1
fi

# manifest.jsonからバージョンとアプリ名を取得
VERSION=$(grep '"version"' src/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
APP_NAME=$(grep '"name"' src/manifest.json | sed 's/.*"name": "\(.*\)".*/\1/')

# zipファイル名を生成（日本語文字を含む場合はサニタイズ）
SANITIZED_NAME=$(echo "$APP_NAME" | sed 's/[^a-zA-Z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')
ZIP_NAME="${SANITIZED_NAME}-v${VERSION}.zip"

# distディレクトリを作成
DIST_DIR="dist"
mkdir -p "$DIST_DIR"

# 既存のzipファイルがあれば削除
if [ -f "$DIST_DIR/$ZIP_NAME" ]; then
    echo "🗑️  既存のzipファイルを削除します: $ZIP_NAME"
    rm "$DIST_DIR/$ZIP_NAME"
fi

# zipファイルを作成
echo "🗜️  zipファイルを作成します: $ZIP_NAME"
cd "$BUILD_DIR"
zip -r "../$DIST_DIR/$ZIP_NAME" ./*

cd "$PROJECT_ROOT"

# zipファイルの情報を表示
echo ""
echo "✅ パッケージング完了！"
echo "📁 ファイル名: $ZIP_NAME"
echo "📂 保存場所: $DIST_DIR/$ZIP_NAME"
echo "📊 ファイルサイズ: $(du -h "$DIST_DIR/$ZIP_NAME" | cut -f1)"

# zipファイルの内容を表示
echo ""
echo "📋 zipファイルの内容:"
unzip -l "$DIST_DIR/$ZIP_NAME"

echo ""
echo "🎉 Chrome Web Storeにアップロードする準備が完了しました！"
echo "💡 Chrome Web Store Developer Dashboard: https://chrome.google.com/webstore/devconsole"
