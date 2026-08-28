resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.kartify_vpc.id

  tags = {
    Name = "${var.project_name}-public-route-table"
  }
}

resource "aws_route" "public_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.kartify_internet_gateway.id

}

resource "aws_route_table_association" "public_route_table_association" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public_subnets[count.index].id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.kartify_vpc.id

  tags = {
    Name = "${var.project_name}-private-route-table"
  }
}

resource "aws_route" "private_route" {

  route_table_id         = aws_route_table.private_route_table.id

  destination_cidr_block = "0.0.0.0/0"

  nat_gateway_id = aws_nat_gateway.kartify_nat_gateway.id
}

resource "aws_route_table_association" "private_route_table_association" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = aws_subnet.private_subnets[count.index].id
  route_table_id = aws_route_table.private_route_table.id
}