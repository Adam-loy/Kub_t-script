import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { error } from 'console';
import { ScrapedData } from '../model/mapviewer/ScrapedData';
//import { kc } from '../../config/kubeapi';



// and add for admin to be for a cluste wide 


const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)
// Note: if we gone to work with aws i think all of this need to be changed 

// const k8sApiRbac = kubeclient.makeApiClient(k8s.RbacAuthorizationV1Api); 
// Create a Kubernetes API client
const k8sApi = kubeclient.makeApiClient(k8s.CoreV1Api);

const k8sAppApi = kubeclient.makeApiClient(k8s.AppsV1Api);

const k8snetworkingApi = kubeclient.makeApiClient(k8s.NetworkingV1Api);

// Scrape Data 

export async function ScrapData(namespace: string): Promise<ScrapedData | Error>{
    try{
        const Scrapdata = await Promise.all([
            k8sApi.listNamespacedPod({namespace: namespace}),
            k8sApi.listNamespacedService({namespace: namespace}),
            k8sApi.listNamespacedEndpoints({namespace: namespace}),
            k8sApi.listPersistentVolume(),
            k8sApi.listNamespacedPersistentVolumeClaim({namespace: namespace}),
            k8sApi.listNamespacedConfigMap({namespace: namespace}),
            k8sApi.listNamespacedSecret({namespace: namespace}),
            k8sAppApi.listNamespacedDeployment({namespace: namespace}),
            k8sAppApi.listNamespacedDaemonSet({namespace: namespace}),
            k8sAppApi.listNamespacedReplicaSet({namespace: namespace}),
            k8sAppApi.listNamespacedStatefulSet({namespace: namespace}),
            k8snetworkingApi.listNamespacedIngress({namespace: namespace}),
        ])

        const scrapResult: ScrapedData = {
            pods : Scrapdata[0],
            services: Scrapdata[1],
            endpoints: Scrapdata[2],
            pvs: Scrapdata[3],
            pvcs: Scrapdata[4],
            configmaps: Scrapdata[5],
            secrets: Scrapdata[6],
            deployments: Scrapdata[7],
            daemonsets: Scrapdata[8],
            replicasets: Scrapdata[9],
            statefulsets: Scrapdata[10],
            ingresses: Scrapdata[11],
        }

        return scrapResult;
    }catch (error){
        console.log(`Error captured in the ScrapData `)
        throw error as Error;
    }
}