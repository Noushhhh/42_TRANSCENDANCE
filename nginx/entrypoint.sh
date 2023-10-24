#!/bin/bash

# Install OpenSSL
echo "Installing OpenSSL"
apt-get install -y openssl

# Generate the CA Private Key and Root Certificate
echo "Generate the CA Private Key and Root Certificate"
openssl genrsa -des3 -out myCA.key 2048
openssl req -x509 -new -nodes -key myCA.key -sha256 -days 1825 -out myCA.pem

# Create the Server Private Key and Certificate Signing Request (CSR)
echo "Create the Server Private Key and Certificate Signing Request (CSR)"
openssl genrsa -out www.transcendance.fr.key 2048
openssl req -new -key www.transcendance.fr.key -out www.transcendance.fr.csr

# Generate the Server Certificate
echo "Generate the Server Certificate"
openssl x509 -req -in www.transcendance.fr.csr -CA myCA.pem -CAkey myCA.key -CAcreateserial -out www.transcendance.fr.crt -days 1825 -sha256

# Start Nginx
echo "Start Nginx"
nginx -g "daemon off;"
