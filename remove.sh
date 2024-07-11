#!/bin/bash

# 检查并删除现有的 raydium-api 容器
container_id=$(docker ps -a -q --filter "name=raydium-api")

if [ -n "$container_id" ]; then
  echo "Stopping and removing existing raydium-api container..."
  docker stop "$container_id"
  docker rm "$container_id"
else
  echo "No existing 'raydium-api' container found."
fi

echo "Remove container completed."
