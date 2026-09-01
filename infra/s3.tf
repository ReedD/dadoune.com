# The site bucket is served through CloudFront via its S3 *website* endpoint
# rather than the REST endpoint. That is what makes /blog/some-post/ resolve to
# .../index.html without a CloudFront function, so Astro's directory-style
# output works with no rewrite rules.

resource "aws_s3_bucket" "site" {
  bucket = var.site_bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  # Astro emits dist/404.html. The old react-static build emitted
  # 404/index.html, which is what this was set to until now.
  error_document {
    key = "404.html"
  }
}

# The website endpoint cannot use an origin access identity, so objects have to
# be publicly readable. Carried over unchanged from the CloudFormation stack.
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = data.aws_iam_policy_document.site_public_read.json
}

data "aws_iam_policy_document" "site_public_read" {
  statement {
    effect    = "Allow"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.site.arn}/*"]

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

# Apex redirect: dadoune.com -> https://www.dadoune.com, done by S3's website
# redirect rather than a CloudFront function.
resource "aws_s3_bucket" "redirect" {
  bucket = var.redirect_bucket_name

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_website_configuration" "redirect" {
  bucket = aws_s3_bucket.redirect.id

  redirect_all_requests_to {
    host_name = local.www_domain
    protocol  = "https"
  }
}
