terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # State is local for now. To move it to S3 later, add a backend block and
  # run `terraform init -migrate-state`.
}

provider "aws" {
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "dadoune.com"
      ManagedBy = "terraform"
    }
  }
}
