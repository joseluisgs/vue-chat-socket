#!/bin/bash
# Para crear una instancia de Redis
# docker run -d -p 6379:6379 --name redis redis:5
docker-compose -f redis-compose.yml up -d