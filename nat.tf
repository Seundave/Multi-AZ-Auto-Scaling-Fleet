# 1. Allocate an Elastic IP for the NAT Gateway

resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name = "multi-az-nat-eip"
  }
}

# 2. Create the NAT Gateway in Public Subnet A
resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id

  tags = {
    Name = "multi-az-nat-gateway"
  }
}
