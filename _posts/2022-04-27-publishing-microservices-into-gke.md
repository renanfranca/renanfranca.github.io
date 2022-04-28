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
1. confirm that the installation was successful `wich kubectl` and the response should be something like `/c/Users/ÀccountName/AppData/Local/Google/Cloud SDK/google-cloud-sdk/bin/kubectl`.
2. execute the following command to connect to your cluster, change ==mamazinha== to your cluster name and change ==southamerica-east1-a== to your zone
`gcloud container clusters get-credentials mamazinha -zone=southamerica-east1-a`

You can now publish the yml files to GKE:
1. clone the repository `git clone git@github.com:renanfranca/mamazinha-k8s.git`
2. Switch to branch `google-cloud`
3. On git bash go to the root of the cloned project folder and run the command `./kubectl-apply.sh -f`

Install the amazing k9s https://k9scli.io/topics/install/ and type the command to connect to your cluster `k9s -n mamazinha`

![image](https://renanfranca.github.io/img/publishing-microservices-gke/k9s-home-screen.png)
<figcaption>k9s home screen</figcaption>

