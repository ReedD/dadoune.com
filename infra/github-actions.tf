# Lets GitHub Actions deploy the site without any long-lived AWS keys. The
# workflow exchanges its OIDC token for this role at run time.

# The provider already existed in this account, so it is read rather than
# created. There can only be one per issuer URL.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

variable "github_repo" {
  description = "owner/name of the repository allowed to assume the deploy role."
  type        = string
  default     = "ReedD/dadoune.com"
}

variable "deploy_environment" {
  description = "GitHub Environment the deploy job declares. It determines the OIDC subject claim."
  type        = string
  default     = "production"
}

variable "deploy_branch" {
  description = "Only pushes to this branch may assume the role."
  type        = string
  default     = "master"
}

data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Scoped to one repo. Without this, any repo on GitHub could assume it.
    #
    # Note the subject form. A job that declares `environment:` gets
    # "repo:OWNER/NAME:environment:ENV", NOT "repo:OWNER/NAME:ref:refs/heads/BRANCH".
    # Pinning the ref form while the workflow declares an environment is why
    # the first run failed with "Not authorized to perform
    # sts:AssumeRoleWithWebIdentity".
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:environment:${var.deploy_environment}"]
    }

    # The environment subject alone says nothing about which branch ran, so
    # pin the branch separately. Both must hold.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:ref"
      values   = ["refs/heads/${var.deploy_branch}"]
    }
  }
}

resource "aws_iam_role" "github_deploy" {
  name               = "dadoune-com-github-deploy"
  description        = "Deploys dadoune.com from GitHub Actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
}

data "aws_iam_policy_document" "github_deploy" {
  # Enough to run scripts/deploy.sh: sync the build in, prune what is gone,
  # and rewrite cache headers by copying objects onto themselves.
  statement {
    sid       = "ListSiteBucket"
    effect    = "Allow"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.site.arn]
  }

  statement {
    sid    = "WriteSiteObjects"
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.site.arn}/*"]
  }

  statement {
    sid    = "InvalidateCloudFront"
    effect = "Allow"
    actions = [
      "cloudfront:CreateInvalidation",
      "cloudfront:GetInvalidation",
    ]
    resources = [aws_cloudfront_distribution.www.arn]
  }
}

resource "aws_iam_role_policy" "github_deploy" {
  name   = "deploy"
  role   = aws_iam_role.github_deploy.id
  policy = data.aws_iam_policy_document.github_deploy.json
}

output "github_deploy_role_arn" {
  description = "Referenced by .github/workflows/deploy.yml"
  value       = aws_iam_role.github_deploy.arn
}
