#!/bin/sh
# CF Pages / CI 빌드 전에 실행해서 폰트 파일을 받아옴.
# git에는 포함하지 않는 파일들 (용량 이슈)

set -e
FONTS_DIR="public/fonts"
mkdir -p "$FONTS_DIR"

download() {
  FILE="$FONTS_DIR/$1"
  URL="$2"
  if [ -f "$FILE" ]; then
    echo "[skip] $1 already exists"
  else
    echo "[download] $1"
    curl -sL "$URL" -o "$FILE"
  fi
}

# PretendardVariable — 한글 포함 Variable Font (PDF용)
download "PretendardVariable.ttf" \
  "https://github.com/orioncactus/pretendard/releases/download/v1.3.9/Pretendard-1.3.9.zip"

# zip에서 직접 추출하는 방식으로 변경
TMP="/tmp/pretendard.zip"
if [ ! -f "$FONTS_DIR/PretendardVariable.ttf" ]; then
  echo "[download] Pretendard zip..."
  curl -sL "https://github.com/orioncactus/pretendard/releases/download/v1.3.9/Pretendard-1.3.9.zip" -o "$TMP"
  unzip -j "$TMP" "public/variable/PretendardVariable.ttf" -d "$FONTS_DIR/"
  rm "$TMP"
  echo "[ok] PretendardVariable.ttf"
fi

echo "[done] All fonts ready"
