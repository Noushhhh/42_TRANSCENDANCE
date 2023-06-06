# This is the project name
NAME = ft_transcendase

# This gets the current user's username
USER = $(shell whoami)

# This lists docker volumes that match the given names
VOLUMES = $(shell docker volume ls --filter name='^(db_volume|react_build)$') 

# current working directory or folder where the project is intalled 
CWD = $(shell dirname $(PWD))


# This gets the ID of the running containers
CONTAINER = $(shell docker ps -q)

# This is the command to run docker-compose with your specific .yml file and project name
COMPOSE = docker-compose -f srcs/docker-compose.yml -p $(NAME)
# The default rule (run when you type 'make' with no arguments). It will build the images and start the containers.
all: update_env up 


#updates .env file with current current working directory
update_env:
	@sed -i.bak 's#^STORAGE_PATH=.*#STORAGE_PATH=$(CWD)#' ./srcs/.env


# This rule starts the containers
up: build
		$(COMPOSE) up -d

# This rule builds the images
build: check-docker
		$(COMPOSE) build

# This rule checks if docker daemon is running
check-docker:
		@docker info > /dev/null 2>&1 || (echo "Docker daemon is not running"; exit 1)

# This rule creates the services
create: build
		$(COMPOSE) create

# This rule displays the volumes
show_volumes:
		$(VOLUMES)

# This rule starts the services
start:
		$(COMPOSE) start

# This rule restarts the services
restart:
		$(COMPOSE) restart

# This rule shows the service status
ps:
		$(COMPOSE) ps

# This rule shows the images of the services
images:
		$(COMPOSE) images

# This rule stops the services
stop:
		$(COMPOSE) stop

# This rule removes the services, images, and volumes. It also removes the data directory.
down:
		$(COMPOSE) down --rmi all --volumes

# This rule shows the logs of the services
logs:
		$(COMPOSE) logs

refresh:
		$(COMPOSE) stop frontend nginx backend 
		$(COMPOSE) rm -f --volumes frontend nginx backend
		docker volume rm react_build
		docker rmi -f frontend_image nginx_image backend_image
		$(COMPOSE) build backend frontend nginx
		$(COMPOSE) up -d backend frontend nginx

# This rule is equivalent to running `make fclean` and then `make all`
re: fclean all

# A phony target is one that is not really the name of a file; typically it is just a name for a recipe to be executed when you make an explicit request
.PHONY: all re up down build create ps start restart stop fclean images show_volumes check-docker update_env