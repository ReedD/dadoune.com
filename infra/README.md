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
| Route53 hosted zone | `Z30ID8QOBNK0FP` |
| Route53 records | every record in the zone except the apex `NS` and `SOA` |

The ACM certificate is a **data source**, not managed here: it is a wildcard
shared with other distributions in the account. Note the old stack referenced a
different certificate that has since been deleted, so the stack was drifted;
the distributions actually use `78b5c0bf-...`.

## DNS

`dns.tf` holds the whole zone, not just the two records pointing at the site:
mail (MX, SPF, DMARC, two DKIM keys), the ACM validation CNAME, and the older
`i0`-`i9` / `media` image hosts. The apex `NS` and `SOA` are left unmanaged
because Route53 creates them with the zone and refuses to delete them.

Two dead records were deleted on 2026-09-12 rather than adopted:
`_4dd1cba2fd6ccb9a5646d4a9ad0c727c.dadoune.com.dadoune.com`, the ACM validation
CNAME with the domain appended twice from a config that left the trailing dot
off, and `i.dadoune.com`, an A record pointing at a bare EC2 IP that nothing has
ever linked to. The second was the one worth removing: a public repo that lists
the zone also hands an attacker a map of it, and a subdomain aimed at an IP we
may no longer hold is a takeover waiting to happen.

On 2026-09-12 the MX record moved from Google's five-host set to the single
`1 smtp.google.com.` the Workspace console now asks for. Same mail servers
behind it, no failover entries to keep in order.

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
