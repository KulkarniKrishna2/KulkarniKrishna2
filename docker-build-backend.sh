#!/bin/sh
grunt clean prod
docker build --no-cache -f ./Dockerfile-with-backend -t conflux-web:local-backend .