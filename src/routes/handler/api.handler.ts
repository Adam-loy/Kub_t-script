import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import {triggerCronJob} from './../resource/cronjob/job.js'
// import { error, group } from 'console';
import { getGroupAndVersion } from '../resource/replicas/replicas.js';
// import { ScrapedData } from '../../model/mapviewer/ScrapedData.js';
import { ScrapData } from '../../controller/map-view.controller.js';
//import { kc } from '../../config/kubeapi';
import { Config, args } from "../../config/web_config.js";
import { getUserAgent, getVersion } from "../../config/web_env.js";
import { SystemBanner, toSystemBannerSeverity } from '../../model/systembanner/systembanner.js';
import { ObjectMeta, ResourceList, ErrStatus, AppDeploymentContentSpec, AppDeploymentContentResponse, PodList, PodDetail, PodContainerList } from '../../model/typing/root.api.js';
import { GetCronJobList} from '../../controller/ressource/cronjob/list.js'
import { GetDaemonSetList } from '../../controller/ressource/daemonset/list.js';
import { GetPodList } from '../../controller/ressource/pod/list.js';
import { GetIngressList } from '../../controller/ressource/ingress/list.js';
import {  GetNetworkPolicyList } from '../../controller/ressource/networkpolicy/list.js';
import { GetHorizontalPodAutoscalerList } from '../../controller/ressource/hpa/list.js';
import { GetServiceList } from '../../controller/ressource/service/list.js';
import { GetClusterRoleList } from '../../controller/ressource/clusterrole/list.js';
import { GetNodeList } from '../../controller/ressource/node/list.js';
import { GetSecretList } from '../../controller/ressource/secret/list.js';
import { GetStatefulSetList } from '../../controller/ressource/statefulset/list.js';
import { GetRoleBindingList } from '../../controller/ressource/rolebinding/list.js';
import { GetDeploymentList } from '../../controller/ressource/deployment/list.js';
import { GetJobList } from '../../controller/ressource/job/list.js';
import { GetNamespaceList } from '../../controller/ressource/namespace/list.js';
import { GetPersistentVolumeList } from '../../controller/ressource/persistentvolume/list.js';
import { GetReplicaSetList } from '../../controller/ressource/replicaset/list.js';
import { GetRoleList } from '../../controller/ressource/role/list.js';
import { GetServiceAccountList } from '../../controller/ressource/serviceaccount/list.js';
import { GetStorageClassList } from '../../controller/ressource/storageclass/list.js';
import { GetConfigMapList } from '../../controller/ressource/configmap/list.js';
import { GetPersistentVolumeClaimList } from '../../controller/ressource/persistentvolumeclaim/list.js';
import { GetReplicationControllerList } from '../../controller/ressource/replicationcontroller/list.js';
import { GetCustomeResourceDefenitionList } from '../../controller/ressource/crd/list.js';
import { GetIngressClassList } from '../../controller/ressource/ingressclass/list.js';
import * as fs from 'node:fs/promises'
import * as yaml from 'js-yaml'
import * as  stream from 'stream';
import { formatRFC3339 } from 'date-fns';
import { GetCronJobLogList } from '../../controller/ressource/cronjob/listlog.js';
import { GetDaemonSetLogList } from '../../controller/ressource/daemonset/listlog.js';
import { GetDeploymentLogList } from '../../controller/ressource/deployment/listlog.js';
import { GetJobLogList } from '../../controller/ressource/job/listlog.js';
import { GetPodLogList } from '../../controller/ressource/pod/listlog.js';
import { GetReplicaSetLogList } from '../../controller/ressource/replicaset/listlog.js';
import { GetReplicationControllerLogList } from '../../controller/ressource/replicationcontroller/listlog.js';
import { GetStatefulSetLogList } from '../../controller/ressource/statefulset/listlog.js';
import { GetPodDetail } from '../../controller/ressource/pod/pod_detail.js';
import { GetClusterRoleDetail } from '../../controller/ressource/clusterrole/cluster_role_detail.js';
import { GetClusterRoleBindingDetail } from '../../controller/ressource/clusterrolebinding/detail.js';
import { GetConfigMapDetail } from '../../controller/ressource/configmap/configmap_detail.js';
import { GetCRDDetail } from '../../controller/ressource/crd/crd_detail.js';
import { GetCronJobDetail } from '../../controller/ressource/cronjob/cronjob_detail.js';
import { GetDeploymentDetail } from '../../controller/ressource/deployment/deployment_detail.js';
import { GetHorizontalPodAutoscalerDetail } from '../../controller/ressource/hpa/hpa_detail.js';
import { GetIngressDetail } from '../../controller/ressource/ingress/ingress_detail.js';
import { GetJobDetail } from '../../controller/ressource/job/job_detail.js';
import { GetNamespaceDetail } from '../../controller/ressource/namespace/namespace_detail.js';
import { GetNetworkPolicyDetail } from '../../controller/ressource/networkpolicy/np_detail.js';
import { GetNodeDetail } from '../../controller/ressource/node/node_detail.js';
import { GetPersistentVolumeDetail } from '../../controller/ressource/persistentvolume/pv_detail.js';
import { GetPersistentVolumeClaimDetail } from '../../controller/ressource/persistentvolumeclaim/pvc_detail.js';
import { GetReplicaSetDetail } from '../../controller/ressource/replicaset/replicaset_detail.js';
import { GetReplicationControllerDetail } from '../../controller/ressource/replicationcontroller/rc_detail.js';
import { GetRoleDetail } from '../../controller/ressource/role/role_detail.js';
import { GetRoleBindingDetail } from '../../controller/ressource/rolebinding/rolebinding_detail.js';
import { GetServiceDetail } from '../../controller/ressource/service/service_detail.js';
import { GetServiceAccountDetail } from '../../controller/ressource/serviceaccount/sva_detail.js';
import { GetStatefulSetDetail } from '../../controller/ressource/statefulset/statefulset_detail.js';
import { GetDaemonSetDetail } from '../../controller/ressource/daemonset/daemonSet_detail.js';
import { GetEventList } from '../../controller/ressource/event/list.js';
import http from 'http';
import { WebSocketServer } from 'ws';
import { GetEndpointList } from '../../controller/ressource/endpoint/list.js';

const kubeconfigPath = '/home/archo/cert/config'

const kubeclient = new k8s.KubeConfig();
// kubeclient.loadFromFile(kubeconfigPath);


kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)
// Note: if we gone to work with aws i think all of this need to be changed 

// const log = new k8s.Log(kubeclient)
// Create a Kubernetes API client
const k8sApi  = kubeclient.makeApiClient(k8s.CoreV1Api);

const k8sApiRbac = kubeclient.makeApiClient(k8s.RbacAuthorizationV1Api); 


const k8sbatchApi = kubeclient.makeApiClient(k8s.BatchV1Api);

const k8sStorageApi = kubeclient.makeApiClient(k8s.StorageV1Api);

const k8sAppApi = kubeclient.makeApiClient(k8s.AppsV1Api);

const k8sautoscalingApi = kubeclient.makeApiClient(k8s.AutoscalingV1Api);

const k8snetworkingApi = kubeclient.makeApiClient(k8s.NetworkingV1Api);

const k8scustomObjectsApi = kubeclient.makeApiClient(k8s.CustomObjectsApi);

const k8seventApi = kubeclient.makeApiClient(k8s.EventsV1Api);
const k8sapiExtention = kubeclient.makeApiClient(k8s.ApiextensionsV1Api)

// const k8sclient = k8s.KubernetesObjectApi.makeApiClient(kubeclient)
const k8sclient = kubeclient.makeApiClient(k8s.KubernetesObjectApi)

const metricsClient = new k8s.Metrics(kubeclient);

const k8sLog = new k8s.Log(kubeclient);
const k8sExec = new k8s.Exec(kubeclient)

// const watch = new k8s.Watch(kubeclient)

enum Errstatus {
    message = 'Missing Or Misconfigured Params',
    code = 400, // i am sorry here about the code just put it 400
    status = 'Not Found',
    reason = ''
}
enum ErrstatusNs {
    message = 'Namespace does not exist',
    code = 400,
    status = 'Not Found',
    reason = ''
}
            
// Set useQuerystring to true for CoreV1Api
(k8sApi as any).useQuerystring = true; // Casting to any is necessary since the property is not directly exposed

// // caching is possible and i am seeing it not fessible in this work until the next time 

// const path = '/api/v1/namespaces';
// const listN = () => k8sApi.listNamespace();
// const cache = new k8s.ListWatch(path,watch,listN)
// let namespaceList: any;
// const looper = () => {
//     namespaceList = cache.list();
//     setTimeout(looper, 20000);
// };
export class APIHandler {


    public static async handleresourceQuotas(req: Request, res: Response): Promise<void> {
        try {
            const resourceQuotas = await k8sApi.listResourceQuotaForAllNamespaces();

            res.status(200).json(resourceQuotas)
        } catch(err: any ) {
            console.log(`Error retreving namespaces ${err}`);
                                        res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    public static async handleCreateQuotas(req: Request, res: Response): Promise<void> {
        try {
            const createdQuota = await k8sApi.createNamespacedResourceQuota({
                namespace: req.params.namespace,
                body: req.body.quota,
            });
              
            res.status(200).json(createdQuota)
        } catch(err: any ) {
            console.log(`Error retreving namespaces ${err}`);
                                        res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // public static async  handleGetConfig(req: Request, res: Response):Promise<void> {
    //     try {
    //     const config: Config = {
    //       serverTime: Date.now(),
    //       userAgent: getUserAgent(),
    //       version: getVersion(),    
    //     };
      
    //     // res.status(200).json(config);
    //     res.send('Hello world from TypeScript!');

    // } catch(err: any ) {
    //     console.log(`Error retreving namespaces ${err}`);
    //                                 res.status(500).json({
    //                 errors: [{
    //                     ErrStatus:{
    //                         message: err.message,
    //                         code: 500,
    //                         status: 'Internal Server Error',
    //                         reason: ''
    //                     }
    //                 }]
    //             });
    // }
    // }

    /**
     * ClusterRoles  
     */
    // returns a list of ClusterRoles
    // public static async handleGetClusterRoleList(req: Request, res: Response): Promise<void> {
    //     try {
    //         const clusterRoleList: Promise<k8s.V1ClusterRoleList> = await k8sApiRbac.listClusterRole();

    //         // console.log(clusterRoleList);
            
    //         res.status(200).json(clusterRoleList);
    //     } catch (err: any) {
    //         //console.log('Error fetching ClusterRoleList:', error);
    //         //this.handleInternalError(res, error);
    //         res.status(500).send({ error : err.message || 'Internal Server Error'});
    //     }
    // }

    
    /**
     * Namespace
     */
    // returns a list of All Namespaces
    public static async handleGetNamespaces(req: Request, res: Response): Promise<void> {
        try {    
            const namespaceList: k8s.V1NamespaceList = await k8sApi.listNamespace(); 
            
            res.status(200).json(GetNamespaceList(namespaceList));

        } catch(err: any) {
            //console.log(`Error retreving namespaces ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Create a Namespace
    public static async handleCreateNamespace(req: Request, res: Response) {
        try {
            // Parse the namespace specification from the request body
            const namespaceSpec: k8s.CoreV1ApiCreateNamespaceRequest = req.body;

            if (!namespaceSpec || !namespaceSpec.body.metadata || !namespaceSpec.body.metadata?.name) {
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                return;
            }

            const response: any = await k8sApi.createNamespace(namespaceSpec);
            
            res.status(201).send('Success saving '+ namespaceSpec.body.metadata.name+ ' Namespace' + response);
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    /** Return a detail of a naemspace
     * 
     * @param req.params.namespace namespace of the namespace :)
     * @param res 
     * @returns 
     */
    public static async handleGetNamespaceDetail(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params || !req.params.namespace){
                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                return;
            }
            const Namespace_req: k8s.CoreV1ApiReadNamespaceRequest = {name: req.params.namespace};

            const NamespaceDetail = await k8sApi.readNamespace(Namespace_req);
            
            res.status(200).json(GetNamespaceDetail(NamespaceDetail));
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    /** returns a list of Events for Namespace
     * 
     * @param req.params.name Name of the Namespace
     * @param res 
     */
    public static async handleGetNamespaceEvents(req: Request, res: Response): Promise<void> {
        try{
            if (!req.params || !req.params.name ) {
                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.name})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.name}
                const EventList = k8seventApi.listNamespacedEvent(event_req);

                res.status(200).json(await EventList);
            }
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }


    /** Return a Events under a Namespace and in All namespaces
     * 
     * @param req.params.namespace // Optional
     * @param res 
     * @returns 
     */
    public static async handleGetEventList(req: Request, res: Response): Promise<void> {
        try{
            let eventlist: k8s.CoreV1EventList;
            if (req.params.namespace) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                });
                    return;
                }
                const namespace :k8s.CoreV1ApiListNamespacedEventRequest = {namespace: req.params.namespace}
                eventlist =  await k8sApi.listNamespacedEvent(namespace)
            }else {
                const event_req: k8s.CoreV1ApiListEventForAllNamespacesRequest = {}
                eventlist  =  await k8sApi.listEventForAllNamespaces(event_req);
            }

            res.status(200).json(GetEventList(eventlist));

        }catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }
    
    /** Return a Endpoint under a Namespace and in All namespaces
     * 
     * @param req.params.namespace // Optional
     * @param res 
     * @returns 
     */
    public static async handleGetEndpointList(req: Request, res: Response): Promise<void> {
        try{
            let Endpointlist: k8s.V1EndpointsList;
            if (req.params.namespace) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                });
                    return;
                }
                const namespace :k8s.CoreV1ApiListNamespacedEndpointsRequest = {namespace: req.params.namespace}
                Endpointlist =  await k8sApi.listNamespacedEndpoints(namespace)
            }else {
                const Endpoint_req: k8s.CoreV1ApiListEndpointsForAllNamespacesRequest = {}
                Endpointlist  =  await k8sApi.listEndpointsForAllNamespaces(Endpoint_req);
            }

            res.status(200).json(GetEndpointList(Endpointlist));

        }catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    /**
     * ConfigMap
     */
    // Return a list of ConfigMaps from all namespaces and in namespace
    public static async handleGetConfigMapList(req: Request, res: Response): Promise<void> {
        try{
            let configMapListObject: k8s.V1ConfigMapList ;
            if (req.params.namespace){
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                const namespace: k8s.CoreV1ApiListNamespacedConfigMapRequest = {namespace: req.params.namespace};
                configMapListObject = await k8sApi.listNamespacedConfigMap(namespace);
            } else {
                const configMpa_req: k8s.CoreV1ApiListConfigMapForAllNamespacesRequest ={}
                configMapListObject = await  k8sApi.listConfigMapForAllNamespaces(configMpa_req)
            }

            res.status(200).json(GetConfigMapList(configMapListObject))

        } catch(err: any) {
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }
    // Return detail information about configMap for a namespace
    public static async handleGetConfigMapDetail(req: Request, res: Response): Promise<void>{
        try{
            if(!req.params ||!req.params.namespace || !req.params.configmap){
                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const NamespacedConfigmap : k8s.CoreV1ApiReadNamespacedConfigMapRequest = {namespace: req.params.namespace, name: req.params.configmap}
                const configmapDetail = await k8sApi.readNamespacedConfigMap(NamespacedConfigmap);

                res.status(200).json((GetConfigMapDetail(configmapDetail)));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).json({
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
            });
        }
    }

    /**
     * Pod
     */
    // Return a list of Pods from all namespaces or namespaced
    public static async handleGetPods(req: Request, res: Response): Promise<void> {
        // if you see an error on this route plz enable metric in you config it depend what you are using 
        // i am using minikube 
        try{
            let PodListObject: k8s.PodStatus[] ;
            // let podList: PodList
            if (req.params.namespace){
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                // const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace};
                // PodListObject = await k8sApi.listNamespacedPod(Pod_req);
                PodListObject = await k8s.topPods(k8sApi, metricsClient, req.params.namespace);
            } else {
                // const pod_req: k8s.CoreV1ApiListPodForAllNamespacesRequest ={}
                // PodListObject = await k8sApi.listPodForAllNamespaces(pod_req)
                PodListObject = await k8s.topPods(k8sApi, metricsClient);
            }

            res.status(200).json(GetPodList(PodListObject));

        } catch(err: any) {
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }
    /*public static async handleGetPods(req: Request, res: Response): Promise<void> {
        try{
            let PodListObject: k8s.V1PodList ;
            if (req.params.namespace){
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace};
                PodListObject = await k8sApi.listNamespacedPod(Pod_req);
            } else {
                const pod_req: k8s.CoreV1ApiListPodForAllNamespacesRequest ={}
                PodListObject = await k8sApi.listPodForAllNamespaces(pod_req)
            }

            res.status(200).json(GetPodList(PodListObject));

        } catch(err: any) {
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }*/
        
        // Return a list of container for a Pod
        public static async handleGetPodContainers(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.pod) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const namespacedPod: k8s.CoreV1ApiReadNamespacedPodRequest = {namespace: req.params.namespace, name: req.params.pod}
                    const podDetail = k8sApi.readNamespacedPod(namespacedPod);
    
                    const containerNameList: string[] = (await podDetail).spec?.containers.map((container) => {
                        return container.name;
                    }) || [''];
                    const podContainerList : PodContainerList = {
                        containers: containerNameList
                    }
    
                    res.status(200).json(podContainerList);
                }
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }
    
    // Return Detailed information about Pod
    public static async handleGetPodDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: Errstatus
                })
            } else {
                const namespacedPod: k8s.CoreV1ApiReadNamespacedPodRequest = {namespace: req.params.namespace, name: req.params.pod}
                const podDetail = await k8sApi.readNamespacedPod(namespacedPod);
                
                res.status(200).json(GetPodDetail(podDetail));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).json(               
                {
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                }
            );
        }
    }

    // Return a list of Event for Pod
    public static async handleGetPodEvents(req: Request,res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.pod},involvedObject.kind=Pod` }
                console.log('event_Req', event_req)
                const EventList = k8sApi.listNamespacedEvent(event_req);
                console.log('Eventlist ' , EventList)
                res.status(200).json(await EventList);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }


    // Return list of pvcName in a specific Pod 
    public static async handleGetPodPersistentVolumeClaims(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const pod_req: k8s.CoreV1ApiReadNamespacedPodRequest = {namespace: req.params.namespace, name:req.params.pod};
                const podDetail = k8sApi.readNamespacedPod(pod_req);

                // pvcName filter the resource from the local machine this will not work in external storage or with the cloud but can be changed easly
                // const pvcName: string[] = (await podDetail).spec?.volumes?.filter(volume => volume.persistentVolumeClaim)
                // .map(volume => volume.persistentVolumeClaim?.claimName || '') || [''];

                res.status(200).json(await podDetail);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    /** Handles exec into pod
     * 
     * @param req.namespace namespace of the Pod
     * @param req.pod name of the Pod
     * @param req.container name of container in the Pod
    * @param res 
     */
    public static async handleExecShell(req: Request, res: Response):Promise<void> {
        try{
            // if (!req.params || !req.params.namespace || !req.params.pod || !req.params.container  ) {
            //     res.status(400).json(
            //         {
            //             errors: [{
            //                 ErrStatus: Errstatus
            //             }]
            //         }
            //     );
            // }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
            //     res.status(404).json({
            //         errors: [{
            //             ErrStatus: ErrstatusNs
            //         }]
            //     })
            // } else {
            //     const server = http.createServer()
                
            //     const ws = new WebSocketServer({ server: server });

            //     ws.on('connection', async (socket: WebSocket) => {


            //         const stdinStream = new stream.PassThrough();
            //         const stdoutStream = new stream.PassThrough();


            //         // Forward kube stdout/stderr to websocket
            //         stdoutStream.on('data', (chunk) => {
            //             socket.send(chunk.toString());
            //         });

            //         // Forward browser data to kube stdin
            //         ws.on('message', (data) => {
            //             stdinStream.write(data);
            //         });

            //         ws.on('close', () => {
            //             stdinStream.end();
            //             stdoutStream.end();
            //         });

            //         try {
            //             await k8sExec.exec(
            //                 req.params.namespace,
            //                 req.params.pod,
            //                 req.params.container,
            //                 req.params.command || ['/bin/bash', '-l'],
            //                 stdoutStream,
            //                 stdoutStream, // merge stderr with stdout
            //                 stdinStream,
            //                 true
            //             );
            //         } catch (err) {
            //             socket.send('Error: ' + (err as Error).message);
            //             socket.close();
            //         }
            //     });

            // }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Services from all namespaces and specific namespace
    public static async handleGetServiceList(req: Request, res: Response):Promise<void> {
        try{
            let ServiceListObject: k8s.V1ServiceList ;
            if (req.params.namespace){
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                const namespace: k8s.CoreV1ApiListNamespacedServiceRequest = {namespace: req.params.namespace};
                ServiceListObject = await k8sApi.listNamespacedService(namespace);
            } else {
                const service_req: k8s.CoreV1ApiListServiceForAllNamespacesRequest ={}
                ServiceListObject = await k8sApi.listServiceForAllNamespaces(service_req)
            }

            res.status(200).json(GetServiceList(ServiceListObject));

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about Service
    public static async handleGetServiceDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const namespacedService: k8s.CoreV1ApiReadNamespacedServiceRequest = {namespace: req.params.namespace, name: req.params.service}
                const ServiceDetail = await k8sApi.readNamespacedService(namespacedService);
                
                res.status(200).json(GetServiceDetail(ServiceDetail));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Events for Service
    public static async handleGetServiceEvent(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const resources: k8s.CoreV1ApiListNamespacedEventRequest = {namespace: req.params.namespace, fieldSelector: `involvedObject.name=${req.params.service}`};
                const ServiceEvent = k8sApi.listNamespacedEvent(resources);
                
                res.status(200).send((await ServiceEvent))
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Pods for Service
    public static async handleGetServicePods(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const Service_req: k8s.CoreV1ApiReadNamespacedServiceRequest = {namespace: req.params.namespace, name: req.params.service}
                const Service = k8sApi.readNamespacedService(Service_req)

                const Service_selector = (await Service).spec?.selector || {}
                
                if(!Service_selector){
                    res.status(424).send('Missing field in internal specification')
                    return 
                }

                const labelSelector = Object.entries(Service_selector).map(([key,value]) => `${key}=${value}`).join(',')

                const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace, labelSelector: labelSelector}
                const PodList = k8sApi.listNamespacedPod(Pod_req)

                res.status(200).json(PodList)
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Ingresses for Service
    public static async handleGetServiceIngressList(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const Ingress_req: k8s.NetworkingV1ApiListNamespacedIngressRequest = {namespace: req.params.namespace}
                const IngressList = k8snetworkingApi.listNamespacedIngress(Ingress_req)

                const Ingress_matched = (await IngressList).items.filter((Ingress) => {
                    return Ingress.spec?.rules?.some(rule => {
                        rule.http?.paths.some(path => {
                            path.backend.service?.name === req.params.service
                        })
                    })
                });

                res.status(200).json(Ingress_matched)
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Secrets from all namespaces Or specified namespace
    public static async handleGetSecretList(req: Request, res: Response):Promise<void> {
        try{
            let SecretListObject: k8s.V1SecretList;
            if (req.params.namespace){
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                const namespace: k8s.CoreV1ApiListNamespacedSecretRequest = {namespace: req.params.namespace};
                SecretListObject = await k8sApi.listNamespacedSecret(namespace);
            } else {
                const secret_req: k8s.CoreV1ApiListSecretForAllNamespacesRequest ={}
                SecretListObject = await  k8sApi.listServiceForAllNamespaces(secret_req)
            }

            res.status(200).json(GetSecretList(SecretListObject));
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about Secret
    public static async handleGetSecretDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.name) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const namespacedSecret: k8s.CoreV1ApiReadNamespacedSecretRequest = {namespace: req.params.namespace, name: req.params.name}
                const ServiceDetail = await k8sApi.readNamespacedSecret(namespacedSecret);
                
                res.status(200).json(GetServiceDetail(ServiceDetail));
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Stores ImagePullSecret in a Kubernetes Secret
    public static async handleCreateImagePullSecret(req: Request, res: Response):Promise<void> {
        try{
            // Not Imp
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Nodes 
    public static async handleGetNodeList(req: Request, res: Response):Promise<void> {
        try{
            // const node_req: k8s.CoreV1ApiListNodeRequest = {}
            // const NodeListObj: k8s.V1NodeList = await k8sApi.listNode(node_req);
            const NodeListObj: k8s.NodeStatus[] = await k8s.topNodes(k8sApi);

            res.status(200).json(GetNodeList(NodeListObj))
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about Node
    public static async handleGetNodeDetail(req: Request, res: Response):Promise<void> {
        try{
            if(!req.params || !req.params.name){
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                return;
            } else {
                const node_req: k8s.CoreV1ApiReadNodeRequest = {name: req.params.name}
                const NodeObj = await k8sApi.readNode(node_req); 

                res.status(200).json(GetNodeDetail(NodeObj));
                return;
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Events for Node
    public static async handleGetNodeEvents(req: Request, res: Response):Promise<void> {
        try{
            if(!req.params || !req.params.name){
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            } else {
                const event_req: k8s.CoreV1ApiListEventForAllNamespacesRequest = {fieldSelector:`involvedObject.kind=Node,involvedObject.name=${req.params.name}`}
                
                const NodeEvents = await k8sApi.listEventForAllNamespaces(event_req);
                
                res.status(200).json(NodeEvents);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Pods for Node
    public static async handleGetNodePods(req: Request, res: Response):Promise<void> {
        try{
            if(!req.params || !req.params.name){
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            } else {
                const pod_req: k8s.CoreV1ApiListPodForAllNamespacesRequest = {fieldSelector:`involvedObject.kind=Node,involvedObject.name=${req.params.name}`}
                
                const NodePods = await k8sApi.listPodForAllNamespaces(pod_req);
                
                res.status(200).json(NodePods);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Drains Node
    public static async handleNodeDrain(req: Request, res: Response):Promise<void> {
        try{
            // Not Imp
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Roles from all namespace or specified namespace
    public static async handleGetRoleList(req: Request, res: Response):Promise<void> {
        try{
            let Rolesobj: k8s.V1RoleList;

            if (req.params.namespace ) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }

                const role_req: k8s.RbacAuthorizationV1ApiListNamespacedRoleRequest = {namespace: req.params.namespace}
                Rolesobj = await k8sApiRbac.listNamespacedRole(role_req)

            } else {
                Rolesobj = await k8sApiRbac.listRoleForAllNamespaces({});
            }

            res.status(200).json(GetRoleList(Rolesobj));
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about Role
    public static async handleGetRoleDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.name) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const role_req: k8s.RbacAuthorizationV1ApiReadNamespacedRoleRequest = {namespace: req.params.namespace, name: req.params.name}
                const RoleObj = await k8sApiRbac.readNamespacedRole(role_req);

                res.status(200).json(GetRoleDetail(RoleObj));
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }


        // Returns a list of RoleBindings from all namespace or specified namespace
    public static async handleGetRoleBindingList(req: Request, res: Response):Promise<void> {
        try{
            let RoleBindingsobj: k8s.V1RoleBindingList;

            if (req.params.namespace ) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }

                const rolebinding_req: k8s.RbacAuthorizationV1ApiListNamespacedRoleBindingRequest = {namespace: req.params.namespace}
                RoleBindingsobj = await k8sApiRbac.listNamespacedRoleBinding(rolebinding_req)

            } else {
                RoleBindingsobj = await k8sApiRbac.listRoleBindingForAllNamespaces({});
            }

            res.status(200).json(GetRoleBindingList(RoleBindingsobj));
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about RoleBinding
    public static async handleGetRoleBindingDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.name) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const rolebinding_req: k8s.RbacAuthorizationV1ApiReadNamespacedRoleBindingRequest = {namespace: req.params.namespace, name: req.params.name}
                const RoleBindingObj = await k8sApiRbac.readNamespacedRoleBinding(rolebinding_req);

                res.status(200).json(GetRoleBindingDetail(RoleBindingObj));
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of ServiceAccounts from all namespaces or specified namespace
    public static async handleGetServiceAccountList(req: Request, res: Response):Promise<void> {
        try{
            let ServiceAccountObj: k8s.V1ServiceAccountList;
            if (req.params.namespace ) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                }
                const serviceAccount_req : k8s.CoreV1ApiListNamespacedServiceAccountRequest = {namespace: req.params.namespace}
                ServiceAccountObj = await k8sApi.listNamespacedServiceAccount( serviceAccount_req) 

            } else {
                ServiceAccountObj = await k8sApi.listServiceAccountForAllNamespaces({}) 
            }

            res.status(200).json(GetServiceAccountList(ServiceAccountObj))
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
        }
    }

    // Returns detailed information about ServiceAccount
    public static async handleGetServiceAccountDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.serviceaccount) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = await k8sApi.readNamespacedServiceAccount(serviceaccount_req);

                res.status(200).json(GetServiceAccountDetail(ServiceAccountObj));
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of Secrets for ServiceAccount
    public static async handleGetServiceAccountSecrets(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.serviceaccount) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = k8sApi.readNamespacedServiceAccount(serviceaccount_req);
                
                // list of secrets
                res.status(200).json( (await ServiceAccountObj).secrets);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

    // Returns a list of ImagePullSecret Secrets for ServiceAccount
    public static async handleGetServiceAccountImagePullSecrets(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.serviceaccount) {
                                res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = k8sApi.readNamespacedServiceAccount(serviceaccount_req);

                // list of imagePullSecret
                res.status(200).json( (await ServiceAccountObj).imagePullSecrets);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
                            res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
        }
    }

        // Returns a list of StorageClasses
        public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
            try{
                const StorageClassList = await k8sStorageApi.listStorageClass({});

                res.status(200).json(GetStorageClassList(StorageClassList));
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        }

        // Returns detailed information about StorageClass
        public static async handleGetStorageClass(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                } else {
                    const StorageClass_req: k8s.StorageV1ApiReadStorageClassRequest = {name: req.params.name}
                    const StorageClass = k8sStorageApi.readStorageClass(StorageClass_req);

                    res.status(200).json(StorageClass);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of PersistentVolumes assigned to StorageClass
        public static async handleGetStorageClassPersistentVolumes(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of ClusterRoles
        public static async handleGetClusterRoleList(req: Request, res: Response):Promise<void> {
            try{

                const ClusterRoleList = await k8sApiRbac.listClusterRole({})


                res.status(200).json(GetClusterRoleList(ClusterRoleList));
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        }

        // Returns detailed information about ClusterRole
        public static async handleGetClusterRoleDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.name) {
                    res.status(400).json(Errstatus);
                } else {
                    const ClusterRole_req: k8s.RbacAuthorizationV1ApiReadClusterRoleRequest = {name: req.params.name}
                    const clusterRoleDetail = await k8sApiRbac.readClusterRole(ClusterRole_req);

                    res.status(200).json(GetClusterRoleDetail(clusterRoleDetail))
                }

            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).json(               
                    {
                        errors: [{
                            ErrStatus:{
                                message: err.message,
                                code: 500,
                                status: 'Internal Server Error',
                                reason: ''
                            }
                        }]
                    }
                );
            }
        }

        // Returns a list of ClusterRoleBindings
        public static async handleGetClusterRoleBindingList(req: Request, res: Response):Promise<void> {
            try{
                const ClusterRoleBindingList = await k8sApiRbac.listClusterRoleBinding({})

                res.status(200).json(GetRoleBindingList(ClusterRoleBindingList));
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        }

        // Returns detailed information about ClusterRoleBinding
        public static async handleGetClusterRoleBindingDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.name) {
                    res.status(400).json({
                        errors: Errstatus
                    });
                } else {
                    const ClusterRoleBinding_req: k8s.RbacAuthorizationV1ApiReadClusterRoleBindingRequest = {name: req.params.name}
                    const ClusterRoleBindingDetail = await k8sApiRbac.readClusterRoleBinding(ClusterRoleBinding_req);

                    res.status(200).json(GetClusterRoleBindingDetail(ClusterRoleBindingDetail))
                }
            } catch(err: any){
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of CronJobs from all namespaces or specified namespace
        public static async handleGetCronJobList(req: Request, res: Response):Promise<void> {
            try{
                let CronjobList: k8s.V1CronJobList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const CronJob_req: k8s.BatchV1ApiListNamespacedCronJobRequest = {namespace: req.params.namespace}
                    CronjobList = await k8sbatchApi.listNamespacedCronJob(CronJob_req);


                } else {
                    CronjobList = await k8sbatchApi.listCronJobForAllNamespaces({});
                }                
                res.status(200).json(GetCronJobList(CronjobList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
                   // {error: err.message || 'Internal Server Error'});
            }
        }

        /** Returns detailed information about CronJob
         * 
         * @param req.params.namespace namespace of the CronJob
         * @param req.params.name name of the Cronjob
         * @param res 
         */
        public static async handleGetCronJobDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Cronjob_req: k8s.BatchV1ApiReadNamespacedCronJobRequest = {namespace: req.params.namespace, name: req.params.name};
                    const CronJobDetail = await k8sbatchApi.readNamespacedCronJob(Cronjob_req);

                    res.status(200).json(GetCronJobDetail(CronJobDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of Jobs for CronJob
        public static async handleGetCronJobJobs(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const CronJob_req: k8s.BatchV1ApiListNamespacedJobRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=CronJob` }
                    const CronJob_list = k8sbatchApi.listNamespacedJob(CronJob_req);

                    res.status(200).json(CronJob_list);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of Events for CronJob
        public static async handleGetCronJobEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=CronJob` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Triggers a Job based on CronJob
        public static async handleTriggerCronJob(req: Request, res: Response):Promise<void> {
            // name: name of the CronJob
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Result = await triggerCronJob(kubeclient, req.params.namespace, req.params.name);
                    
                    if (Result){
                        // If an error was returned
                        res.status(500).send({ error: Result.message || 'Failed to trigger CronJob' });
                    } else {
                        // Success
                        res.status(200).send({ message: 'Job triggered successfully for CronJob' });
                    }
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        // Returns a list of Jobs from all namespaces or specified namespace
        public static async handleGetJobList(req: Request, res: Response):Promise<void> {
            try{
                let JobList: k8s.V1JobList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const Job_req: k8s.BatchV1ApiListNamespacedJobRequest = {namespace: req.params.namespace}
                    JobList = await k8sbatchApi.listNamespacedJob(Job_req);

                } else {
                    JobList = await k8sbatchApi.listJobForAllNamespaces({});
                }
                
                res.status(200).json(GetJobList(JobList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        /** Returns detailed information about Job
         * 
         * @param req.params.namespace namespace of the Job
         * @param req.params.name name of the Job
         * @param res 
         */
        public static async handleGetJobDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Job_req: k8s.BatchV1ApiReadNamespacedJobRequest = {namespace: req.params.namespace, name: req.params.name}
                    const JobDetail = await k8sbatchApi.readNamespacedJob(Job_req)

                    res.status(200).json(GetJobDetail(JobDetail));
                }    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Pods for Job
        public static async handleGetJobPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Pod_Job_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace, fieldSelector:`metadata.ownerReferences.name=${req.params.name}`}
                    const Pod_Job_list = k8sApi.listNamespacedPod(Pod_Job_req) 

                    // const Pods_List: string[] = (await Pod_Job_list).items.map((Pod) => {
                    //     return Pod.metadata?.name || '';
                    // })

                    res.status(200).json(await Pod_Job_list)
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Events for Job
        public static async handleGetJobEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=Job` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of DaemonSets from all namespaces or specified namespace
        public static async handleGetDaemonSetList(req: Request, res: Response):Promise<void> {
            try{
                let DaemonSetList: k8s.V1DaemonSetList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const DaemonSet_req: k8s.AppsV1ApiListNamespacedDaemonSetRequest = {namespace: req.params.namespace}
                    DaemonSetList = await k8sAppApi.listNamespacedDaemonSet(DaemonSet_req)

                } else {
                    DaemonSetList = await k8sAppApi.listDaemonSetForAllNamespaces({});
                }
                
                res.status(200).json(GetDaemonSetList(DaemonSetList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
            
        } 

        // Returns detailed information about DaemonSet
        public static async handleGetDaemonSetDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const DaemonSet_req: k8s.AppsV1ApiReadNamespacedDaemonSetRequest = {namespace: req.params.namespace, name: req.params.daemonSet};
                    const DaemonSetDetail = await k8sAppApi.readNamespacedDaemonSet(DaemonSet_req);

                    res.status(200).json(GetDaemonSetDetail(DaemonSetDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Pods for DaemonSet
        public static async handleGetDaemonSetPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const DaemonSet_req: k8s.AppsV1ApiReadNamespacedDaemonSetRequest = {namespace: req.params.namespace, name: req.params.daemonSet}
                    const DaemonSet = k8sAppApi.readNamespacedDaemonSet(DaemonSet_req)

                    // Convert the label selector object to a query string
                    const labelSelector = (await DaemonSet).spec?.selector.matchLabels

                    if(!labelSelector) {
                        res.status(400).send('No labelSelector found in the DaemonSet');
                        return;
                    }

                    const labelSelectorString = Object.entries(labelSelector)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(',');
                    
                    const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace, fieldSelector:labelSelectorString}

                    const Pods = k8sApi.listNamespacedPod(Pod_req)
                                   
                    // const Pods_List: string[] = (await Pods).items.map((Pod) => {
                    //     return Pod.metadata?.name || ''
                    // }) 
                
                    res.status(200).json(await Pods);
                }                
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Services for DaemonSet
        public static async handleGetDaemonSetServices(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const DaemonSet_req: k8s.AppsV1ApiReadNamespacedDaemonSetRequest = {namespace: req.params.namespace, name: req.params.daemonSet}
                    const DaemonSet = k8sAppApi.readNamespacedDaemonSet(DaemonSet_req)

                    // Convert the label selector object to a query string
                    const labelSelector = (await DaemonSet).spec?.selector.matchLabels

                    if(!labelSelector) {
                        res.status(400).send('No labelSelector found in the DaemonSet');
                        return;
                    }

                    const labelSelectorString = Object.entries(labelSelector)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(',');
                    
                    const Service_req: k8s.CoreV1ApiListNamespacedServiceRequest = {namespace: req.params.namespace, fieldSelector:labelSelectorString}

                    const Services = k8sApi.listNamespacedService(Service_req)
                                   
                    // const Services_List: string[] = (await Services).items.map((Service) => {
                    //     return Service.metadata?.name || ''
                    // }) 
                
                    res.status(200).json(await Services);
                }  
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Events for DaemonSet
        public static async handleGetDaemonSetEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.daemonSet},involvedObject.kind=DaemonSet` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Rollout restart of the Daemon Set
        public static async handleDaemonSetRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Deployments from all namespaces or specified namespace
        public static async handleGetDeployments(req: Request, res: Response):Promise<void> {
            try{
                let DeploymentList: k8s.V1DeploymentList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const Deployment_req: k8s.AppsV1ApiListNamespacedDeploymentRequest = {namespace: req.params.namespace}
                    DeploymentList = await k8sAppApi.listNamespacedDeployment(Deployment_req)

                } else {
                    DeploymentList = await k8sAppApi.listDeploymentForAllNamespaces({});
                }

                
                res.status(200).json(GetDeploymentList(DeploymentList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        /** Returns detailed information about Deployment
         * 
         * @param req.params.namespace namespace of the Deployment
         * @param req.params.name name of the Deployment
         * @param res 
         */
        public static async handleGetDeploymentDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Deployment_req: k8s.AppsV1ApiReadNamespacedDeploymentRequest = {namespace: req.params.namespace, name: req.params.deployment};
                    const DeploymentDetail = await k8sAppApi.readNamespacedDeployment(Deployment_req);

                    res.status(200).json(GetDeploymentDetail(DeploymentDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Events for Deployment
        public static async handleGetDeploymentEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.deployment},involvedObject.kind=Deployment` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of old ReplicaSets for Deployment
        public static async handleGetDeploymentOldReplicaSets(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Deployment_req: k8s.AppsV1ApiReadNamespacedDeploymentRequest = {namespace: req.params.namespace, name: req.params.deployment};
                    const Deployment = k8sAppApi.readNamespacedDeployment(Deployment_req);

                    const DeploymentUid = (await Deployment).metadata?.uid;
                    const labelSelector = (await Deployment).spec?.selector.matchLabels;
                    const templateLabels = (await Deployment).spec?.template.metadata?.labels

                    if (!DeploymentUid || !labelSelector || !templateLabels) {
                        res.status(400).send('No Deployment uid or labelSelector  or TemplateLabel Found')
                        return
                    }
                    
                    // Convert the label selector object to a query string
                    const labelSelectorString = Object.entries(labelSelector)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(',')

                    const ReplicaSet_req: k8s.AppsV1ApiListNamespacedReplicaSetRequest = {namespace: req.params.namespace, labelSelector: labelSelectorString}
                    const ReplicaSet = k8sAppApi.listNamespacedReplicaSet(ReplicaSet_req)

                    // Filter ReplicaSets owned by the Deployment
                    const NewReplicaSet = (await ReplicaSet).items.filter(rs => 
                        rs.metadata?.ownerReferences?.some(
                            ownerref => ownerref.uid === DeploymentUid && ownerref.kind === 'Deployment'
                        )&&
                        Object.entries(templateLabels).every(([key, value]) => rs.spec?.template?.metadata?.labels?.[key] === value)
                    );

                    if(!NewReplicaSet) {
                        res.status(404).send('No new ReplicaSet found for the Deployment')
                        return 
                    }

                    // Filter out the "new ReplicaSet" to get the old ReplicaSets
                    const OldReplicaSets = (await ReplicaSet).items.filter(rs =>
                        NewReplicaSet.some(Replica => Replica.metadata?.uid !== rs.metadata?.uid)&&
                        rs.metadata?.ownerReferences?.some(
                            ownerRef => ownerRef.uid === DeploymentUid && ownerRef.kind === 'Deployment'
                        )
                    );

                    res.status(200).send(OldReplicaSets);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of new ReplicaSets for Deployment
        public static async handleGetDeploymentNewReplicaSet(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Deployment_req: k8s.AppsV1ApiReadNamespacedDeploymentRequest = {namespace: req.params.namespace, name: req.params.deployment};
                    const Deployment = k8sAppApi.readNamespacedDeployment(Deployment_req);

                    const DeploymentUid = (await Deployment).metadata?.uid;
                    const labelSelector = (await Deployment).spec?.selector.matchLabels;

                    if (!DeploymentUid || !labelSelector) {
                        res.status(400).send('No Deployment uid or labelSelector Found')
                        return
                    }
                    
                    // Convert the label selector object to a query string
                    const labelSelectorString = Object.entries(labelSelector)
                        .map(([key, value]) => `${key}=${value}`)
                        .join(',')

                    const ReplicaSet_req: k8s.AppsV1ApiListNamespacedReplicaSetRequest = {namespace: req.params.namespace, labelSelector: labelSelectorString}
                    const ReplicaSet = k8sAppApi.listNamespacedReplicaSet(ReplicaSet_req)

                    // Filter ReplicaSets owned by the Deployment
                    const NewReplicaSet = (await ReplicaSet).items.filter(rs => 
                        rs.metadata?.ownerReferences?.some(
                            ownerref => ownerref.uid === DeploymentUid && ownerref.kind === 'Deployment'
                        )
                    );

                    res.status(200).send(NewReplicaSet);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Pauses the Deployment
        public static async handleDeploymentPause(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Rolls back the Deployment to the target revision
        public static async handleDeploymentRollback(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Rollout restart of the Deployment
        public static async handleDeploymentRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Resumes the Deployment
        public static async handleDeploymentResume(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of HorizontalPodAutoscalers from all namespaces or Specified namespace
        public static async handleGetHorizontalPodAutoscalerList(req: Request, res: Response):Promise<void> {
            try{
                let HorizontalPodAutoscalerList: k8s.V1HorizontalPodAutoscalerList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){

                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const HorizontalPodAutoscaler_req: k8s.AutoscalingV1ApiListNamespacedHorizontalPodAutoscalerRequest = {namespace: req.params.namespace}
                    HorizontalPodAutoscalerList = await k8sautoscalingApi.listNamespacedHorizontalPodAutoscaler(HorizontalPodAutoscaler_req);

                } else {
                    HorizontalPodAutoscalerList = await k8sautoscalingApi.listHorizontalPodAutoscalerForAllNamespaces({});
                }

                // const HorizontalPodAutoscalers: String[] = (await HorizontalPodAutoscalerList).items.map((HorizontalPodAutoscaler) => {
                //     return HorizontalPodAutoscaler.metadata?.name || ''
                // })
                
                res.status(200).json(GetHorizontalPodAutoscalerList(HorizontalPodAutoscalerList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        /** Returns detailed information about HorizontalPodAutoscaler
         * 
         * @param req.params.horizontalpodautoscaler name of the HorizontalPodAutoscaler
         * @param res REST Response 
         */
        public static async handleGetHorizontalPodAutoscalerDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.horizontalpodautoscaler) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const HorizontalPodAutoscaler_req: k8s.AutoscalingV1ApiReadNamespacedHorizontalPodAutoscalerRequest = {namespace: req.params.namespace, name: req.params.horizontalpodautoscaler};
                    const HorizontalPodAutoscalerDetail = await k8sautoscalingApi.readNamespacedHorizontalPodAutoscaler(HorizontalPodAutoscaler_req);

                    res.status(200).json(GetHorizontalPodAutoscalerDetail(HorizontalPodAutoscalerDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        /** Returns a list of HorizontalPodAutoscalers for resource
         * 
         * @param req.params.kind kind of the resource to get HorizontalPodAutoscalers for
         * @param req.params.namespace namespace of the resource to get HorizontalPodAutoscalers for
         * @param req.params.name name of the resource to get HorizontalPodAutoscalers for
         * @param res REST Response
         */
        public static async handleGetHorizontalPodAutoscalerListForResource(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.horizontalpodautoscaler || !req.params.kind) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const HorizontalPodAutoscaler_req: k8s.AutoscalingV1ApiListNamespacedHorizontalPodAutoscalerRequest = {namespace: req.params.namespace}
                    const HorizontalPodAutoscalerList = k8sautoscalingApi.listNamespacedHorizontalPodAutoscaler(HorizontalPodAutoscaler_req);

                    const HorizontalPodAutoscalerList_resources = (await HorizontalPodAutoscalerList).items.filter((HorizontalPodAutoscaler) => {
                        return HorizontalPodAutoscaler.spec?.scaleTargetRef.name === req.params.name && HorizontalPodAutoscaler.spec?.scaleTargetRef.kind === req.params.kind
                    })

                    res.status(200).json(HorizontalPodAutoscalerList_resources)
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        /** Returns a list of Ingresses from all namespaces or specified namespace
         * 
         */
        public static async handleGetIngressList(req: Request, res: Response):Promise<void> {
            try{
                let IngressList: k8s.V1IngressList ;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){

                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const Ingress_req: k8s.NetworkingV1ApiListNamespacedIngressRequest = {namespace: req.params.namespace}
                    IngressList = await k8snetworkingApi.listNamespacedIngress(Ingress_req)

                } else {
                    IngressList = await k8snetworkingApi.listIngressForAllNamespaces({});
                }

                // const Ingresss: String[] = (await IngressList).items.map((Ingress) => {
                //     return Ingress.metadata?.name || ''
                // })
                
                res.status(200).json(GetIngressList(IngressList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        /** Returns detailed information about Ingress
         * 
         * @param req.params.namespace namespace of the Ingress
         * @param req.params.name name of the Ingress
         * @param res 
         */
        public static async handleGetIngressDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const Ingress_req: k8s.NetworkingV1ApiReadNamespacedIngressRequest = {namespace: req.params.namespace, name: req.params.name};
                    const IngressDetail = await k8snetworkingApi.readNamespacedIngress(Ingress_req);

                    res.status(200).json(GetIngressDetail(IngressDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Events for Ingress
        public static async handleGetIngressEvent(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.ingress) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.ingress},involvedObject.kind=Ingress` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of IngressClasses
        public static async handleGetIngressClassList(req: Request, res: Response):Promise<void> {
            try{
                const IngressClassList: k8s.V1IngressClassList = await k8snetworkingApi.listIngressClass();


                res.status(200).json(GetIngressClassList(IngressClassList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // Returns detailed information about IngressClass
        public static async handleGetIngressClass(req: Request, res: Response):Promise<void> {
            try{                
                if (!req.params || !req.params.ingressclass) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else {
                    const IngressClass_req: k8s.NetworkingV1ApiReadIngressClassRequest = {name: req.params.ingressclass};
                    const IngressClassDetail = k8snetworkingApi.readIngressClass(IngressClass_req);

                    res.status(200).json(IngressClassDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of NetworkPolicies for all namespaces or specified namespace
        public static async handleGetNetworkPolicyList(req: Request, res: Response):Promise<void> {
            try{
                let NetworkingPolicieList: k8s.V1NetworkPolicyList;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const NetworkingPolicie_req: k8s.NetworkingV1ApiListNamespacedNetworkPolicyRequest = {namespace: req.params.namespace}
                    NetworkingPolicieList = await k8snetworkingApi.listNamespacedNetworkPolicy(NetworkingPolicie_req)
                } else {
                    NetworkingPolicieList = await k8snetworkingApi.listNetworkPolicyForAllNamespaces();
                }
                
                res.status(200).json(GetNetworkPolicyList(NetworkingPolicieList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)

            }
        } 

        // Returns detailed information about NetworkPolicy
        public static async handleGetNetworkPolicyDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params|| !req.params.namespace || !req.params.networkpolicy) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                 }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                        res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                     
                 } else {
                    const NetworkingPolicie_req: k8s.NetworkingV1ApiReadNamespacedNetworkPolicyRequest = {namespace: req.params.namespace, name: req.params.networkpolicy};
                    const NetworkingPolicieDetail = await k8snetworkingApi.readNamespacedNetworkPolicy(NetworkingPolicie_req);

                    res.status(200).json(GetNetworkPolicyDetail(NetworkingPolicieDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of PersistentVolumes 
        public static async handleGetPersistentVolumeList(req: Request, res: Response):Promise<void> {
            try{                    
                const PersistentVolumeList = await k8sApi.listPersistentVolume(); 
                
                res.status(200).json(GetPersistentVolumeList(PersistentVolumeList));

            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // Returns detailed information about PersistentVolume
        public static async handleGetPersistentVolumeDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.persistentvolume) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                } else {
                    const PersistentVolume_req: k8s.CoreV1ApiReadPersistentVolumeRequest = { name: req.params.persistentvolume};
                    const persistentvolumeDetail = await k8sApi.readPersistentVolume(PersistentVolume_req);

                    res.status(200).json(GetPersistentVolumeDetail(persistentvolumeDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 


        // Returns a list of PersistentVolumeClaim for all namespaces or specified namespace
        public static async handleGetPersistentVolumeClaimList(req: Request, res: Response):Promise<void> {
            try{
                let PersistentVolumeClaimList: k8s.V1PersistentVolumeClaimList;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const PersistentVolumeClaim_req: k8s.CoreV1ApiListNamespacedPersistentVolumeClaimRequest = {namespace: req.params.namespace}
                    PersistentVolumeClaimList = await k8sApi.listNamespacedPersistentVolumeClaim(PersistentVolumeClaim_req)
                } else {
                    PersistentVolumeClaimList = await k8sApi.listPersistentVolumeClaimForAllNamespaces();
                }

                res.status(200).json(GetPersistentVolumeClaimList(PersistentVolumeClaimList))
                
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // Returns detailed information about PersistentVolumeClaim
        public static async handleGetPersistentVolumeClaimDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const PersistentVolumeClaim_req: k8s.CoreV1ApiReadNamespacedPersistentVolumeClaimRequest = {namespace: req.params.namespace, name: req.params.name};
                    const persistentvolumeclaimDetail = await k8sApi.readNamespacedPersistentVolumeClaim(PersistentVolumeClaim_req);

                    res.status(200).json(GetPersistentVolumeClaimDetail(persistentvolumeclaimDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of ReplicaSets from all namespaces or specified namespace
        public static async handleGetReplicaSets(req: Request, res: Response):Promise<void> {
            try{
                let ReplicaSetList: k8s.V1ReplicaSetList;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const ReplicaSet_req: k8s.AppsV1ApiListNamespacedReplicaSetRequest = {namespace: req.params.namespace}
                    ReplicaSetList = await k8sAppApi.listNamespacedReplicaSet(ReplicaSet_req)
                } else {
                    ReplicaSetList = await k8sAppApi.listReplicaSetForAllNamespaces();
                }

                res.status(200).json(GetReplicaSetList(ReplicaSetList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // Returns detailed information about ReplicaSet
        public static async handleGetReplicaSetDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicaSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const ReplicaSet_req: k8s.AppsV1ApiReadNamespacedReplicaSetRequest = {namespace: req.params.namespace, name: req.params.replicaSet};
                    const ReplicaSetDetail = await k8sAppApi.readNamespacedReplicaSet(ReplicaSet_req);

                    res.status(200).json(GetReplicaSetDetail(ReplicaSetDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // Returns a list of Pods for ReplicaSet
        public static async handleGetReplicaSetPods(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 


        // Returns a list of Services for ReplicaSet
        public static async handleGetReplicaSetServices(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Events for ReplicaSet
        public static async handleGetReplicaSetEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicaSet) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.replicaSet},involvedObject.kind=ReplicaSet` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of ReplicationControllers from all namespaces
        public static async handleGetReplicationControllerList(req: Request, res: Response):Promise<void> {
            try{
                let ReplicationControllerList: k8s.V1ReplicationControllerList;
                if (req.params.namespace) {
                    if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                    }
                    const ReplicationController_req: k8s.CoreV1ApiListNamespacedReplicationControllerRequest = {namespace: req.params.namespace}
                    ReplicationControllerList = await k8sApi.listNamespacedReplicationController(ReplicationController_req)
                } else {
                    ReplicationControllerList = await k8sApi.listReplicationControllerForAllNamespaces();
                }

                res.status(200).json(GetReplicationControllerList(ReplicationControllerList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

       // Returns detailed information about ReplicationController
        public static async handleGetReplicationControllerDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicationController) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const ReplicationController_req: k8s.CoreV1ApiReadNamespacedReplicationControllerRequest = {namespace: req.params.namespace, name: req.params.replicationController};
                    const ReplicationControllerDetail = await k8sApi.readNamespacedReplicationController(ReplicationController_req);

                    res.status(200).json(GetReplicationControllerDetail(ReplicationControllerDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // scales ReplicationController to a number of replicas
        public static async handleUpdateReplicasCount(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Pods for ReplicationController
        public static async handleGetReplicationControllerPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicationController) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    const ReplicationController_req: k8s.CoreV1ApiReadNamespacedReplicationControllerRequest = {namespace: req.params.namespace, name: req.params.replicationController};
                    const ReplicationControllerDetail = k8sApi.readNamespacedReplicationController(ReplicationController_req);

                    const emptyMap: {[key:string]:string}  = {}
                    const selector = (await ReplicationControllerDetail).spec?.selector || emptyMap
                    

                    if(!selector){
                        res.status(424).send('Missing field in internal specification')
                        return 
                    }
                    const labelSelector = Object.entries(selector).map(([key, value]) => `${key}=${value}`).join(',');

                    const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace, labelSelector: labelSelector }
                    const PodsList = k8sApi.listNamespacedPod(Pod_req)

                    res.status(200).json(PodsList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Events for ReplicationController
        public static async handleGetReplicationControllerEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicationController) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                } else {
                    // if tested and not working just replace the Eventv1api to corev1api 
                    /*EventsV1Api is for Events in the newer events.k8s.io/v1 API, which is mainly for Event resources
                         created by controllers, not for all event logs. Most kubectl describe style events come from v1 in CoreV1Api. 
                         */
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.replicationController},involvedObject.kind=ReplicationController` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Services for ReplicationController
        public static async handleGetReplicationControllerServices(req: Request, res: Response):Promise<void> {
            try{
                const ReplicationController_req: k8s.CoreV1ApiReadNamespacedReplicationControllerRequest = {namespace: req.params.namespace, name: req.params.replicationController};
                const ReplicationControllerDetail = k8sApi.readNamespacedReplicationController(ReplicationController_req);

                const emptyMap: {[key:string]:string}  = {}
                const RCselector = (await ReplicationControllerDetail).spec?.selector || emptyMap

                if(!RCselector){
                    res.status(424).send('Missing field in internal specification')
                    return 
                }
                const Service_req: k8s.CoreV1ApiListNamespacedServiceRequest = {namespace: req.params.namespace }
                const ServicesList = k8sApi.listNamespacedService(Service_req)

                const matchedService = (await ServicesList).items.filter((service) => {
                    const svcSelector = service.spec?.selector || {};
                    return Object.entries(svcSelector).every(([key, value]) => RCselector[key] === value )
                })

                res.status(200).json(matchedService);
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 
        
       
        // returns a list of StatefulSets from all namespaces or specified namespace
        public static async handleGetStatefulSetList(req: Request, res: Response):Promise<void> {
            try{
                let StatefulSetList: k8s.V1StatefulSetList ;
                        if (req.params.namespace) {
                            if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send({
                        listMeta: {
                            totalItems: 0
                        },
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                        
                    } as ResourceList)
                            }
                            const StatefulSet_req: k8s.AppsV1ApiListNamespacedStatefulSetRequest = {namespace: req.params.namespace}
                            StatefulSetList = await k8sAppApi.listNamespacedStatefulSet(StatefulSet_req)
                        } else {
                            StatefulSetList = await k8sAppApi.listStatefulSetForAllNamespaces();
                        }

                        res.status(200).json(GetStatefulSetList(StatefulSetList))
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).send({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // returns detailed information about StatefulSets
        public static async handleGetStatefulSetDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.statefulset) {

                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){

                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {

                    const StatefulSet_req: k8s.AppsV1ApiReadNamespacedStatefulSetRequest = {namespace: req.params.namespace, name: req.params.statefulset};
                    const StatefulSetDetail = await k8sAppApi.readNamespacedStatefulSet(StatefulSet_req);

                    res.status(200).json(GetStatefulSetDetail(StatefulSetDetail));
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 


        // returns  a list of Pods for StatefulSets
        public static async handleGetStatefulSetPods(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of Events for StatefulSets
        public static async handleGetStatefulSetEvents(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // rollout restart of the Daemon Set
        public static async handleStatefulSetRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }  

        // Returns a list of CustomResourceDefinition
        public static async handleGetCustomResourceDefinitionList(req: Request, res: Response):Promise<void> {
            try{

                // const CustomResourceDefinition_req: k8s.CustomObjectsApiListClusterCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1', plural: 'customresourcedefinitions'}
                const CustomResourceDefinitionList = await k8sapiExtention.listCustomResourceDefinition()

                res.status(200).json(GetCustomeResourceDefenitionList(CustomResourceDefinitionList));
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
            res.status(500).json({
                listMeta: {
                    totalItems: 0
                },
                errors: [{
                    ErrStatus:{
                        message: err.message,
                        code: 500,
                        status: 'Internal Server Error',
                        reason: ''
                    }
                }]
                
            } as ResourceList)
            }
        } 

        // returns detailed information about CustomResourceDefinition
        public static async handleGetCustomResourceDefinitionDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.crd){

                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                } else {

                    const CustomResourceDefinition_req: k8s.ApiextensionsV1ApiReadCustomResourceDefinitionRequest = {name:req.params.crd}
                    const CustomResourceDefinitionDetail = await k8sapiExtention.readCustomResourceDefinition(CustomResourceDefinition_req);

                    res.status(200).json(GetCRDDetail(CustomResourceDefinitionDetail));
                }
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns a list of objects of CustomResourceDefinition
        public static async handleGetCustomResourceObjectList(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const CustomResourceDefinition_req: k8s.CustomObjectsApiListNamespacedCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1',  namespace: req.params.namespace, plural: req.params.crd}; 
                    const CustomResourceDefinition_Object_List = k8scustomObjectsApi.listNamespacedCustomObject(CustomResourceDefinition_req);

                    res.status(200).json(CustomResourceDefinition_Object_List);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        /** returns detailed information about custom resource object
         * 
         * @param req.params.namespace namespace of the custom resource
         * @param req.params.crd name of the CustomResourceDefinition
         * @param req.params.object name of the custom resource object
         * @param res 
         */
        public static async handleGetCustomResourceObjectDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd || !req.params.object) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const CustomResourceDefinition_ObjecResource_req: k8s.CustomObjectsApiGetNamespacedCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1', namespace: req.params.namespace, plural: req.params.crd, name: req.params.object};
                    const CustomResourceDefinition_Object_Detail = k8scustomObjectsApi.getNamespacedCustomObject(CustomResourceDefinition_ObjecResource_req);
                    
                    res.status(200).json(CustomResourceDefinition_Object_Detail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns Events for custom resource object
        public static async handleGetCustomResourceObjectEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd || !req.params.object) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.object},involvedObject.kind=${req.params.crd}` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                 }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // returns logs from a Container or returns logs from a Pod
        public static async handleLogs(req: Request, res: Response) {
            try{

                if (!req.params || !req.params.namespace || !req.params.podName || !req.params.container  ) {
                    res.status(400).json(
                        {
                            errors: [{
                                ErrStatus: Errstatus
                            }]
                        }
                    );

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                 
                 } else {
                    res.setHeader('Content-Type', 'text/event-stream');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('Connection', 'keep-alive');
                    const logStream = new stream.PassThrough();


                    logStream.on('data', (chunk) => {
                        res.write(`data: ${chunk.toString()}\n\n`);
                    })
                    // k8s.LogsApi

                    const request = await k8sLog.log(req.params.namespace, req.params.podName, req.params.container, logStream, {
                        follow: true,
                        // tailLines: Number(req.params.tailLines) || 10000,
                        pretty: false,
                        timestamps: false,
                    });
                    
                    req.on('close', () => {
                        request.abort();
                        logStream.destroy();
                    });

                 }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }

        /** returns a text file with logs from a Container
         * 
         * @param req.params.container name of container in the Pod
         * @param req.params.podName name of the Pod
         * @param req.params.namespace namespace of the resource Optional
         * @param res 
         */
        public static async handleLogFile(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.podName || !req.params.container ) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                        errors: [{
                            ErrStatus: ErrstatusNs
                        }]
                    })
                 } else {
                    let logBuffer: Buffer[] = [];
                    const logStream = new stream.PassThrough();

                    logStream.on('data', (chunk) => {
                        logBuffer.push(chunk);
                    });

                    logStream.on('end', () => {
                        const finalBuffer = Buffer.concat(logBuffer);
                        res.setHeader('Content-Type', 'text/plain');
                        res.setHeader('Content-Disposition', `attachment; filename="${req.params.podName}-${req.params.container}-logs.txt"`);
                        res.status(200).send(finalBuffer);
                    });

                    await k8sLog.log(
                        req.params.namespace,
                        req.params.podName,
                        req.params.container,
                        logStream,
                        {
                            follow: false,
                            pretty: false,
                            timestamps: false,
                        }
                    );
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }
        
        /** returns a text file with logs from a Container
         * 
         * @param req.params.resourceType type of the resource
         * @param req.params.resourceName name of the resource
         * @param req.params.namespace namespace of the resource Optional
         * @param res 
         */
        public static async handleLogSource(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.resourceName || !req.params.resourceType ) {
                    res.status(400).json(
                        {
                            errors: [{
                                ErrStatus: Errstatus
                            }]
                        }
                    );
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).json({
                        errors: [{
                            ErrStatus: ErrstatusNs
                        }]
                    })                 
                 } else {
                    switch (req.params.resourceType) {
                        case 'CronJob':
                            let CronJobList: k8s.V1CronJobList ;

                            const CronJob_req: k8s.BatchV1ApiListNamespacedCronJobRequest = {namespace: req.params.namespace}
                            CronJobList = await k8sbatchApi.listNamespacedCronJob(CronJob_req);
                            res.status(200).json(GetCronJobLogList(CronJobList, req.params.resourceName))
                            return
                        case 'DaemonSet':
                            let DaemonSetList: k8s.V1DaemonSetList ;

                            const DaemonSet_req: k8s.AppsV1ApiListNamespacedDaemonSetRequest = {namespace: req.params.namespace}
                            DaemonSetList = await k8sAppApi.listNamespacedDaemonSet(DaemonSet_req)
                            res.status(200).json(GetDaemonSetLogList(DaemonSetList, req.params.resourceName))
                            return
                        case 'Deployment':
                            let DeploymentList: k8s.V1DeploymentList ;
                        
                            const Deployment_req: k8s.AppsV1ApiListNamespacedDeploymentRequest = {namespace: req.params.namespace}
                            DeploymentList = await k8sAppApi.listNamespacedDeployment(Deployment_req)
                            res.status(200).json(GetDeploymentLogList(DeploymentList, req.params.resourceName))
                            return

                        case 'Job':
                            let JobList: k8s.V1JobList ;
                        
                            const Job_req: k8s.BatchV1ApiListNamespacedJobRequest = {namespace: req.params.namespace}
                            JobList = await k8sbatchApi.listNamespacedJob(Job_req);
                            res.status(200).json(GetJobLogList(JobList, req.params.resourceName))
                            return
                        case 'Pod':
                            let PodList: k8s.V1PodList ;
                        
                            const Pod_req: k8s.CoreV1ApiListNamespacedPodRequest = {namespace: req.params.namespace};
                            PodList = await k8sApi.listNamespacedPod(Pod_req);
                            res.status(200).json(GetPodLogList(PodList, req.params.resourceName))
                            return
                        case 'ReplicaSet':
                            let ReplicaSetList: k8s.V1ReplicaSetList ;
                        
                            const ReplicaSet_req: k8s.AppsV1ApiListNamespacedReplicaSetRequest = {namespace: req.params.namespace}
                            ReplicaSetList = await k8sAppApi.listNamespacedReplicaSet(ReplicaSet_req)
                            res.status(200).json(GetReplicaSetLogList(ReplicaSetList, req.params.resourceName))
                            return
                        case 'ReplicationController':
                            let ReplicationControllerList: k8s.V1ReplicationControllerList ;
                        
                            const ReplicationController_req: k8s.CoreV1ApiListNamespacedReplicationControllerRequest = {namespace: req.params.namespace}
                            ReplicationControllerList = await k8sApi.listNamespacedReplicationController(ReplicationController_req)
                            res.status(200).json(GetReplicationControllerLogList(ReplicationControllerList, req.params.resourceName))
                            return
                        case 'StatefulSet':
                            let StatefulSetList: k8s.V1StatefulSetList ;
                        
                            const StatefulSet_req: k8s.AppsV1ApiListNamespacedStatefulSetRequest = {namespace: req.params.namespace}
                            StatefulSetList = await k8sAppApi.listNamespacedStatefulSet(StatefulSet_req)
                            res.status(200).json(GetStatefulSetLogList(StatefulSetList, req.params.resourceName))
                            return
                        default :
                            break; 
                    }
                       
                 }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        }


        /** returns a number of replicas of non-namespaced or namespaced resource
         * 
         * @param req.params.kind kind of the resource
         * @param req.params.name name of the resource
         * @param req.params.namespace namespace of the resource Optional
         * @param res 
         */
        public static async handleGetReplicaCount(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.kind ) {
                    res.status(400).json(
                        {
                            errors: [{
                                ErrStatus: Errstatus
                            }]
                        }
                    );
                } else {                 
                    let plural: string = '';

                    if (req.params.kind.endsWith("y") && !req.params.kind.endsWith("ay") && !req.params.kind.endsWith("ey") && !req.params.kind.endsWith("iy") && !req.params.kind.endsWith("oy") && !req.params.kind.endsWith("uy")) {
                        // Convert 'y' to 'ies' (e.g., Policy → Policies)
                        plural =  req.params.kind.slice(0, -1) + "ies";
                    } else if (req.params.kind.endsWith("s") || req.params.kind.endsWith("x") || req.params.kind.endsWith("z") || req.params.kind.endsWith("sh") || req.params.kind.endsWith("ch")) {
                        // Add 'es' for words ending with s, x, z, sh, ch (e.g., Ingress → Ingresses)
                        plural =  req.params.kind + "es";
                    } else {
                        plural =  req.params.kind + "s";
                    }

                    const resource = await getGroupAndVersion(req.params.kind, req.params.name)

                    if (resource) {
                        const {group, version} = resource
                        let CustomObj: any;

                        if (req.params.namespace) {
                            if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                                res.status(404).json({
                                    errors: [{
                                        ErrStatus: ErrstatusNs
                                    }]
                                })
                                return                 
                            }
                            const CustomObj_req: k8s.CustomObjectsApiGetNamespacedCustomObjectRequest = {namespace: req.params.namespace, name: req.params.name, plural: plural, group: group, version: version }
                            CustomObj = k8scustomObjectsApi.getNamespacedCustomObject(CustomObj_req)

                        } else {
                            const CustomObj_req: k8s.CustomObjectsApiGetClusterCustomObjectRequest = {name: req.params.name, group: group, version: version, plural: plural}
                            CustomObj= k8scustomObjectsApi.getClusterCustomObject(CustomObj_req)
                        }
                        const Replicas: number = CustomObj.status?.replicas || CustomObj.spec?.replicas || 0

                        res.status(200).json({Replicas ,CustomObj}) // After testing just remove or fix the Replicas
                    } else {
                        res.status(404).send('Resource Not Found ')
                    }

                 } 
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

                /** returns a number of replicas of non-namespaced or namespaced resource
         * 
         * @param req.params.kind kind of the resource
         * @param req.params.name name of the resource
         * @param req.params.namespace namespace of the resource Optional
         * @param res 
         */
        public static async handleScaleResource(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.kind ) {
                    res.status(400).json(
                        {
                            errors: [{
                                ErrStatus: Errstatus
                            }]
                        }
                    );
                } else {                 
                    let plural: string = '';

                    if (req.params.kind.endsWith("y") && !req.params.kind.endsWith("ay") && !req.params.kind.endsWith("ey") && !req.params.kind.endsWith("iy") && !req.params.kind.endsWith("oy") && !req.params.kind.endsWith("uy")) {
                        // Convert 'y' to 'ies' (e.g., Policy → Policies)
                        plural =  req.params.kind.slice(0, -1) + "ies";
                    } else if (req.params.kind.endsWith("s") || req.params.kind.endsWith("x") || req.params.kind.endsWith("z") || req.params.kind.endsWith("sh") || req.params.kind.endsWith("ch")) {
                        // Add 'es' for words ending with s, x, z, sh, ch (e.g., Ingress → Ingresses)
                        plural =  req.params.kind + "es";
                    } else {
                        plural =  req.params.kind + "s";
                    }

                    // const resource = await getGroupAndVersion(req.params.kind, req.params.name)

                    // if (resource) {
                    //     const {group, version} = resource
                    //     let CustomObj: any;

                    //     if (req.params.namespace) {
                    //         if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    //             res.status(404).json({
                    //                 errors: [{
                    //                     ErrStatus: ErrstatusNs
                    //                 }]
                    //             })
                    //             return                 
                    //         }
                    //         const CustomObj_req: k8s.CustomObjectsApiGetNamespacedCustomObjectRequest = {namespace: req.params.namespace, name: req.params.name, plural: plural, group: group, version: version }
                    //         CustomObj = k8scustomObjectsApi.getNamespacedCustomObject(CustomObj_req)

                    //     } else {
                    //         const CustomObj_req: k8s.CustomObjectsApiGetClusterCustomObjectRequest = {name: req.params.name, group: group, version: version, plural: plural}
                    //         CustomObj= k8scustomObjectsApi.getClusterCustomObject(CustomObj_req)
                    //     }
                    //     const Replicas: number = CustomObj.status?.replicas || CustomObj.spec?.replicas || 0

                    //     res.status(200).json({Replicas ,CustomObj}) // After testing just remove or fix the Replicas
                    // } else {
                        res.status(404).send('Not implemented ')
                    // }

                 } 
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            }
        } 

        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //                         res.status(500).json({
                //     errors: [{
                //         ErrStatus:{
                //             message: err.message,
                //             code: 500,
                //             status: 'Internal Server Error',
                //             reason: ''
                //         }
                //     }]
                // });
        //     }
        // } 


        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //                         res.status(500).json({
        //             errors: [{
        //                 ErrStatus:{
        //                     message: err.message,
        //                     code: 500,
        //                     status: 'Internal Server Error',
        //                     reason: ''
        //                 }
        //             }]
        //         });
        // //     }
        // } 


        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //                         res.status(500).json({
                //     errors: [{
                //         ErrStatus:{
                //             message: err.message,
                //             code: 500,
                //             status: 'Internal Server Error',
                //             reason: ''
                //         }
                //     }]
                // });
        //     }
        // } 

        public static async  handleGetScrap(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).json(await ScrapData(req.params.namespace));
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }


        // App Deployment

        /** creates an application based on provided deployment.AppDeploymentSpec
         * 
         */

        public static async handleDeploy(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).send('Not Implemented ');
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }

        /** checks if provided name is valid
         * 
         */

        public static async  handleNameValidity(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).send('Not Implemented ');
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }

        /** checks if provided image is valid
         * 
         */

        public static async  handleImageReferenceValidity(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).send('Not Implemented ');
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }


        /** checks if provided service protocol is valid
         * 
         */

        public static async  handleProtocolValidity(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).send('Not Implemented ');
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }

        /** returns a list of available protocols for the service
         * 
         */

        public static async  handleGetAvailableProtocols(req: Request, res: Response): Promise<void> {
            try {
                
                res.status(200).send('Not Implemented ');
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        
        }

        /** create an application from file
         * 
         */

        // public static async  handleDeployFromFile(req: Request, res: Response): Promise<void> {
        //     try {
                
        //         res.status(200).send('Not Implemented ');
        //     } catch(err: any) {
        //         //console.log(`Error retreving namespaces ${err}`);
        //                         res.status(500).json({
                //     errors: [{
                //         ErrStatus:{
                //             message: err.message,
                //             code: 500,
                //             status: 'Internal Server Error',
                //             reason: ''
                //         }
                //     }]
                // });
        //     } 
        
        // }

        /** Replicate the functionality of `kubectl apply`.  That is, create the resources defined in the `specFile` if they do
         * not exist, patch them if they do exist.
         * @param req.body.specFile File systempath to a YAML kubernetes spec.
         * @param res Array of resources Created
         * 
         */
        public static async  handleDeployFromFile(req: Request, res: Response): Promise<void> {
            try {

                const appDeploymentContentSpec: AppDeploymentContentSpec = req.body;
                const response: AppDeploymentContentResponse = {contet: '', error: '', name: ''};
                if (!appDeploymentContentSpec) {
                  response.error = "We couldn't read the content"
                  res.status(400).json(response);
                  return;
                }

                console.log(appDeploymentContentSpec)
                // const specString = await fs.readFile(filePath, 'utf8');
                const spec: k8s.KubernetesObject[] = yaml.loadAll(appDeploymentContentSpec.content) as k8s.KubernetesObject[];
                const validSpecs = spec.filter((s) => s && s.kind && s.metadata);
                const created: k8s.KubernetesObject[] = [];

                for(const spec of validSpecs) {
                    // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
                    // without metadata out
                    spec.metadata = spec.metadata || {}
                    spec.metadata.annotations = spec.metadata.annotations || {};
                    spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);
                    try {
                        // trying to get the resource
                        await k8sclient.read(spec as k8s.KubernetesObject & { metadata: { name: string, namespace?: string } });

                        /* Here i tryed to patch a resource if exists and this could caus a security issue 
                         espacialy when working on the same target but they need to know the kind and the name for the resource
                         and if he did he can change it suposing as creating it we can remove it but i add for the case where
                         the user send the file or the content and no message appear to him and he did the request onther time !
                        */
                        
                        const response = await k8sclient.patch(spec);
                        created.push(response)
                    }catch(err: any) {
                        // if the resource doesnt exist then create it
                        if (err instanceof k8s.ApiException && err.code === 404) {
                            const response = await k8sclient.create(spec);
                            created.push(response);
                        } else {
                            response.error = 'Internal Server Error'
                            res.status(500).send(response)
                            return
                        }
                    } 
                }
                response.name = appDeploymentContentSpec.name
                response.contet = 'Created Succusfully'

                res.status(200).json(response);
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }
        
        
        /** returns unstructured resource from a namespace
         * @param req.params.kind kind of the resource.
         * @param req.params.namespace namespace of the resource.
         * @param req.params.name name of the resource.
         * @param res 
         * 
         */
        public static async  handleEditResource(req: Request, res: Response): Promise<void> {
            try {
                if (!req.params || !req.params.name || !req.params.kind ) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else {
                    if(req.params.namespace) {
                        if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                            res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                            return
                        } 

                    }else{

                        res.status(200).send('Not Implemented');

                    }
                 }
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }

        /** creates or updates a resource in a namespace
         * @param req.params.kind kind of the resource.
         * @param req.params.namespace namespace of the resource.
         * @param req.params.name name of the resource.
         * @param req.body JSON resource Object.
         * @param res 
         * 
         */
        public static async  handlePutResource(req: Request, res: Response): Promise<void> {
            try {
                if (!req.params || !req.params.name || !req.params.kind || !req.body ) {
                    res.status(400).send('Missing Or Misconfigured Request');
                }else {
                    let resourceObject;
                    const apiVersion = req.query.apiVersion;
                    let resourceObjectReq: k8s.KubernetesObject = req.body

                    if(req.params.namespace) {
                        if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                            res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                            return
                        }

                        resourceObject = {apiVersion: apiVersion ,kind: req.params.kind, metadata: {
                            name: req.params.name,
                            namespace: req.params.namespace,
                        }}

                    }else{
                        resourceObject = {apiVersion: apiVersion,kind: req.params.kind, metadata: {
                            name: req.params.name,
                        }}
                        
                    }

                    if ((await k8sclient.read(resourceObject)).metadata?.name){
                        await k8sclient.replace(resourceObjectReq) ? res.status(200).send(`The ${req.params.name} Resource Updated `) : res.status(200).send(`We are Not able to Update ${req.params.name} Resource`)
                    }
                }

            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }

        /** deletes a resource from a namespace
         * @param req.params.kind kind of the resource.
         * @param req.params.namespace namespace of the resource.
         * @param req.params.name name of the resource.
         * @param req.params.deleteNow override graceful delete options and enforce immediate deletion.
         * @param req.params.propagation override default delete propagation policy.
         * @param res 
         * 
         */
        public static async  handleDeleteResource(req: Request, res: Response): Promise<void> {
            try {
                if (!req.params || !req.params.name || !req.params.kind ) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else {
                    let resourceObject: k8s.KubernetesObject ;
                    const apiVersion: string = String(req.query.apiVersion);
                    const deleteNow = req.query.deleteNow;

                    if(req.params.namespace) {
                        if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                            res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                            return
                        }
                        if(deleteNow === 'false'){
                            resourceObject = {apiVersion: apiVersion ,  kind: req.params.kind, metadata: {
                                name: req.params.name,
                                namespace: req.params.namespace,
                                deletionGracePeriodSeconds: 30,
                                deletionTimestamp: new Date(formatRFC3339(new Date()))
                            }}
                        }else {
                            resourceObject = {apiVersion: apiVersion, kind: req.params.kind, metadata: {
                                name: req.params.name,
                                namespace: req.params.namespace,
                            }}
                        }

                    }else{
                        if(req.params.deleteNow){
                            resourceObject = {apiVersion: apiVersion, kind: req.params.kind, metadata: {
                                name: req.params.name,
                                deletionGracePeriodSeconds: Number(req.params.deleteNow),
                                deletionTimestamp: new Date(formatRFC3339(new Date()))
                            }}
                        }else {
                            resourceObject = {apiVersion: apiVersion, kind: req.params.kind, metadata: {
                                name: req.params.name,
                            }}
                        }
                    }

                    res.status(200).send((await k8sclient.delete(resourceObject)).status + `Delete the ${req.params.name} Resource`);
                 }
                
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }

        /** returns unstructured resource from a namespace
         * @param req.params.kind kind of the resource.
         * @param req.params.apiVersion apiVersion of the resource
         * @param req.params.namespace namespace of the resource.
         * @param req.params.name name of the resource.
         * @param res 
         * 
         */
        public static async  handleGetResource(req: Request, res: Response) {
            try {
                if (!req.params || !req.params.name || !req.params.kind ) {
                                    res.status(400).json(
                    {
                        errors: [{
                            ErrStatus: Errstatus
                        }]
                    }
                );
                }else {
                    let resourceObject;
                    const apiVersion = req.query.apiVersion;
                    if(req.params.namespace) {
                        if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                            res.status(404).json({
                    errors: [{
                        ErrStatus: ErrstatusNs
                    }]
                })
                            return
                        }

                        resourceObject = {apiVersion: apiVersion, kind: req.params.kind, metadata: {
                            name: req.params.name,
                            namespace: req.params.namespace,
                        }}

                    }else{
                        resourceObject = {apiVersion: apiVersion, kind: req.params.kind, metadata: {
                            name: req.params.name,
                        }}
                        
                    }
                    const objectResource = await k8sclient.read(resourceObject)
                    res.status(200).json(objectResource);
                }

            } catch(err: any) {
                console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }

        /** Replicate the functionality of `kubectl apply`.  That is, create the resources defined in the `specFile` if they do
         * not exist, patch them if they do exist.
         * @param req.body.specFile File systempath to a YAML kubernetes spec.
         * @param res Array of resources Created
         * 
         */
        public static async  handleScaleDeployment(req: Request, res: Response): Promise<void> {
            try {
                const name = req.params.name
                const namespace = req.params.namespace
                const replicas = Number(req.params.replicas)
                
                // find the particular deployment
                const deployment : k8s.V1Deployment = await k8sAppApi.readNamespacedDeployment({
                    name,
                    namespace,
                });
                
                // edit
                const newDeployment : k8s.V1Deployment = {
                    ...deployment,
                    spec: {
                        ...deployment.spec!,
                        replicas,
                    },
                };

                // replace
                await k8sAppApi.replaceNamespacedDeployment({
                    name,
                    namespace,
                    body: newDeployment ,
                });
                k8s.topNodes

                res.status(200).send("Success Scaling Deployment")
            } catch(err: any) {
                //console.log(`Error retreving namespaces ${err}`);
                                res.status(500).json({
                    errors: [{
                        ErrStatus:{
                            message: err.message,
                            code: 500,
                            status: 'Internal Server Error',
                            reason: ''
                        }
                    }]
                });
            } 
        }
    }



 