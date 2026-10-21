resource "local_file" "smoke_test" {
  content  = "Checking terraform state upload"
  filename = "${path.module}/smoke_test.txt"
}
