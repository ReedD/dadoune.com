# Adopting the resources the 2016 `DadouneStatic` CloudFormation stack created.
#
# That stack was updated to DeletionPolicy: Retain and then deleted, so these
# resources exist with no owner. Nothing here creates anything: every block
# below binds Terraform state to something already running, which is why the
# site never went down during the handover.
#
# Keep these blocks. State is local and gitignored, so if it is ever lost, a
# fresh `terraform init && terraform apply` re-adopts the running resources
# instead of trying to build a second copy of the site.

import {
  to = aws_s3_bucket.site
  id = "dadounestatic-staticsitebucket-t4ycxp1w2q87"
}

import {
  to = aws_s3_bucket_website_configuration.site
  id = "dadounestatic-staticsitebucket-t4ycxp1w2q87"
}

import {
  to = aws_s3_bucket_policy.site
  id = "dadounestatic-staticsitebucket-t4ycxp1w2q87"
}

import {
  to = aws_s3_bucket.redirect
  id = "dadounestatic-redirectbucket-1pea5o3l45ds8"
}

import {
  to = aws_s3_bucket_website_configuration.redirect
  id = "dadounestatic-redirectbucket-1pea5o3l45ds8"
}

import {
  to = aws_cloudfront_distribution.www
  id = "EZ8NS13O04MAM"
}

import {
  to = aws_cloudfront_distribution.apex
  id = "EPBXY88A9V80N"
}

import {
  to = aws_route53_record.www
  id = "Z30ID8QOBNK0FP_www.dadoune.com_A"
}

import {
  to = aws_route53_record.apex
  id = "Z30ID8QOBNK0FP_dadoune.com_A"
}
