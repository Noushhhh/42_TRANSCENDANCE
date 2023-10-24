# ./nginx/Dockerfile
# Set base image
FROM ubuntu:latest

# Install Nginx and OpenSSL
RUN apt-get update && apt-get install -y nginx openssl

# Remove the default Nginx configuration file
RUN rm /etc/nginx/sites-enabled/default

# Replace with your own Nginx configuration file
# Make sure to replace 'default.conf' with your actual configuration file
COPY ./default.conf /etc/nginx/sites-available/

# Enable your Nginx site configuration
RUN ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/

# Generate SSL key & certificate
RUN mkdir -p /etc/nginx/ssl \
 && openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:4096 -keyout /etc/nginx/ssl/myCA.key -out /etc/nginx/ssl/myCA.crt -subj /C=FR

# Expose port 80 and 443
EXPOSE 80 443

# Set the entry point of the Docker container to the entry point script
ENTRYPOINT ["nginx", "-g", "daemon off;"]
