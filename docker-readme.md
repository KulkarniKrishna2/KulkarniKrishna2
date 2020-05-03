# Using Docker for conflux-web

- Install Docker
  [get Docker](https://docs.docker.com/get-docker/)

- Build Docker Image
  - Without backend - it will create a **conflux-web:local** image

    ```bash
    sh ./docker-build.sh
    ```

  - With Conflux backend - it will create a **conflux-web:local-backend** image

    ```bash
    sh ./docker-build-backend.sh
    ```

  - To verify, run the below command you should see **conflux-web** and **nginx** Docker images

      ```bash
      docker image ls
      ```  

- Run the conflux-web Docker Container wtihout conflux-platform
  
  ```bash
    docker-compose up
  ```

- Run the conflux-web Docker Container with conflux-platform

  *Prerequisite*
  - To build conflux-platform Docker image, Move into the fineract-provider directory and execute :
    ```bash
     sh ./docker-build.sh
     ```
  - Configure Database 
    - Modify the tenants db to have redishost pointing to **redis**
    - Modify the tenants db to have cassandra pointing to **cassandra**
    - Modify the tenants db to have each tenant pointing to respective **tenant-db**
    - If you are running Finflux Docker Container locally then, use **host.docker.internal** as host instead of localhost or 127.0.0.1.
  - To read detailed documentation of conflux-platform Docker deployment [click-here](https://github.com/confluxtoo/conflux-platform/blob/develop/fineract-provider/docker-readme.md)
  - Configure the environment(**.env**) file
    - Modify db details to point the required tenants db.
    - TIP: If you are using locally installed mysql, use **host.docker.internal**  host instead of localhost or 127.0.0.1.
    - If you are running Finflux Docker Container locally then set **encryptedDataUsingKeyStore** to false.
    - To verify check

      ```bash
        docker-compose -f ./docker-compose-backend.yml config
      ```

   - Run the container
  
  ```bash
    docker-compose -f ./docker-compose-backend.yml up
  ```

- Run container as a daemon thread

  ```bash
    docker-compose up -d
  ```
