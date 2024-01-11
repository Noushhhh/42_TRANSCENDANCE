# This is the project name
NAME = ft_transcendance

# this is the currenty operating system
UNAME_S := $(shell uname -s)

# This gets the current user's username
USER = $(shell whoami)

# current working directory or folder where the project is intalled 
CWD = $(shell dirname $(PWD))

# This gets the ID of the running containers
CONTAINER = $(shell docker ps -q)
# This is the command to run docker compose with your specific .yml file and project name
COMPOSE = docker compose -f ./docker-compose.yml -p $(NAME)

# As we are using the command sed in the update_env rule, we need to be careful with sed as the syntax
# change taking into account the operating system
ifeq ($(UNAME_S),Linux)
    SED_INPLACE := sed -i
endif
ifeq ($(UNAME_S),Darwin)
    SED_INPLACE := sed -i ''
endif

# The default rule (run when you type 'make' with no arguments). It will build the images and start the containers.
all: check-docker update_env up 

#updates .env file with current current working directory
update_env:
	@$(SED_INPLACE) 's#^STORAGE_PATH=.*#STORAGE_PATH=$(CWD)#' ./.env
  
up: build
	@printf "Starting the services...\n"
	$(COMPOSE) up -d

# This rule builds the images
build: check-docker
	@printf "Building the images...\n"
	$(COMPOSE) build

# This rule checks if docker daemon is running
check-docker:
	@printf "Checking if Docker daemon is running...\n"
	@docker info > /dev/null 2>&1 || (echo "Docker daemon is not running"; exit 1)

# This rule creates the services
create: build
	@printf "Creating the services...\n"
	$(COMPOSE) create

# This rule starts the services
start:
	@printf "Starting the services...\n"
	$(COMPOSE) start

# This rule restarts the services
restart:
	@printf "Restarting the services...\n"
	$(COMPOSE) restart

# This rule shows the service status
ps:
	$(COMPOSE) ps

# This rule shows the images of the services
images:
	$(COMPOSE) images

# This rule stops the services
stop:
	@printf "Stopping the services...\n"
	$(COMPOSE) stop

# This rule removes the services, images, and volumes. It also removes the data directory.
down: stop del_node_pack_front del_node_pack_backend del_uploads
	@printf "Stopping the services and removing all resources...\n"
	$(COMPOSE) down --rmi all --volumes

# This rule shows the logs of the services
logs:
	$(COMPOSE) logs

refresh:
	@printf "Refreshing the services...\n"
	@printf "Stop containers, delete volumes, rebuild containers.\n"
	$(COMPOSE) stop frontend nginx backend 
	$(COMPOSE) rm -f --volumes frontend nginx backend
	docker rmi -f frontend_image nginx_image backend_image
	$(COMPOSE) build backend frontend nginx
	$(COMPOSE) up -d backend frontend nginx

prune:
	@printf "Pruning unused containers, images, and volumes...\n"
	docker system prune -f -a

recreate_frontend: del_node_pack_front
	@echo "Recreating frontend service..."
	$(COMPOSE) stop frontend
	$(COMPOSE) rm -f frontend
	$(COMPOSE) up -d --build frontend

recreate_backend: del_node_pack_backend
	@echo "Recreating backend service..."
	$(COMPOSE) stop backend
	$(COMPOSE) rm -f backend
	$(COMPOSE) up -d --build backend

recreate_nginx:
	@echo "Recreating nginx service..."
	$(COMPOSE) stop nginx 
	$(COMPOSE) rm -f nginx 
	$(COMPOSE) up -d --build nginx 

del_node_pack_front:
	@echo "Removing frontend node_modules and package-lock.json"
	@rm -rf ./srcs/frontend/node_modules ./srcs/frontend/package-lock.json

del_node_pack_backend:
	@echo "Removing backend node_modules and package-lock.json"
	@rm -rf ./srcs/backend/node_modules ./srcs/backend/package-lock.json
del_uploads:
	@echo "Romoving uploads"
	@find ./srcs/backend/uploads/ ! -name '.gitkeep'  ! -name 'defaultProfileImage.jpg' -type f -exec rm -f {} +



fclean: down

# This rule is equivalent to running `make fclean` and then `make all`
re: fclean all

# A phony target is one that is not really the name of a file; typically it is just a name for a recipe to be executed when you make an explicit request
.PHONY: all re up down build create ps start restart stop fclean images show_volumes check-docker update_env recreate_backend recreate_frontend