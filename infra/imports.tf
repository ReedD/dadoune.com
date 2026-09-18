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

# The zone itself, and every record in it that Route53 did not create with the
# zone. NS and SOA are left alone: they cannot be deleted, so managing them
# would only add a way to break delegation.

import {
  to = aws_route53_zone.main
  id = "Z30ID8QOBNK0FP"
}

import {
  to = aws_route53_record.www
  id = "Z30ID8QOBNK0FP_www.dadoune.com_A"
}

import {
  to = aws_route53_record.apex
  id = "Z30ID8QOBNK0FP_dadoune.com_A"
}

import {
  to = aws_route53_record.mx
  id = "Z30ID8QOBNK0FP_dadoune.com_MX"
}

import {
  to = aws_route53_record.txt
  id = "Z30ID8QOBNK0FP_dadoune.com_TXT"
}

import {
  to = aws_route53_record.dmarc
  id = "Z30ID8QOBNK0FP__dmarc.dadoune.com_TXT"
}

import {
  to = aws_route53_record.dkim_google
  id = "Z30ID8QOBNK0FP_google._domainkey.dadoune.com_TXT"
}

import {
  to = aws_route53_record.dkim_mail
  id = "Z30ID8QOBNK0FP_mail._domainkey.dadoune.com_TXT"
}

import {
  to = aws_route53_record.mail
  id = "Z30ID8QOBNK0FP_mail.dadoune.com_CNAME"
}

import {
  to = aws_route53_record.acm_validation
  id = "Z30ID8QOBNK0FP__4dd1cba2fd6ccb9a5646d4a9ad0c727c.dadoune.com_CNAME"
}

import {
  for_each = toset(["A", "AAAA"])

  to = aws_route53_record.media[each.key]
  id = "Z30ID8QOBNK0FP_media.dadoune.com_${each.key}"
}

import {
  for_each = toset([for n in range(10) : "i${n}"])

  to = aws_route53_record.image_shards[each.key]
  id = "Z30ID8QOBNK0FP_${each.key}.dadoune.com_CNAME"
}
