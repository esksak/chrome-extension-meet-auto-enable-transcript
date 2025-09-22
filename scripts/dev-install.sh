#!/bin/bash

# Chrome拡張機能の開発用インストールスクリプト
# 開発者モードでChromeに拡張機能をインストールする手順を表示

set -e

echo "🔧 開発用インストール手順"
echo "========================"

# プロジェクトのルートディレクトリに移動
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# まずビルドを実行
echo "🔨 ビルドを実行します..."
bash scripts/build.sh

BUILD_PATH="$(pwd)/build"

echo ""
echo "📋 Chrome拡張機能を開発者モードでインストールする手順:"
echo ""
echo "1. Google Chromeを開く"
echo "2. アドレスバーに 'chrome://extensions/' と入力してEnterを押す"
echo "3. 右上の「デベロッパーモード」をオンにする"
echo "4. 「パッケージ化されていない拡張機能を読み込む」をクリック"
echo "5. 以下のフォルダを選択:"
echo "   📂 $BUILD_PATH"
echo ""
echo "✅ インストール完了後、Google Meet (meet.google.com) にアクセスして"
echo "   拡張機能が動作することを確認してください。"
echo ""
echo "🔄 コードを変更した場合は、chrome://extensions/ で拡張機能の"
echo "   「更新」ボタンをクリックしてリロードしてください。"





















