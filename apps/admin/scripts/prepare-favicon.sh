# Ref: https://github.com/ImageMagick/ImageMagick
# Requires ImageMagick installed (`convert` command)
# Run this script whenever the icon.svg is updated

# Use this command to execute the script:
#   cd apps/admin && bash scripts/prepare-favicon.sh

#!/bin/bash
set -eo pipefail

# Source icon (SVG)
SRC="src/app/icon.svg"
DEST="src/"               # ⚡ place generated icons in /public for Next.js
PUBLIC="public/"

FAV="$DEST/assets/favicons"

mkdir -p "$FAV"

# ICO frames ≤128px use BMP encoding (no PNG layers), avoiding Next.js RGBA PNG decode errors.
echo "Generating favicon.ico (16-128px bundle)..."
convert -background none -density 300 \
  \( "$SRC" -resize 128x128 \) \
  \( "$SRC" -resize 96x96 \) \
  \( "$SRC" -resize 64x64 \) \
  \( "$SRC" -resize 48x48 \) \
  \( "$SRC" -resize 32x32 \) \
  \( "$SRC" -resize 16x16 \) \
  "$DEST/app/favicon.ico"

echo "Generating generic Apple icons..."
convert -background none "$SRC" -resize 192x192 -density 300 "$FAV/apple-icon.png"
convert -background none "$SRC" -resize 192x192 -density 300 "$FAV/apple-touch-icon.png"
convert -background none "$SRC" -resize 192x192 -density 300 "$FAV/apple-touch-icon-precomposed.png"

cp "$FAV/apple-icon.png" "$PUBLIC/apple-icon.png"
cp "$FAV/apple-touch-icon.png" "$PUBLIC/apple-touch-icon.png"
cp "$FAV/apple-touch-icon-precomposed.png" "$PUBLIC/apple-touch-icon-precomposed.png"

echo "Generating Apple Touch sizes..."
convert -background none "$SRC" -resize 114x114 -density 300 "$FAV/apple-touch-icon-114.png"
convert -background none "$SRC" -resize 72x72   -density 300 "$FAV/apple-touch-icon-72.png"
convert -background none "$SRC" -resize 144x144 -density 300 "$FAV/apple-touch-icon-144.png"
convert -background none "$SRC" -resize 60x60   -density 300 "$FAV/apple-touch-icon-60.png"
convert -background none "$SRC" -resize 120x120 -density 300 "$FAV/apple-touch-icon-120.png"
convert -background none "$SRC" -resize 76x76   -density 300 "$FAV/apple-touch-icon-76.png"
convert -background none "$SRC" -resize 152x152 -density 300 "$FAV/apple-touch-icon-152.png"

echo "Generating Standard favicons..."
convert -background none "$SRC" -resize 196x196 -density 300 "$FAV/favicon-196.png"
convert -background none "$SRC" -resize 96x96   -density 300 "$FAV/favicon-96.png"
convert -background none "$SRC" -resize 32x32   -density 300 "$FAV/favicon-32.png"
convert -background none "$SRC" -resize 16x16   -density 300 "$FAV/favicon-16.png"
convert -background none "$SRC" -resize 128x128 -density 300 "$FAV/favicon-128.png"

echo "Generating Windows tiles..."
convert -background none "$SRC" -resize 144x144 -density 300 "$FAV/mstile-144.png"
convert -background none "$SRC" -resize 70x70   -density 300 "$FAV/mstile-70.png"
convert -background none "$SRC" -resize 150x150 -density 300 "$FAV/mstile-150.png"
convert -background none "$SRC" -resize 310x150 -density 300 "$FAV/mstile-310.png"
convert -background none "$SRC" -resize 310x310 -density 300 "$FAV/mstile-310.png"

echo "✅ All icons generated"