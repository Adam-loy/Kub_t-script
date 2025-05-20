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
import { ObjectMeta, ResourceList, ErrStatus } from '../../model/typing/root.api.js';
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

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)
// Note: if we gone to work with aws i think all of this need to be changed 

const log = new k8s.Log(kubeclient)
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

enum Errstatus {
    message = 'Missing Or Misconfigured Params',
    code = 404,
    status = 'Not Found',
    reason = ''
}

// Set useQuerystring to true for CoreV1Api
(k8sApi as any).useQuerystring = true; // Casting to any is necessary since the property is not directly exposed

export class APIHandler {

    public static async  handleGetConfig(req: Request, res: Response):Promise<void> {
        try {
        const config: Config = {
          serverTime: Date.now(),
          userAgent: getUserAgent(),
          version: getVersion(),    
        };
      
        // res.status(200).json(config);
        res.send('Hello world from TypeScript!');

    } catch(err: any ) {
        console.log(`Error retreving namespaces ${err}`);
                    res.status(500).send({error: err.message || 'Internal Server Error'})
    }
    }

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
                res.status(400).send({ error: 'Invalid namespace specification'});
                return;
            }

            const response: any = await k8sApi.createNamespace(namespaceSpec);
            
            res.status(201).send('Success saving '+ namespaceSpec.body.metadata.name+ ' Namespace' + response);
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'})
        }
    }

    // Return a detail of a naemspace
    public static async handleGetNamespaceDetail(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params || !req.params.namespace){
                res.status(400).send({error : 'Invalid request type specification'});
                return;
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
                return;
            }
            const Namespace_req: k8s.CoreV1ApiReadNamespaceRequest = {name: req.params.namespace};

            const NamespaceDetail = await k8sApi.readNamespace(Namespace_req);
            
            res.status(200).json(NamespaceDetail);
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'})
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
                res.status(400).send('Missing ODDr Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.name})){
                res.status(404).send('Namespace does not exist')
            } else {
                const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.name}
                const EventList = k8seventApi.listNamespacedEvent(event_req);

                res.status(200).json(await EventList);
            }
        } catch(err: any) {
            //console.log(`Error creating namespace ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'})
        }
    }

    /**
     * Events
     */
    // Return a Events under a Namespace and in All namespaces
    public static async handleGetEventList(req: Request, res: Response): Promise<void> {
        try{
            let eventlist: Promise<k8s.CoreV1EventList>;
            if (req.params.namespace) {
                if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist');
                    return;
                }
                const namespace :k8s.CoreV1ApiListNamespacedEventRequest = {namespace: req.params.namespace}
                eventlist =  k8sApi.listNamespacedEvent(namespace)
            }else {
                const event_req: k8s.CoreV1ApiListEventForAllNamespacesRequest = {}
                eventlist  =  k8sApi.listEventForAllNamespaces(event_req);
            }

            res.status(200).json((await eventlist).items);

        }catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const NamespacedConfigmap : k8s.CoreV1ApiReadNamespacedConfigMapRequest = {namespace: req.params.namespace, name: req.params.configmap}
                const configmapDetail = k8sApi.readNamespacedConfigMap(NamespacedConfigmap);

                res.status(200).json((await configmapDetail));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    /**
     * Pod
     */
    // Return a list of Pods from all namespaces or namespaced
    public static async handleGetPods(req: Request, res: Response): Promise<void> {
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
    }
    
    // Return Detailed information about Pod
    public static async handleGetPodDetail(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const namespacedPod: k8s.CoreV1ApiReadNamespacedPodRequest = {namespace: req.params.namespace, name: req.params.pod}
                const podDetail = k8sApi.readNamespacedPod(namespacedPod);
                
                res.status(200).json((await podDetail));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Return a list of Event for Pod
    public static async handleGetPodEvents(req: Request,res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.pod},involvedObject.kind=Pod` }
                const EventList = k8seventApi.listNamespacedEvent(event_req);

                res.status(200).json(await EventList);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Return a list of container for a Pod
    public static async handleGetPodContainers(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const namespacedPod: k8s.CoreV1ApiReadNamespacedPodRequest = {namespace: req.params.namespace, name: req.params.pod}
                const podDetail = k8sApi.readNamespacedPod(namespacedPod);

                // const containerNameList: string[] = (await podDetail).spec?.containers.map((container) => {
                //     return container.name;
                // }) || [''];

                res.status(200).json(await podDetail);
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Return list of pvcName in a specific Pod 
    public static async handleGetPodPersistentVolumeClaims(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.pod) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
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
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Handles exec into pod
    public static async handleExecShell(req: Request, res: Response):Promise<void> {
        try{

            // Not implemented yet 
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const namespacedService: k8s.CoreV1ApiReadNamespacedServiceRequest = {namespace: req.params.namespace, name: req.params.service}
                const ServiceDetail = k8sApi.readNamespacedService(namespacedService);
                
                res.status(200).json((await ServiceDetail));
            }

        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Events for Service
    public static async handleGetServiceEvent(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const resources: k8s.CoreV1ApiListNamespacedEventRequest = {namespace: req.params.namespace, fieldSelector: `involvedObject.name=${req.params.service}`};
                const ServiceEvent = k8sApi.listNamespacedEvent(resources);
                
                res.status(200).send((await ServiceEvent))
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Pods for Service
    public static async handleGetServicePods(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
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
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Ingresses for Service
    public static async handleGetServiceIngressList(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.service) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
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
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const namespacedSecret: k8s.CoreV1ApiReadNamespacedSecretRequest = {namespace: req.params.namespace, name: req.params.name}
                const ServiceDetail = k8sApi.readNamespacedSecret(namespacedSecret);
                
                res.status(200).json((await ServiceDetail));
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Stores ImagePullSecret in a Kubernetes Secret
    public static async handleCreateImagePullSecret(req: Request, res: Response):Promise<void> {
        try{
            // Not Imp
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Nodes 
    public static async handleGetNodeList(req: Request, res: Response):Promise<void> {
        try{
            const node_req: k8s.CoreV1ApiListNodeRequest = {}
            const NodeListObj: k8s.V1NodeList = await k8sApi.listNode(node_req);

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
                res.status(400).send('Missing Or Misconfigured Params');
                return;
            } else {
                const node_req: k8s.CoreV1ApiReadNodeRequest = {name: req.params.name}
                const NodeObj = k8sApi.readNode(node_req); 

                res.status(200).json(NodeObj);
                return;
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Events for Node
    public static async handleGetNodeEvents(req: Request, res: Response):Promise<void> {
        try{
            if(!req.params || !req.params.name){
                res.status(400).send('Missing Or Misconfigured Params');
            } else {
                const event_req: k8s.CoreV1ApiListEventForAllNamespacesRequest = {fieldSelector:`involvedObject.kind=Node,involvedObject.name=${req.params.name}`}
                
                const NodeEvents = await k8sApi.listEventForAllNamespaces(event_req);
                
                res.status(200).json(NodeEvents);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Pods for Node
    public static async handleGetNodePods(req: Request, res: Response):Promise<void> {
        try{
            if(!req.params || !req.params.name){
                res.status(400).send('Missing Or Misconfigured Params');
            } else {
                const pod_req: k8s.CoreV1ApiListPodForAllNamespacesRequest = {fieldSelector:`involvedObject.kind=Node,involvedObject.name=${req.params.name}`}
                
                const NodePods = await k8sApi.listPodForAllNamespaces(pod_req);
                
                res.status(200).json(NodePods);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Drains Node
    public static async handleNodeDrain(req: Request, res: Response):Promise<void> {
        try{
            // Not Imp
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const role_req: k8s.RbacAuthorizationV1ApiReadNamespacedRoleRequest = {namespace: req.params.namespace, name: req.params.name}
                const RoleObj = k8sApiRbac.readNamespacedRole(role_req);

                res.status(200).json(await RoleObj);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const rolebinding_req: k8s.RbacAuthorizationV1ApiReadNamespacedRoleBindingRequest = {namespace: req.params.namespace, name: req.params.name}
                const RoleBindingObj = k8sApiRbac.readNamespacedRoleBinding(rolebinding_req);

                res.status(200).json( await RoleBindingObj);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = k8sApi.readNamespacedServiceAccount(serviceaccount_req);

                res.status(200).json( await ServiceAccountObj);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of Secrets for ServiceAccount
    public static async handleGetServiceAccountSecrets(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.serviceaccount) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = k8sApi.readNamespacedServiceAccount(serviceaccount_req);
                
                // list of secrets
                res.status(200).json( (await ServiceAccountObj).secrets);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
        }
    }

    // Returns a list of ImagePullSecret Secrets for ServiceAccount
    public static async handleGetServiceAccountImagePullSecrets(req: Request, res: Response):Promise<void> {
        try{
            if (!req.params || !req.params.namespace || !req.params.serviceaccount) {
                res.status(400).send('Missing Or Misconfigured Params');
            }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                res.status(404).send('Namespace does not exist')
            } else {
                const serviceaccount_req: k8s.CoreV1ApiReadNamespacedServiceAccountRequest = {namespace: req.params.namespace, name: req.params.serviceaccount}
                const ServiceAccountObj = k8sApi.readNamespacedServiceAccount(serviceaccount_req);

                // list of imagePullSecret
                res.status(200).json( (await ServiceAccountObj).imagePullSecrets);
            }
        } catch(err: any){
            //console.log(`Error fetching Events ${err}`);
            res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                } else {
                    const StorageClass_req: k8s.StorageV1ApiReadStorageClassRequest = {name: req.params.name}
                    const StorageClass = k8sStorageApi.readStorageClass(StorageClass_req);

                    res.status(200).json(StorageClass);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        }

        // Returns a list of PersistentVolumes assigned to StorageClass
        public static async handleGetStorageClassPersistentVolumes(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                } else {
                    const ClusterRole_req: k8s.RbacAuthorizationV1ApiReadClusterRoleRequest = {name: req.params.name}
                    const clusterRoleDetail = k8sApiRbac.readClusterRole(ClusterRole_req);

                    res.status(200).json(await clusterRoleDetail)
                }

            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                } else {
                    const ClusterRoleBinding_req: k8s.RbacAuthorizationV1ApiReadClusterRoleBindingRequest = {name: req.params.name}
                    const ClusterRoleBindingDetail = k8sApiRbac.readClusterRoleBinding(ClusterRoleBinding_req);

                    res.status(200).json(await ClusterRoleBindingDetail)
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

        // Returns detailed information about CronJob
        public static async handleGetCronJobDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const Cronjob_req: k8s.BatchV1ApiReadNamespacedCronJobRequest = {namespace: req.params.namespace, name: req.params.name};
                    const CronJobDetail = k8sbatchApi.readNamespacedCronJob(Cronjob_req);

                    res.status(200).json(CronJobDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        }

        // Returns a list of Jobs for CronJob
        public static async handleGetCronJobJobs(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const CronJob_req: k8s.BatchV1ApiListNamespacedJobRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=CronJob` }
                    const CronJob_list = k8sbatchApi.listNamespacedJob(CronJob_req);

                    res.status(200).json(CronJob_list);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        }

        // Returns a list of Events for CronJob
        public static async handleGetCronJobEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=CronJob` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        }

        // Triggers a Job based on CronJob
        public static async handleTriggerCronJob(req: Request, res: Response):Promise<void> {
            // name: name of the CronJob
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

        // Returns detailed information about Job
        public static async handleGetJobDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const Job_req: k8s.BatchV1ApiReadNamespacedJobRequest = {namespace: req.params.namespace, name: req.params.name}
                    const JobDetail = k8sbatchApi.readNamespacedJob(Job_req)

                    res.status(200).json(JobDetail);
                }    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Pods for Job
        public static async handleGetJobPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Events for Job
        public static async handleGetJobEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.name},involvedObject.kind=Job` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const DaemonSet_req: k8s.AppsV1ApiReadNamespacedDaemonSetRequest = {namespace: req.params.namespace, name: req.params.daemonSet};
                    const DaemonSetDetail = k8sAppApi.readNamespacedDaemonSet(DaemonSet_req);

                    res.status(200).json(DaemonSetDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of Pods for DaemonSet
        public static async handleGetDaemonSetPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Services for DaemonSet
        public static async handleGetDaemonSetServices(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Events for DaemonSet
        public static async handleGetDaemonSetEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.daemonSet) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.daemonSet},involvedObject.kind=DaemonSet` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Rollout restart of the Daemon Set
        public static async handleDaemonSetRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

        // Returns detailed information about Deployment
        public static async handleGetDeploymentDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const Deployment_req: k8s.AppsV1ApiReadNamespacedDeploymentRequest = {namespace: req.params.namespace, name: req.params.deployment};
                    const DeploymentDetail = k8sAppApi.readNamespacedDeployment(Deployment_req);

                    res.status(200).json(DeploymentDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Events for Deployment
        public static async handleGetDeploymentEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.deployment},involvedObject.kind=Deployment` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of old ReplicaSets for Deployment
        public static async handleGetDeploymentOldReplicaSets(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of new ReplicaSets for Deployment
        public static async handleGetDeploymentNewReplicaSet(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.deployment) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Pauses the Deployment
        public static async handleDeploymentPause(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Rolls back the Deployment to the target revision
        public static async handleDeploymentRollback(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Rollout restart of the Deployment
        public static async handleDeploymentRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Resumes the Deployment
        public static async handleDeploymentResume(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const HorizontalPodAutoscaler_req: k8s.AutoscalingV1ApiReadNamespacedHorizontalPodAutoscalerRequest = {namespace: req.params.namespace, name: req.params.horizontalpodautoscaler};
                    const HorizontalPodAutoscalerDetail = k8sautoscalingApi.readNamespacedHorizontalPodAutoscaler(HorizontalPodAutoscaler_req);

                    res.status(200).json(HorizontalPodAutoscalerDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

        // Returns detailed information about Ingress
        public static async handleGetIngressDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.name) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const Ingress_req: k8s.NetworkingV1ApiReadNamespacedIngressRequest = {namespace: req.params.namespace, name: req.params.name};
                    const IngressDetail = k8snetworkingApi.readNamespacedIngress(Ingress_req);

                    res.status(200).json(IngressDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Events for Ingress
        public static async handleGetIngressEvent(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.ingress) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.ingress},involvedObject.kind=Ingress` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                }else {
                    const IngressClass_req: k8s.NetworkingV1ApiReadIngressClassRequest = {name: req.params.ingressclass};
                    const IngressClassDetail = k8snetworkingApi.readIngressClass(IngressClass_req);

                    res.status(200).json(IngressClassDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');

                 }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                        res.status(404).send('Namespace does not exist')
                     
                 } else {
                    const NetworkingPolicie_req: k8s.NetworkingV1ApiReadNamespacedNetworkPolicyRequest = {namespace: req.params.namespace, name: req.params.networkpolicy};
                    const NetworkingPolicieDetail = k8snetworkingApi.readNamespacedNetworkPolicy(NetworkingPolicie_req);

                    res.status(200).json(NetworkingPolicieDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');
                } else {
                    const PersistentVolume_req: k8s.CoreV1ApiReadPersistentVolumeRequest = { name: req.params.persistentvolume};
                    const persistentvolumeDetail = k8sApi.readPersistentVolume(PersistentVolume_req);

                    res.status(200).json(persistentvolumeDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const PersistentVolumeClaim_req: k8s.CoreV1ApiReadNamespacedPersistentVolumeClaimRequest = {namespace: req.params.namespace, name: req.params.name};
                    const persistentvolumeclaimDetail = k8sApi.readNamespacedPersistentVolumeClaim(PersistentVolumeClaim_req);

                    res.status(200).json(persistentvolumeclaimDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const ReplicaSet_req: k8s.AppsV1ApiReadNamespacedReplicaSetRequest = {namespace: req.params.namespace, name: req.params.replicaSet};
                    const ReplicaSetDetail = k8sAppApi.readNamespacedReplicaSet(ReplicaSet_req);

                    res.status(200).json(ReplicaSetDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // Returns a list of Pods for ReplicaSet
        public static async handleGetReplicaSetPods(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 


        // Returns a list of Services for ReplicaSet
        public static async handleGetReplicaSetServices(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of Events for ReplicaSet
        public static async handleGetReplicaSetEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicaSet) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.replicaSet},involvedObject.kind=ReplicaSet` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const ReplicationController_req: k8s.CoreV1ApiReadNamespacedReplicationControllerRequest = {namespace: req.params.namespace, name: req.params.replicationController};
                    const ReplicationControllerDetail = k8sApi.readNamespacedReplicationController(ReplicationController_req);

                    res.status(200).json(ReplicationControllerDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // scales ReplicationController to a number of replicas
        public static async handleUpdateReplicasCount(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of Pods for ReplicationController
        public static async handleGetReplicationControllerPods(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicationController) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of Events for ReplicationController
        public static async handleGetReplicationControllerEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.replicationController) {
                    res.status(400).send('Missing Or Misconfigured Params');
                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){

                    res.status(404).send('Namespace does not exist')
                 
                 } else {

                    const StatefulSet_req: k8s.AppsV1ApiReadNamespacedStatefulSetRequest = {namespace: req.params.namespace, name: req.params.statefulset};
                    const StatefulSetDetail = k8sAppApi.readNamespacedStatefulSet(StatefulSet_req);

                    res.status(200).json(StatefulSetDetail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 


        // returns  a list of Pods for StatefulSets
        public static async handleGetStatefulSetPods(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of Events for StatefulSets
        public static async handleGetStatefulSetEvents(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // rollout restart of the Daemon Set
        public static async handleStatefulSetRestart(req: Request, res: Response):Promise<void> {
            try{
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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

        // returns detailed information about CustomResourceDefinition
        public static async handleGetCustomResourceDefinitionDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.crd){

                    res.status(400).send('Missing Or Misconfigured Params');

                } else {

                    const CustomResourceDefinition_req: k8s.CustomObjectsApiGetClusterCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1', plural: 'customresourcedefinitions', name:req.params.crd}
                    const CustomResourceDefinitionDetail = k8scustomObjectsApi.getClusterCustomObject(CustomResourceDefinition_req);

                    res.status(200).json(await CustomResourceDefinitionDetail);
                }
    
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns a list of objects of CustomResourceDefinition
        public static async handleGetCustomResourceObjectList(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd) {
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const CustomResourceDefinition_req: k8s.CustomObjectsApiListNamespacedCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1',  namespace: req.params.namespace, plural: req.params.crd}; 
                    const CustomResourceDefinition_Object_List = k8scustomObjectsApi.listNamespacedCustomObject(CustomResourceDefinition_req);

                    res.status(200).json(CustomResourceDefinition_Object_List);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns detailed information about custom resource object
        public static async handleGetCustomResourceObjectDetail(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd || !req.params.object) {
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const CustomResourceDefinition_ObjecResource_req: k8s.CustomObjectsApiGetNamespacedCustomObjectRequest = {group: 'apiextensions.k8s.io' ,version: 'v1', namespace: req.params.namespace, plural: req.params.crd, name: req.params.object};
                    const CustomResourceDefinition_Object_Detail = k8scustomObjectsApi.getNamespacedCustomObject(CustomResourceDefinition_ObjecResource_req);
                    
                    res.status(200).json(CustomResourceDefinition_Object_Detail);
                }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns Events for custom resource object
        public static async handleGetCustomResourceObjectEvents(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.crd || !req.params.object) {
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    const event_req: k8s.EventsV1ApiListNamespacedEventRequest = {namespace:req.params.namespace, fieldSelector: `involvedObject.name=${req.params.object},involvedObject.kind=${req.params.crd}` }
                    const EventList = k8seventApi.listNamespacedEvent(event_req);

                    res.status(200).json(await EventList);
                 }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // returns logs from a Container or returns logs from a Pod
        public static async handleLogs(req: Request, res: Response):Promise<void> {
            try{
                if (!req.params || !req.params.namespace || !req.params.pod ) {
                    res.status(400).send('Missing Or Misconfigured Params');

                }else if (!await k8sApi.readNamespaceStatus({name: req.params.namespace})){
                    res.status(404).send('Namespace does not exist')
                 
                 } else {
                    let  PodLogs ;
                    let PodLogs_req: k8s.CoreV1ApiReadNamespacedPodLogRequest;
                    if (req.params.container) {
                        PodLogs_req = {namespace: req.params.namespace, name: req.params.name, container: req.params.container}
                        PodLogs = k8sApi.readNamespacedPodLog(PodLogs_req)
                    } else {
                    PodLogs_req = {namespace: req.params.namespace, name: req.params.name}
                    PodLogs = k8sApi.readNamespacedPodLog(PodLogs_req)
                    }

                    res.status(200).json(await PodLogs)
                 }
            } catch(err: any){
                //console.log(`Error fetching Events ${err}`);
                res.status(500).send({error: err.message || 'Internal Server Error'});
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
                    res.status(400).send('Missing Or Misconfigured Params');

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
                                res.status(404).send('Namespace does not exist')
                                return                 
                            }
                            const CustomObj_req: k8s.CustomObjectsApiGetNamespacedCustomObjectRequest = {namespace: req.params.namespace, name: req.params.name, plural: plural, group: group, version: version }
                            CustomObj= k8scustomObjectsApi.getNamespacedCustomObject(CustomObj_req)

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
                res.status(500).send({error: err.message || 'Internal Server Error'});
            }
        } 

        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //         res.status(500).send({error: err.message || 'Internal Server Error'});
        //     }
        // } 


        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //         res.status(500).send({error: err.message || 'Internal Server Error'});
        //     }
        // } 


        // public static async handleGetStorageClassList(req: Request, res: Response):Promise<void> {
        //     try{
    
        //     } catch(err: any){
        //         //console.log(`Error fetching Events ${err}`);
        //         res.status(500).send({error: err.message || 'Internal Server Error'});
        //     }
        // } 

    public static async  handleGetScrap(req: Request, res: Response): Promise<void> {
                try {
        
                    res.status(200).json(await ScrapData(req.params.namespace));
                } catch(err: any) {
                    //console.log(`Error retreving namespaces ${err}`);
                    res.status(500).send({error: err.message || 'Internal Server Error'})
                }
        
            }
}



 