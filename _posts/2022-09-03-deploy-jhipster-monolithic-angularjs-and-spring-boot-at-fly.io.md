---
layout: post
title: Deploy jhipster monolithic (angularjs + spring boot) at fly.io for FREE
description: 
date: 2022-09-03 21:40:48 -0300
tags: jhipster
image: img/postbanners/2022-09-03-cover-deploy-jhipster-monolithic-fly-io.jpeg
permalink: /:categories/:title:output_ext
draft: true

---
![cover image](https://renanfranca.github.io/img/postbanners/2022-09-03-cover-deploy-jhipster-monolithic-fly-io.jpeg)

[I built a Baby Care web app](https://renanfranca.github.io/i-built-a-baby-care-web-app-using-jhipster.html) using microservices architecture to challenge me in my roadmap to master [jhipster](https://renanfranca.github.io/2022/02/24/why-did-i-use-jhipster.html). Unfortunately turns out that I couldn't afford the cost of [Publishing Microservices into Google Kubernetes Engine (GKE)](https://renanfranca.github.io/publishing-microservices-into-gke.html) and I decided to self-host the Baby Care App in my notebook and keep accessing it through my phone.

My baby girl Marília complete 9 months old so we are going out with her and I couldn't access the Baby Care App outside of my home. I decided to rewrite the Baby Care App as a monolithic architecture using jhipster to deploy it on Heroku for free. When I finally rebuilt the app, I realized that [Heroku is going to shut down the free tier plan](https://techcrunch.com/2022/08/25/heroku-announces-plans-to-eliminate-free-plans-blaming-fraud-and-abuse/?utm_source=tldrnewsletter)!

I will share with you my experience to publish an angularjsjs + spring boot + postgres database solution into [fly.io](https://fly.io). I opened source [the Baby Care App as monolithic](https://github.com/renanfranca/mamazinha-monolithic/tree/publish-to-flydotio) to let you put your hands on the code as I explain the step-by-step.

## Create postgres into flyio
### Free tier plan
According to [this flyio community post](https://community.fly.io/t/how-to-convert-your-not-free-postgres-to-free-postgres/3888), the free tier is a postgres with 1GB volume attached running in the free tier machine (shared-cpu-1x 256mb VMs).

### Install flyctl
I am using Windows 10, so I had to run the following command at Powershell `iwr https://fly.io/install.ps1 -useb | iex` . Visit [this link](https://fly.io/docs/hands-on/install-flyctl/) to install it on another OS.

### Signup
Run the command `flyctl auth signup` to create your account. I put my credit card to earn more free resources, [according to the documentation](https://fly.io/blog/free-postgres/) it's necessary to use postgres for free.

### Login
Run the command `flyctl auth login`

### Create a postgres app
Run the command `flyctl postgres create` and I choose the following options:
> ? Choose an app name (leave blank to generate one): baby-postgres
automatically selected personal organization: Renan Franca
? Select regions: São Paulo (gru)
? Select configuration: Development - Single node, 1x shared CPU, 256MB RAM, 1GB disk

After the potgres app were created you will receive something like that as an output:
> Postgres cluster baby-postgres created
  Username:    postgres
  Password:    randompassword
  Hostname:    baby-postgres.internal
  Proxy Port:  5432
  Postgres Port: 5433
postgres://postgres:randompassword@baby-postgres.internal:5432

Write it down, because you won't have another chance to access your postgres server information.
Run the following command `flyctl volumes list -a baby-postgres` to confirm that a persistent free volume were automatically created for your postgres app.

### Create baby database
You will have to connect to the fly.io postgres server that you crated to create the databasename. Use this command to portfoward and connect with [pdadmin](https://www.pgadmin.org/download/) locally `flyctl proxy 5432 -a <postgres-app-name>`.
Use 127.0.0.1 instead of localhost when define the host of your connection at pgadmin, because if you use localhost you will get the following error `could not receive data from server: Socket is not connected` ([https://serverfault.com/a/1003780/244961](https://serverfault.com/a/1003780/244961))
In my case I created the database called baby that will be used by my spring boot application.

## Create angular + spring boot server
### Free tier plan
According to [this flyio pricing link](https://fly.io/docs/about/pricing/), the free tier include:
-   Up to 3 shared-cpu-1x 256mb VMs
-   160GB outbound data transfer

### Create dockerfile baby care app
Let's create Dockerfile at root of your project folder to run my jhipster angular+spring boot application. I've got out of memory error when I tried to deploy using regular openjdk image. I learned that works if you use an optimize ibm jre ([https://community.fly.io/t/deployment-of-java-spring-api-using-dockerfile/6708/5](https://community.fly.io/t/deployment-of-java-spring-api-using-dockerfile/6708/5)) :
```docker
FROM ibm-semeru-runtimes:open-11-jre-focal
MAINTAINER https://renanfranca.github.io/about.html
COPY target/baby-0.0.1-SNAPSHOT.jar baby-0.0.1-SNAPSHOT.jar
ENV _JAVA_OPTIONS="-XX:MaxRAM=70m"
CMD java $_JAVA_OPTIONS -Dspring.profiles.active=$SPRING_PROFILES_ACTIVE -Dspring.datasource.url=$SPRING_DATASOURCE_URL -Dspring.liquibase.url=$SPRING_LIQUIBASE_URL -Dspring.datasource.username=$SPRING_DATASOURCE_USERNAME -Dspring.datasource.password=$SPRING_DATASOURCE_PASSWORD -jar baby-0.0.1-SNAPSHOT.jar
```
<figcaption>https://github.com/renanfranca/mamazinha-monolithic/blob/publish-to-flydotio/Dockerfile</figcaption>


To build the final jar and optimize the baby application for production, run:
`./mvnw -Pprod clean verify`

Then I have to create a docker image locally from Dockerfile using this command at project root folder `docker build -t stting/mamazinhaflyio .`. Replace `stting` with your [dockerhub account](https://hub.docker.com/).

The last step is to open dockerdesktop and push then cteated image to dockerhub.

### Create flyio dockerfile
I created the flyio folder `flyio/mamazinha` at the root directory of my project. Inside that folder I created another dockerfile to push to flyio, doing this way you wont use the fly.io image builder, only pull from dockerhub (this make the deploy much faster):
```docker
FROM stting/mamazinhaflyio:latest
```
<figcaption>https://github.com/renanfranca/mamazinha-monolithic/blob/publish-to-flydotio/flyio/Dockerfile</figcaption>

### Create the flyio application
Let's go to the folder `flyio/mamazinha` an run the command `flyctl launch` and I choose the following options:
> Creating app in C:\Users\Blog\Documents\Projects\mamazinha-monolithic\flyio\mamazinha
Scanning source code
Detected a Dockerfile app
? App Name (leave blank to use an auto-generated name): mamazinha-app
? App Name (leave blank to use an auto-generated name): mamazinha-app
Automatically selected personal organization: Renan Franca
? Select region: gru (São Paulo)
Created app mamazinha-app in organization personal
Wrote config file fly.toml

After running that command you will have an already configured `fly.toml` file with your application info and everything you need to deploy it 🤩.

#### Define the environment variables
You have to open the `fly.toml` file and edit the [env] section with the variables (replace the values with your recently created postgres app):
```docker
  _JAVA_OPTIONS="-XX:MaxRAM=70m"
  SPRING_PROFILES_ACTIVE="prod,api-docs"
  MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED="false"
  SPRING_DATASOURCE_USERNAME="postgres"
  SPRING_DATASOURCE_URL="jdbc:postgresql://app-postgres-name.internal:5432/databasename"
  SPRING_LIQUIBASE_URL="jdbc:postgresql://app-postgres-name.internal:5432/databasename"
  JHIPSTER_SLEEP=5
```
<figcaption>https://github.com/renanfranca/mamazinha-monolithic/blob/publish-to-flydotio/flyio/fly.toml</figcaption>

**WARNING**: about potgres database URL for java. The [postgres start guide](https://fly.io/docs/reference/postgres/) examples didn't consider java language and the URL to connect to postgres which they gave to me after creating the postgres instance was that: `postgres://baby-postgres.internal:5432/baby`. To solve the problem I change the prefix postgres to postgresql: `jdbc:postgresql://baby-postgres.internal:5432/baby`

#### Define the database password 
You can use the secret option to keep your database password safe! Run the command:
```
flyctl secrets set DB_POSTGRES_PASSWORD=pasteHereThePassword
```
That will create an encrypted environment variable. To list your secrets, run the command `flyctl secrets list`.

### Deploy the application

Run the command `flyctl deploy` . To open your already deployed application in a browser, run the command `flyctl open`.

## Read this jhipster users
Before deploy the app, you can test it using docker desktop.

First edit the file `src/main/docker/app.yml` to use the docker image `stting/mamazinhaflyio` (in my case):
```docker
# This configuration is intended for development purpose, it's **your** responsibility to harden it for production 
 version: '3.8' 
 services: 
   baby-app: 
     image: stting/mamazinhaflyio 
     environment: 
       - _JAVA_OPTIONS=-Xmx128m -Xms128m 
       - SPRING_PROFILES_ACTIVE=prod,api-docs 
       - MANAGEMENT_METRICS_EXPORT_PROMETHEUS_ENABLED=false 
       - SPRING_DATASOURCE_URL=jdbc:postgresql://baby-postgresql:5432/baby 
       - SPRING_LIQUIBASE_URL=jdbc:postgresql://baby-postgresql:5432/baby 
       - JHIPSTER_SLEEP=30 # gives time for other services to boot before the application 
       - SPRING_DATASOURCE_USERNAME=baby 
       - SPRING_DATASOURCE_PASSWORD= 
     # If you want to expose these ports outside your dev PC, 
     # remove the "127.0.0.1:" prefix 
     ports: 
       - 127.0.0.1:8080:8080 
     deploy: 
       resources: 
         limits: 
           memory: 256M 
   baby-postgresql: 
     image: postgres:14.2 
     # volumes: 
     #   - ~/volumes/jhipster/baby/postgresql/:/var/lib/postgresql/data/ 
     environment: 
       - POSTGRES_USER=baby 
       - POSTGRES_PASSWORD= 
       - POSTGRES_HOST_AUTH_METHOD=trust 
     # If you want to expose these ports outside your dev PC, 
     # remove the "127.0.0.1:" prefix 
     ports: 
       - 5432:5432
```
<figcaption>https://github.com/renanfranca/mamazinha-monolithic/blob/publish-to-flydotio/src/main/docker/app.yml</figcaption>


Then run the command `docker-compose -f src/main/docker/app.yml up -d` and access your application at `http://localhost:8080` which is using postgres database.


## My own experience with fly.io

I am running my Baby Care App on fly.io since 03 September 2022, here is the link [https://renanfranca.github.io/
redirect/babycareapp.html](https://renanfranca.github.io/redirect/babycareapp.html).

I accessed the app every day at least 10 times a day, I only got 5 downtimes the first week. After that me, and my wife didn't notice any downtime 😊! It looks like the app was always warmed up and ready to receive requests.

On the dashboard web app, you can see a lot of information about your app: [https://fly.io/dashboard](https://fly.io/dashboard). My application constantly use 226 MB from the 232 MB available. In addition, you can access the Grafana dashboard [https://fly-metrics.net/](https://fly-metrics.net/) for awesome insight info 👏!

## Special Thanks
I just wanna say thank you to the fly.io team to add this free high-quality free tier option! It has the bearing minimum for your MVP version and to use it to host your portfolio projects!

Thank you [@pascalgrimaud](https://twitter.com/pascalgrimaud?t=aUYEiYODOpXITMcmTOkbOQ&s=09) for being available to chat and help me out when I've got stuck! It's important to read another point of view when I can't move on.
