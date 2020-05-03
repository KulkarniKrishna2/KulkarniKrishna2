#!/bin/sh
tag=$(git name-rev --name-only HEAD)
echo $tag
grunt clean prod
docker build --no-cache -f ./Dockerfile-with-backend -t 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web:$tag .
aws ecr get-login-password | docker login --username AWS --password-stdin 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web
docker push 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web:$tag