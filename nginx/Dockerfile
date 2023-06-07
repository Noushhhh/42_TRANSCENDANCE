# ./nginx/Dockerfile
# Set base image
FROM ubuntu:latest

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Install vim 
RUN apt-get install -y vim 

# Remove the default Nginx configuration file
RUN rm /etc/nginx/sites-enabled/default

# Replace with your own Nginx configuration file
# Make sure to replace 'default.conf' with your actual configuration file
COPY ./default.conf /etc/nginx/sites-available/

# Enable your Nginx site configuration
RUN ln -s /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]