resource "aws_route53_record" "www" {
  zone_id = var.hosted_zone_id
  name    = local.www_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex" {
  zone_id = var.hosted_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.apex.domain_name
    zone_id                = aws_cloudfront_distribution.apex.hosted_zone_id
    evaluate_target_health = false
  }
}
