#!/bin/sh

display_message() {
    MESSAGE=$@
    # Display on console
    echo "::: $MESSAGE"
}

display_message "Check if envsubst command exists"
type envsubst > /dev/null
if [ $? -ne 0 ]; then
    display_message "Installing gettext-base package"
    apt-get install -qq gettext-base
    display_message "Check if envsubst command exists"
    type envsubst
    if [ $? -ne 0 ]; then
        display_message "Command envsubst from gettext-base package not found"
        exit 1
    fi
fi

display_message "Configure environment variables"
export CLIENT_PROTOCOL=http
export CLIENT_HOST=192.168.10.160
export CLIENT_PORT=80
export SERVER_PROTOCOL=http
export SERVER_HOST=192.168.10.160
export SERVER_PORT=4000

display_message "Remove old docker-compose configuration"
rm -f docker-compose.yml

display_message "Generate new docker-compose file"
envsubst < "template.docker-compose.yml" > "docker-compose.yml";

display_message "Check new configuration file"
docker-compose config > /dev/null
if [ $? -ne 0 ]; then
    display_message "Error in the docker-compose file. Please correct."
    exit 1
fi

display_message "Starting docker compose"
docker-compose -p kupiki-admin-backend up --build