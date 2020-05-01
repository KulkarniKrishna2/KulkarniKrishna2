#!/bin/sh
grunt clean prod
docker build --no-cache -t conflux-web:local .