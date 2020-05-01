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

- Run the conflux-web Docker Container wtihout conflux-platform
  
  ```bash
    docker-compose up
  ```

- Run the conflux-web Docker Container with conflux-platform

  *Prerequisite*
  - Build conflux-platform image from the platform repo refer conflux-plaform/fineract-provider/docker.readme.md
  - Modify the db  to have redishost poining to **redis**
  - Modify the db  to have cassandra poining to **cassandra**
  - Modify **.env** variables accordingly for the db details and secretKeyInfo
  - Configure the environment file
    - Modify db and secretkey variables in **.env** file.
    - TIP: If you are using locally installed mysql, use **host.docker.internal**  host instead of localhost or 127.0.0.1.
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
