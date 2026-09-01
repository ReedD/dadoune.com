output "site_bucket" {
  description = "Bucket scripts/deploy.sh syncs into."
  value       = aws_s3_bucket.site.id
}

output "www_distribution_id" {
  description = "Distribution scripts/deploy.sh invalidates."
  value       = aws_cloudfront_distribution.www.id
}

output "apex_distribution_id" {
  value = aws_cloudfront_distribution.apex.id
}

output "site_url" {
  value = "https://${local.www_domain}/"
}

output "deploy_env" {
  description = "Export these to override the defaults baked into scripts/deploy.sh."
  value = {
    SITE_BUCKET       = aws_s3_bucket.site.id
    SITE_DISTRIBUTION = aws_cloudfront_distribution.www.id
  }
}
