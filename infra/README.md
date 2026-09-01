# infra

Terraform for the hosting behind dadoune.com. It **adopts** infrastructure that
already existed rather than creating anything new.

## History

All of this was created in December 2016 by a CloudFormation stack named
`DadouneStatic`. On 2026-09-01 that stack was updated to set
`DeletionPolicy: Retain` on the resources worth keeping, then deleted. The
CodeBuild project, CodePipeline, their IAM roles and the artifact bucket went
away with it. Everything else survived and was imported here, so the site never
went down and DNS never changed.

## What it manages

| Resource | Physical ID |
|---|---|
| Site bucket | `dadounestatic-staticsitebucket-t4ycxp1w2q87` |
| Apex redirect bucket | `dadounestatic-redirectbucket-1pea5o3l45ds8` |
| CloudFront (www) | `EZ8NS13O04MAM` |
| CloudFront (apex redirect) | `EPBXY88A9V80N` |
| Route53 A records | `dadoune.com`, `www.dadoune.com` |

The ACM certificate is a **data source**, not managed here: it is a wildcard
shared with other distributions in the account. Note the old stack referenced a
different certificate that has since been deleted, so the stack was drifted;
the distributions actually use `78b5c0bf-...`.

## Why the S3 website endpoint

CloudFront points at the bucket's *website* endpoint rather than its REST
endpoint. That is what makes `/blog/some-post/` serve `.../index.html` with no
CloudFront function, which is exactly what Astro's directory output needs. The
cost is that the bucket must be publicly readable, since website endpoints
cannot use an origin access identity.

## Usage

```bash
terraform init
terraform plan     # should report no changes
```

State is local and gitignored. The `import` blocks in `imports.tf` are kept
deliberately: if state is lost, a fresh apply re-adopts the running resources
instead of building a duplicate.

## Deploying the site

Terraform does not upload content. Use `../scripts/deploy.sh`, which syncs
`dist/` with per-file cache headers and invalidates CloudFront. The bucket and
distribution IDs it defaults to are the `deploy_env` output here.
