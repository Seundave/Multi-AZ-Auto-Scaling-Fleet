terraform {
  required_version = ">= 1.10.0" # Required for S3 native locking
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "eu-north-1"

}
