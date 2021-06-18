#!/bin/sh
gittag=$(git name-rev --name-only HEAD)
tag=$(basename "$gittag")
echo $tag
grunt clean prod
docker build --no-cache -f ./Dockerfile-with-backend-fargate -t 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web-fg:$tag .
aws ecr get-login-password | docker login --username AWS --password-stdin 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web-fg
docker push 963084729315.dkr.ecr.ap-south-1.amazonaws.com/conflux-web-fg:$tag