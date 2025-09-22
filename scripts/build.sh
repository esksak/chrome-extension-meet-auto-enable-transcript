#!/bin/bash

# Chrome拡張機能のビルドスクリプト
# Google Meet 文字起こし自動開始拡張機能

set -e

echo "🚀 Chrome拡張機能のビルドを開始します..."

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ビルドディレクトリを作成
BUILD_DIR="build"
if [ -d "$BUILD_DIR" ]; then
    echo "🧹 既存のビルドディレクトリを削除します..."
    rm -rf "$BUILD_DIR"
fi

echo "📁 ビルドディレクトリを作成します..."
mkdir -p "$BUILD_DIR"

# 必要なファイルをビルドディレクトリにコピー
echo "📋 ファイルをコピーします..."

# manifest.jsonをコピー
cp src/manifest.json "$BUILD_DIR/"

# content.jsをコピー
cp src/content.js "$BUILD_DIR/"

# アイコンファイルをコピー
cp src/icon16.png "$BUILD_DIR/"
cp src/icon48.png "$BUILD_DIR/"
cp src/icon128.png "$BUILD_DIR/"

# manifest.jsonのバージョンを表示
VERSION=$(grep '"version"' src/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "📦 バージョン: $VERSION"

echo "✅ ビルド完了！"
echo "📂 ビルドファイルは '$BUILD_DIR' ディレクトリにあります"

# ビルドされたファイルの一覧を表示
echo ""
echo "📋 ビルドされたファイル:"
ls -la "$BUILD_DIR"
