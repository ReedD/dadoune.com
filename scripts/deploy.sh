#!/usr/bin/env bash
#
# Publish dist/ to the S3 static-site bucket and invalidate CloudFront.
#
# Usage:
#   ./scripts/deploy.sh              build, upload, invalidate
#   ./scripts/deploy.sh --dry-run    show exactly what would change, touch nothing
#   ./scripts/deploy.sh --no-build   upload the existing dist/ as-is
#
set -euo pipefail

BUCKET="${SITE_BUCKET:-dadounestatic-staticsitebucket-t4ycxp1w2q87}"
DISTRIBUTION="${SITE_DISTRIBUTION:-EZ8NS13O04MAM}"
DIST_DIR="dist"

DRY_RUN=""
BUILD=1
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="--dryrun" ;;
    --no-build) BUILD=0 ;;
    *) echo "unknown option: $arg" >&2; exit 2 ;;
  esac
done

cd "$(dirname "$0")/.."

if [ "$BUILD" -eq 1 ]; then
  echo "==> Building"
  npm run build
fi

if [ ! -f "$DIST_DIR/index.html" ]; then
  echo "error: $DIST_DIR/index.html is missing; refusing to sync an empty build" >&2
  exit 1
fi

# Paths that predate this site and are not ours to remove. These are empty
# folder placeholders left in the bucket by earlier projects; `.well-known` in
# particular is where domain-verification files land.
KEEP=(--exclude ".well-known/*" --exclude "ezform/*" --exclude "files/*")

echo
echo "==> 1/4  Hashed assets (immutable, 1 year)"
# Uploaded first and never deleted here, so freshly published HTML can never
# reference an asset that is not in the bucket yet.
aws s3 sync "$DIST_DIR" "s3://$BUCKET" $DRY_RUN \
  --exclude "*" --include "_astro/*" \
  --cache-control "public, max-age=31536000, immutable"

echo
echo "==> 2/4  Pages and everything else (revalidate every request)"
# --delete prunes pages that no longer exist, along with the leftovers from the
# 2018 react-static build.
aws s3 sync "$DIST_DIR" "s3://$BUCKET" $DRY_RUN --delete \
  --exclude "_astro/*" "${KEEP[@]}" \
  --cache-control "public, max-age=0, must-revalidate"

echo
echo "==> 3/4  Long-lived static files"
# Icons and photos are not content-hashed, so they get a day rather than a year.
for pattern in "images/*" "favicon.ico"; do
  aws s3 cp "s3://$BUCKET" "s3://$BUCKET" --recursive $DRY_RUN \
    --exclude "*" --include "$pattern" \
    --cache-control "public, max-age=86400" \
    --metadata-directive REPLACE >/dev/null
done

# The kill switch must never be cached, or browsers stuck on the 2018 worker
# will not see it. See public/sw.js.
if [ -z "$DRY_RUN" ]; then
  aws s3 cp "$DIST_DIR/sw.js" "s3://$BUCKET/sw.js" \
    --cache-control "no-cache, max-age=0" \
    --content-type "application/javascript" >/dev/null
  echo "    sw.js re-uploaded with no-cache"
fi

echo
echo "==> 4/4  CloudFront invalidation"
if [ -n "$DRY_RUN" ]; then
  echo "    (dry run) would invalidate /* on $DISTRIBUTION"
else
  ID=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" \
    --paths "/*" --query 'Invalidation.Id' --output text)
  echo "    invalidation $ID created on $DISTRIBUTION"
fi

echo
echo "Done. https://www.dadoune.com/"
