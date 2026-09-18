# The whole dadoune.com zone, not just the site records. Everything here was
# created by hand or by the 2016 CloudFormation stack and is adopted by the
# import blocks in imports.tf.
#
# The apex NS and SOA records are deliberately left unmanaged: Route53 creates
# them with the zone and will not let them be deleted, so owning them in
# Terraform buys nothing.

resource "aws_route53_zone" "main" {
  name = var.domain_name
}

# --- The site -----------------------------------------------------------

resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.main.zone_id
  name    = local.www_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.www.domain_name
    zone_id                = aws_cloudfront_distribution.www.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.apex.domain_name
    zone_id                = aws_cloudfront_distribution.apex.hosted_zone_id
    evaluate_target_health = false
  }
}

# --- Mail ---------------------------------------------------------------

# Google Workspace. The old five-host set (aspmx.l.google.com and friends) is
# still served, but the admin console now flags it and asks for this single
# host, which fronts the same infrastructure and needs no failover entries.
resource "aws_route53_record" "mx" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 300
  records = ["1 smtp.google.com."]
}

# SPF, plus the Workspace domain-ownership token. Both live on the apex, so
# they have to share one record set.
resource "aws_route53_record" "txt" {
  zone_id = aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300

  records = [
    "v=spf1 include:_spf.google.com ~all",
    "google-site-verification=F3oDOwT7Gn6RQ3LNgIXjkiXaSN3aFstQpm43wBoC5Go",
  ]
}

# Reporting only (p=none): nothing is quarantined or rejected on a failure.
resource "aws_route53_record" "dmarc" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=DMARC1; p=none; sp=none; rua=mailto:dmarc@mailinblue.com!10m; ruf=mailto:dmarc@mailinblue.com!10m; rf=afrf; pct=100; ri=86400"]
}

# The embedded "" splits the key into two strings: a single character string in
# a TXT record cannot exceed 255 bytes, and this 2048-bit key does.
resource "aws_route53_record" "dkim_google" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "google._domainkey.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqFW+sbiKevVMiuyXpFU7k0npGLF55And1RnDV9e+t7+9ckXqyzWPxHyPsofzEfzIZwWQHxbotxgwnKcmlk5DQu/3TCmuPES3Mpt/YrKavDYI0NP26NEIWe0CcZeNRbZl+4lsf/z693A80t81E1KekNfWgajmupe8hxSLT\"\"8NW0nm3OKLtFB+Q2vbcGO6XWSvaSYcKBv1uJaDrm98O71VW8krTtDYpdchMajW0PcG7hTrIGrm4LSin7vOW2sP9XiKbWbPimoUqmUHvIsHVuA1mcWaDs4alVUK/JKLs4Ls3jg06s/GOYrfv/XJlSn5a4NTGhSAo/y7RvcZhMuwRxOr/zQIDAQAB"]
}

# A second, 1024-bit DKIM key on the `mail` selector, for a sender other than
# Workspace. The DMARC report address points at Brevo, so most likely that.
resource "aws_route53_record" "dkim_mail" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail._domainkey.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  records = ["k=rsa;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDeMVIzrCa3T14JsNY0IRv5/2V1/v2itlviLQBwXsa7shBD6TrBkswsFUToPyMRWC9tbR/5ey0nRBH0ZVxp+lsmTxid2Y2z+FApQ6ra2VsXfbJP3HE6wAO0YTVEJt1TmeczhEd2Jiz/fcabIISgXEdSpTYJhb0ct0VJRxcg4c8c7wIDAQAB"]
}

# Points at Google's hosted-service endpoint, which is what serves a Workspace
# vanity URL such as mail.dadoune.com.
resource "aws_route53_record" "mail" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "mail.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["ghs.googlehosted.com."]
}

# --- Certificate validation ---------------------------------------------

# For the wildcard ACM certificate the distributions use. The certificate is a
# data source here, not managed by this config, so the record is written out
# rather than generated from it.
resource "aws_route53_record" "acm_validation" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "_4dd1cba2fd6ccb9a5646d4a9ad0c727c.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["_05af7afe80900c782fe957182037ae07.mzlfeqexyx.acm-validations.aws."]
}

# --- Media --------------------------------------------------------------

resource "aws_route53_record" "media" {
  for_each = toset(["A", "AAAA"])

  zone_id = aws_route53_zone.main.zone_id
  name    = "media.${var.domain_name}"
  type    = each.key

  alias {
    name                   = "dghay8srsapwa.cloudfront.net."
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

# i0 through i9 all answer with the same CloudFront distribution: the old
# domain-sharding trick for HTTP/1.1 connection limits. Nothing in this repo
# links through them any more, but they cost nothing and old URLs elsewhere
# may still resolve here.
resource "aws_route53_record" "image_shards" {
  for_each = toset([for n in range(10) : "i${n}"])

  zone_id = aws_route53_zone.main.zone_id
  name    = "${each.key}.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = ["dp5dqch5shuo2.cloudfront.net"]
}

