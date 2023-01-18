openssl genrsa 2048 > my-aws-private.key
openssl req -new -x509 -nodes -sha1 -days 3650 -extensions v3_ca -key my-aws-private.key > my-aws-public.crt
openssl pkcs12 -export -in my-aws-public.crt -inkey my-aws-private.key -out my-aws.p12
aws --profile lab acm import-certificate --certificate file://my-aws-public.crt --private-key file://my-aws-private.key --certificate-chain file://my-aws-public.crt
