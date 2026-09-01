# The certificate is a wildcard (*.dadoune.com + dadoune.com) shared with other
# distributions in this account, so Terraform reads it rather than owning it.
# The 2016 stack pointed at a different certificate that has since been deleted.
data "aws_acm_certificate" "dadoune" {
  domain      = var.domain_name
  statuses    = ["ISSUED"]
  most_recent = true
}

locals {
  origin_id = "S3Bucket"
}

resource "aws_cloudfront_distribution" "www" {
  enabled         = true
  aliases         = [local.www_domain]
  price_class     = "PriceClass_All"
  http_version    = "http2"
  is_ipv6_enabled = false
  comment         = ""

  origin {
    origin_id   = local.origin_id
    domain_name = aws_s3_bucket_website_configuration.site.website_endpoint

    custom_origin_config {
      http_port  = 80
      https_port = 443
      # S3 website endpoints do not speak HTTPS, so this has to be http-only.
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["SSLv3", "TLSv1"]
    }
  }

  # Deliberately dropped on adoption: an ordered_cache_behavior for "*.*.js"
  # with min_ttl 86400. It existed to pin the react-static bundles
  # (main.<hash>.js) in cache. This site's hashed assets live under /_astro/
  # and get `Cache-Control: max-age=31536000, immutable` from the deploy
  # script, so headers do that job now. Keeping it would have forced a 24h
  # floor on any future double-dotted .js regardless of its headers.
  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["HEAD", "GET", "OPTIONS"]
    cached_methods         = ["HEAD", "GET", "OPTIONS"]
    compress               = true

    # TTLs of 0/0/1yr mean CloudFront obeys the Cache-Control headers that
    # scripts/deploy.sh sets per file, instead of overriding them.
    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.dadoune.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_cloudfront_distribution" "apex" {
  enabled         = true
  aliases         = [var.domain_name]
  price_class     = "PriceClass_All"
  http_version    = "http2"
  is_ipv6_enabled = false
  comment         = ""

  origin {
    origin_id   = local.origin_id
    domain_name = aws_s3_bucket_website_configuration.redirect.website_endpoint

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["SSLv3", "TLSv1"]
    }
  }

  default_cache_behavior {
    target_origin_id       = local.origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["HEAD", "GET", "OPTIONS"]
    cached_methods         = ["HEAD", "GET", "OPTIONS"]
    compress               = true
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 31536000

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  viewer_certificate {
    acm_certificate_arn      = data.aws_acm_certificate.dadoune.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}
