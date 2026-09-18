variable "domain_name" {
  description = "Apex domain. The site itself is served from the www subdomain."
  type        = string
  default     = "dadoune.com"
}

variable "hosted_zone_id" {
  description = "Route53 zone for the domain. Managed as aws_route53_zone.main; this is the id the import block adopts."
  type        = string
  default     = "Z30ID8QOBNK0FP"
}

variable "site_bucket_name" {
  description = "Existing bucket holding the built site. Named by the 2016 CloudFormation stack; kept as-is so the CloudFront origin never has to change."
  type        = string
  default     = "dadounestatic-staticsitebucket-t4ycxp1w2q87"
}

variable "redirect_bucket_name" {
  description = "Existing bucket that redirects the apex to www."
  type        = string
  default     = "dadounestatic-redirectbucket-1pea5o3l45ds8"
}

locals {
  www_domain = "www.${var.domain_name}"

  # Fixed, global, and the same in every account: the zone every CloudFront
  # alias target lives in. Records aliasing a distribution this config does not
  # manage have to name it literally.
  cloudfront_zone_id = "Z2FDTNDATAQYW2"
}
