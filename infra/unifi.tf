# The UniFi console issues its own Let's Encrypt certificate for
# aws_route53_record.unifi, using the DNS-01 challenge against this zone. It
# wants a static access key, which it stores on the appliance.
#
# That key lives on firmware we do not control, in a zone that also holds the
# MX, SPF, DKIM and DMARC records, so it is scoped down hard: the policy below
# permits writing exactly one record name, of exactly one type. A key lifted
# off the console cannot touch mail.
#
# No aws_iam_access_key here on purpose. Terraform would write the secret into
# state in plaintext; create the key in the console instead and paste it
# straight into UniFi.

resource "aws_iam_user" "unifi_acme" {
  name = "unifi-acme-dns01"
  path = "/service/"
}

data "aws_iam_policy_document" "unifi_acme" {
  # The ACME client has to find the zone before it can write to it, and these
  # three calls take no resource-level permissions: they are list operations
  # over the account, so "*" is the only resource they accept. None of them
  # mutate anything.
  statement {
    sid    = "DiscoverZone"
    effect = "Allow"
    actions = [
      "route53:ListHostedZones",
      "route53:ListHostedZonesByName",
    ]
    resources = ["*"]
  }

  # Polling for INSYNC after submitting the change. Change ids are opaque and
  # not known ahead of time, hence the wildcard.
  statement {
    sid       = "AwaitPropagation"
    effect    = "Allow"
    actions   = ["route53:GetChange"]
    resources = ["arn:aws:route53:::change/*"]
  }

  statement {
    sid       = "ReadZone"
    effect    = "Allow"
    actions   = ["route53:ListResourceRecordSets"]
    resources = [aws_route53_zone.main.arn]
  }

  # The write, fenced in by both conditions.
  #
  # Normalized names are lowercase and carry no trailing dot, which is the form
  # Route53 compares against regardless of what the client sends. Both keys are
  # multivalued, so the test has to be ForAllValues: it denies the call if the
  # request touches anything outside the listed set, which is what stops a
  # single request from smuggling in a second change alongside the challenge.
  #
  # This grant was briefly widened to permit an A record on the host, to find
  # out whether the console would set its own address while issuing. It had the
  # permission and never used it: one call, UPSERT TXT on the challenge name.
  # The address record is aws_route53_record.unifi, managed here, and this is
  # back to the challenge alone. Renewals need exactly this and no more.
  #
  # The name is read off that record so the two cannot drift apart.
  #
  # ChangeResourceRecordSetsActions could pin this to UPSERT and DELETE as
  # well, but clients differ on whether they CREATE or UPSERT the challenge,
  # and name plus type is already the fence that matters.
  statement {
    sid       = "WriteChallengeRecord"
    effect    = "Allow"
    actions   = ["route53:ChangeResourceRecordSets"]
    resources = [aws_route53_zone.main.arn]

    condition {
      test     = "ForAllValues:StringEquals"
      variable = "route53:ChangeResourceRecordSetsNormalizedRecordNames"
      values   = ["_acme-challenge.${aws_route53_record.unifi.name}"]
    }

    condition {
      test     = "ForAllValues:StringEquals"
      variable = "route53:ChangeResourceRecordSetsRecordTypes"
      values   = ["TXT"]
    }
  }
}

resource "aws_iam_user_policy" "unifi_acme" {
  name   = "dns01-challenge"
  user   = aws_iam_user.unifi_acme.name
  policy = data.aws_iam_policy_document.unifi_acme.json
}

output "unifi_acme_user" {
  description = "Create an access key for this user in the IAM console and paste it into the UniFi certificate dialog. Region is us-east-1."
  value       = aws_iam_user.unifi_acme.name
}
