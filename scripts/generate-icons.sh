#!/bin/bash

# 从 build/icon.png (1024x1024) 生成 macOS .icns 和项目所需的所有图标文件
# 用法: ./scripts/generate-icons.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SOURCE="$PROJECT_DIR/build/icon.png"
BUILD_DIR="$PROJECT_DIR/build"
RESOURCES_DIR="$PROJECT_DIR/resources"
ICONSET_DIR="$BUILD_DIR/icon.iconset"

# 检查源文件
if [ ! -f "$SOURCE" ]; then
  echo "错误: 找不到源图标文件 build/icon.png"
  echo "请将 1024x1024 的 PNG 图标放到 build/icon.png"
  exit 1
fi

# 检查尺寸
WIDTH=$(sips -g pixelWidth "$SOURCE" | tail -1 | awk '{print $2}')
HEIGHT=$(sips -g pixelHeight "$SOURCE" | tail -1 | awk '{print $2}')

if [ "$WIDTH" -lt 1024 ] || [ "$HEIGHT" -lt 1024 ]; then
  echo "警告: 源图标尺寸为 ${WIDTH}x${HEIGHT}，建议使用 1024x1024"
fi

echo "==> 生成 macOS .icns 文件..."

# 创建 iconset 目录
mkdir -p "$ICONSET_DIR"

# 生成各尺寸
sips -z 16 16 "$SOURCE" --out "$ICONSET_DIR/icon_16x16.png" > /dev/null
sips -z 32 32 "$SOURCE" --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null
sips -z 32 32 "$SOURCE" --out "$ICONSET_DIR/icon_32x32.png" > /dev/null
sips -z 64 64 "$SOURCE" --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null
sips -z 128 128 "$SOURCE" --out "$ICONSET_DIR/icon_128x128.png" > /dev/null
sips -z 256 256 "$SOURCE" --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null
sips -z 256 256 "$SOURCE" --out "$ICONSET_DIR/icon_256x256.png" > /dev/null
sips -z 512 512 "$SOURCE" --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null
sips -z 512 512 "$SOURCE" --out "$ICONSET_DIR/icon_512x512.png" > /dev/null
sips -z 1024 1024 "$SOURCE" --out "$ICONSET_DIR/icon_512x512@2x.png" > /dev/null

# 生成 .icns
iconutil -c icns "$ICONSET_DIR" -o "$BUILD_DIR/icon.icns"

# 清理 iconset 临时目录
rm -rf "$ICONSET_DIR"

echo "==> 生成 Windows .ico 文件..."

# 用 iconset 中间产物生成 ico（需要先重新生成几个尺寸到临时目录）
ICO_TMP="$BUILD_DIR/ico_tmp"
mkdir -p "$ICO_TMP"
sips -z 16 16 "$SOURCE" --out "$ICO_TMP/16.png" > /dev/null
sips -z 32 32 "$SOURCE" --out "$ICO_TMP/32.png" > /dev/null
sips -z 48 48 "$SOURCE" --out "$ICO_TMP/48.png" > /dev/null
sips -z 64 64 "$SOURCE" --out "$ICO_TMP/64.png" > /dev/null
sips -z 128 128 "$SOURCE" --out "$ICO_TMP/128.png" > /dev/null
sips -z 256 256 "$SOURCE" --out "$ICO_TMP/256.png" > /dev/null

# 尝试用 ImageMagick 生成 ico
if command -v magick &> /dev/null; then
  magick "$ICO_TMP/16.png" "$ICO_TMP/32.png" "$ICO_TMP/48.png" "$ICO_TMP/64.png" "$ICO_TMP/128.png" "$ICO_TMP/256.png" "$BUILD_DIR/icon.ico"
elif command -v convert &> /dev/null; then
  convert "$ICO_TMP/16.png" "$ICO_TMP/32.png" "$ICO_TMP/48.png" "$ICO_TMP/64.png" "$ICO_TMP/128.png" "$ICO_TMP/256.png" "$BUILD_DIR/icon.ico"
else
  echo "警告: 未安装 ImageMagick，跳过 .ico 生成"
  echo "  安装方式: brew install imagemagick"
fi

rm -rf "$ICO_TMP"

echo "==> 同步 resources/icon.png..."
cp "$SOURCE" "$RESOURCES_DIR/icon.png"

echo ""
echo "完成! 生成的文件:"
echo "  - build/icon.icns (macOS App 图标)"
echo "  - build/icon.ico (Windows App 图标)"
echo "  - resources/icon.png (Electron 运行时图标)"
