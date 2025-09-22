#!/bin/bash

# Chrome拡張機能のクリーンアップスクリプト
# ビルドファイルと一時ファイルを削除

set -e

echo "🧹 クリーンアップを開始します..."

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ビルドディレクトリを削除
if [ -d "build" ]; then
    echo "🗑️  buildディレクトリを削除します..."
    rm -rf build
fi

# distディレクトリを削除
if [ -d "dist" ]; then
    echo "🗑️  distディレクトリを削除します..."
    rm -rf dist
fi

# 一時ファイルを削除
echo "🗑️  一時ファイルを削除します..."
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true

echo "✅ クリーンアップ完了！"





















