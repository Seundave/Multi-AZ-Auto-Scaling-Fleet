terraform {
  required_version = ">= 1.10.0" # Required for S3 native locking

  backend "s3" {
    bucket       = "multi-az-auto-scale-bucket"
    key          = "prod/terraform.tfstate"
    region       = "eu-north-1"
    encrypt      = true
    use_lockfile = true # Enables native S3 state locking
  }
}
