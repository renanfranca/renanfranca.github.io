---
layout: post
title: Publishing Microservices into Google Kubernetes Engine (GKE)
description: 
date: 2022-04-27 20:32:16 -0300
tags: jhipster
image:  
draft: true

---

I will show you how to publish the [Mamazinha Baby Care Web App - Open Source Project](https://renanfranca.github.io/redirect/mamazinha-baby-care-app.html) on [Google Kubernetes Engine (GKE)
](https://cloud.google.com/kubernetes-engine).

## Before we start
I used JHipster to build the web app, everything you need to know about how to generate the Kubernetes (k8s) files to publish on GKE is detailed step by step in this tutorial (I strongly recommend watching the video first before getting your hand dirty 😁): https://developer.okta.com/blog/2021/06/01/kubernetes-spring-boot-jhipster.

## Publishing on GKE
I open source the yaml files that i used to publish on GKE:
 [![renanfranca/mamazinha-k8s](https://renanfranca.github.io/img/mamazinha-baby-care/github-mamazinha-k8s-image_readme.png)](https://github.com/renanfranca/mamazinha-k8s/tree/google-cloud)

I’ll cover here the Google Cloud configuration that I made to run my project as cheap as possible. My goal is to keep the cost below or near the [Always Free](https://cloud.google.com/free/) tiers:

> The GKE free tier provides $74.40 in monthly credits per billing account that are applied to zonal and Autopilot clusters. If you only use a single Zonal or Autopilot cluster, this credit will at least cover the complete cost of that cluster each month. Unused free tier credits are not rolled over, and cannot be applied to any other SKUs (for example, they cannot be applied to compute charges, or the cluster fee for Regional clusters).

### Initial setup
So I made this pricing simulation (I choose São Paulo as my Region because I am from Brazil):
![Pricing simulation](https://renanfranca.github.io/img/publishing-microservices-gke/price-simulation.png)
<figcaption>
https://cloud.google.com/products/calculator/#id=d2a4523b-27f9-4a35-950b-924cd8b0d590 </figcaption>

After logging in at Google Cloud Console, Let’s create the Cluster Zone and the first Node Pool

![image](https://renanfranca.github.io/img/publishing-microservices-gke/open-gke-standar-option.png)
<figcaption>Open GKE Standar Option</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/cluster-options.png)
<figcaption>Choose those options. Only edit the cluster name and the cluster zone (choose the nearest zone from your location or your client location)</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/cluster-created-screen.png)
<figcaption>You will end up with something like this</figcaption>

Now you have to connect to your cluster. Install google cloud SDK and install Google kubectl (I'm using windows)
`gcloud components install kubectl`

On git bash:
1. confirm that the installation was successful `wich kubectl` and the response should be something like 
```
/c/Users/AccountName/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/kubectl
```
2. execute the following command to connect to your cluster, change `mamazinha` to your cluster name and change `southamerica-east1-a` to your zone
`gcloud container clusters get-credentials mamazinha -zone=southamerica-east1-a`

You can now publish the yml files to GKE:
1. clone the repository `git clone git@github.com:renanfranca/mamazinha-k8s.git`
2. Switch to google-cloud branch `git checkout google-cloud`
3. On git bash go to the root of the cloned project folder and run the command `./kubectl-apply.sh -f`

Install the amazing k9s https://k9scli.io/topics/install/ and type the command to connect to your cluster `k9s -n mamazinha`

![image](https://renanfranca.github.io/img/publishing-microservices-gke/k9s-home-screen.png)
<figcaption>k9s home screen</figcaption>

As you can see only 3 nodes weren't enough for my project, after digging around I discovered [the preemptible VM option](https://cloud.google.com/kubernetes-engine/docs/how-to/preemptible-vms?_ga=2.47436577.-747971199.1636929609) 😆! The registry/baby microservice both are stateless, so I don't care if after 24h the VM will be destroyed and they will be initialized at another VM.

Let’s create a new node pool with a preemptible VM which costs less than the regular machine type.

![image](https://renanfranca.github.io/img/publishing-microservices-gke/add-node-pool-menu.png)
<figcaption>Go to Cluster Kubernetes Engine > Clusters > Clique on your cluster > clique on ADD NODE POOL</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/node-pool-details.png)
<figcaption>Only one node number</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/node-pool-detail-2.png)
<figcaption>You must mark the node as preemptible! Then click on CREATE! 🤩</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/created-preemptible-node.png)
<figcaption>Now we can see 4 nodes and only one preemptible</figcaption>

![image](https://renanfranca.github.io/img/publishing-microservices-gke/k9s-node-24h-shutdown.png)
<figcaption>That’s what happened after 24h! Shutdown the preemptible VM 😜</figcaption>

The cluster is ready! But how to choose the place to deploy each component of my project? The Postgres database can’t be deployed at the preemptible node, because the data will be lost every 24hrs!

The answer is [NodeAffinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#node-affinity), let’s take the gateway as an example. I want to always deploy the gateway on the node `gke-mamazinha-pool-small-cost-03fa0890-zqn0`

1.  Create a label for the node `kubectl label nodes gke-mamazinha-pool-small-cost-03fa0890-zqn0 app=gateway`
2.  Add this nodeAffinity property to my yml file

![image](https://renanfranca.github.io/img/publishing-microservices-gke/nodeAffinity-property.png)
<figcaption>gateway-deployment.yml</figcaption>

3. Change to`replicas: 0` and apply the deployment yml to terminate every gateway running instances `kubectl apply -f gateway-k8s/gateway-deployment.yml -n mamazinha`

4. Change back to `replicas: 1` and apply again `kubectl apply -f gateway-k8s/gateway-deployment.yml -n mamazinha`

5. Repeat this for the other components if you want to deploy at a specific node.

Here is the real cost of this configuration. I am from Brazil, so the costs is on my country currency. You can do the conversion by knowing that $1 Dollar was R$5,40 Reais when I capture the print screen from the following billing report.

![image](https://renanfranca.github.io/img/publishing-microservices-gke/standard-node-cost.png)
<figcaption>Mamazinha Google Cloud Project billing report</figcaption>

### Final setup
