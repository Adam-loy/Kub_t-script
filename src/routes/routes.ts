import express from 'express';

import { APIHandler } from './handler/api.handler.js';


export const router = express.Router();




router.get("/v1/_raw/:kind/name/:name",APIHandler.handleGetResource);
router.put("/v1/_raw/:kind/name/:name",APIHandler.handlePutResource);
router.delete("/v1/_raw/:kind/name/:name",APIHandler.handleDeleteResource);
router.get("/v1/_raw/:kind/namespace/:namespace/name/:name",APIHandler.handleGetResource);
router.put("/v1/_raw/:kind/namespace/:namespace/name/:name",APIHandler.handlePutResource);
router.delete("/v1/_raw/:kind/namespace/:namespace/name/:name",APIHandler.handleDeleteResource);


/**
 * Quoatas
 */
router.get("/v1/resourcequotas/:namespace",APIHandler.handleCreateQuotas);
router.get("/v1/resourcequotas",APIHandler.handleresourceQuotas);


// mapViewer
router.get("/v1/scrape/:namespace",APIHandler.handleGetScrap);


  
/**
 * AppDeployment
 */

router.post("/v1/appdeployment",APIHandler.handleDeploy);
router.get("/v1/appdeployment/protocols",APIHandler.handleNameValidity);
router.post("/v1/appdeployment/validate/imagereference",APIHandler.handleImageReferenceValidity);
router.post("/v1/appdeployment/validate/name",APIHandler.handleProtocolValidity);
router.post("/v1/appdeployment/validate/protocol",APIHandler.handleGetAvailableProtocols);
router.post("/v1/appdeploymentfromfile",APIHandler.handleDeployFromFile);


/**
 * Clusterrole
 */
router.get("/v1/clusterrole",APIHandler.handleGetClusterRoleList);
router.get("/v1/clusterrole/:name",APIHandler.handleGetClusterRoleDetail);

/**
 * ClusterRoleBinding
 */

router.get("/v1/clusterrolebinding",APIHandler.handleGetClusterRoleBindingList);
router.get("/v1/clusterrolebinding/:name",APIHandler.handleGetClusterRoleBindingDetail);

/**
 * ConfigMap
 */

router.get("/v1/configmap", APIHandler.handleGetConfigMapList);
router.get("/v1/configmap/:namespace", APIHandler.handleGetConfigMapList)
router.get("/v1/configmap/:namespace/:configmap", APIHandler.handleGetConfigMapDetail)


/**
 * Crd
 */

router.get("/v1/crd",APIHandler.handleGetCustomResourceDefinitionList);
router.get("/v1/crd/:crd",APIHandler.handleGetCustomResourceDefinitionDetail);
router.get("/v1/crd/:namespace/:crd/object",APIHandler.handleGetCustomResourceObjectList);
router.get("/v1/crd/:namespace/:crd/:object",APIHandler.handleGetCustomResourceObjectDetail);
router.get("/v1/crd/:namespace/:crd/:object/event",APIHandler.handleGetCustomResourceObjectEvents);



/**
 * Cronjob
 */

router.get("/v1/cronjob",APIHandler.handleGetCronJobList);
router.get("/v1/cronjob/:namespace",APIHandler.handleGetCronJobList);
router.get("/v1/cronjob/:namespace/:name",APIHandler.handleGetCronJobDetail);
router.get("/v1/cronjob/:namespace/:name/event",APIHandler.handleGetCronJobEvents);
router.get("/v1/cronjob/:namespace/:name/job",APIHandler.handleGetCronJobJobs);
router.put("/v1/cronjob/:namespace/:name/trigger",APIHandler.handleTriggerCronJob); // name of the CronJob

/**
 * DaemonSet
 */

router.get("/v1/daemonset",APIHandler.handleGetDaemonSetList);
router.get("/v1/daemonset/:namespace",APIHandler.handleGetDaemonSetList);
router.get("/v1/daemonset/:namespace/:daemonSet",APIHandler.handleGetDaemonSetDetail);
router.get("/v1/daemonset/:namespace/:daemonSet/event",APIHandler.handleGetDaemonSetEvents);
router.get("/v1/daemonset/:namespace/:daemonSet/pod",APIHandler.handleGetDaemonSetPods);
router.get("/v1/daemonset/:namespace/:daemonSet/service",APIHandler.handleGetDaemonSetServices);


/**
 * Deployment
 */

router.get("/v1/deployment",APIHandler.handleGetDeployments);
router.get("/v1/deployment/:namespace",APIHandler.handleGetDeployments);
router.get("/v1/deployment/:namespace/:deployment",APIHandler.handleGetDeploymentDetail);
router.get("/v1/deployment/:namespace/:deployment/event",APIHandler.handleGetDeploymentEvents);
router.get("/v1/deployment/:namespace/:deployment/newreplicaset",APIHandler.handleGetDeploymentNewReplicaSet);
router.get("/v1/deployment/:namespace/:deployment/oldreplicaset",APIHandler.handleGetDeploymentOldReplicaSets);
// router.put("/v1/deployment/:namespace/:deployment/pause",APIHandler.handleDeploymentPause);
// router.put("/v1/deployment/:namespace/:deployment/restart",APIHandler.handleDeploymentRestart);
// router.put("/v1/deployment/:namespace/:deployment/resume",APIHandler.handleDeploymentResume);
// router.put("/v1/deployment/:namespace/:deployment/rollback",APIHandler.handleDeploymentRollback);


/**
 * Endpoint
 */

router.get("/v1/endpoint", APIHandler.handleGetEndpointList);
router.get("/v1/endpoint/:namespace", APIHandler.handleGetEndpointList);


/**
 * Event
 */

router.get("/v1/event", APIHandler.handleGetEventList);
router.get("/v1/event/:namespace", APIHandler.handleGetEventList);


/**
 * HorizontalpodAutoScaler
 */
router.get("/v1/horizontalpodautoscaler",APIHandler.handleGetHorizontalPodAutoscalerList)
router.get("/v1/horizontalpodautoscaler/:namespace",APIHandler.handleGetHorizontalPodAutoscalerList)
router.get("/v1/horizontalpodautoscaler/:namespace/:horizontalpodautoscaler",APIHandler.handleGetHorizontalPodAutoscalerDetail)
router.get("/v1/:kind/:namespace/:name/horizontalpodautoscaler",APIHandler.handleGetHorizontalPodAutoscalerListForResource)

/**
 * Ingress
 */

router.get("/v1/ingress",APIHandler.handleGetIngressList)
router.get("/v1/ingress/:namespace",APIHandler.handleGetIngressList)
router.get("/v1/ingress/:namespace/:ingress/event",APIHandler.handleGetIngressEvent)
router.get("/v1/ingress/:namespace/:name",APIHandler.handleGetIngressDetail)

/**
 * Ingress Class
 */
router.get("/v1/ingressclass",APIHandler.handleGetIngressClassList)
router.get("/v1/ingressclass/:ingressclass",APIHandler.handleGetIngressClass)



// router.get("/v1/integration/:name/state",)

/**
 * Job
 */

router.get("/v1/job",APIHandler.handleGetJobList)
router.get("/v1/job/:namespace",APIHandler.handleGetJobList)
router.get("/v1/job/:namespace/:name",APIHandler.handleGetJobDetail)
router.get("/v1/job/:namespace/:name/event",APIHandler.handleGetJobEvents)
router.get("/v1/job/:namespace/:name/pod",APIHandler.handleGetJobPods)

/**
 * Log
 */

router.get("/v1/log/source/:namespace/:resourceName/:resourceType",APIHandler.handleLogSource)
// router.get("/v1/log/:namespace/:pod/",APIHandler.handleLogs)
router.get("/v1/log/:namespace/:podName/:container",APIHandler.handleLogs)
router.get("/v1/log/file/:namespace/:podName/:container",APIHandler.handleLogFile) 


/**
 * Namespace
 */

router.get("/v1/namespace",APIHandler.handleGetNamespaces);
router.post("/v1/namespace", APIHandler.handleCreateNamespace);
router.get("/v1/namespace/:namespace",APIHandler.handleGetNamespaceDetail);
router.get("/v1/namespace/:name/event",APIHandler.handleGetNamespaceEvents)


/**
 * NetworkPolicy
 */

router.get("/v1/networkpolicy", APIHandler.handleGetNetworkPolicyList)
router.get("/v1/networkpolicy/:namespace", APIHandler.handleGetNetworkPolicyList)
router.get("/v1/networkpolicy/:namespace/:networkpolicy", APIHandler.handleGetNetworkPolicyDetail)

/**
 * Node
 */

router.get("/v1/node",APIHandler.handleGetNodeList)
router.get("/v1/node/:name",APIHandler.handleGetNodeDetail)
//  router.put("/v1/node/:name/drain",APIHandler.handleNodeDrain)
router.get("/v1/node/:name/event",APIHandler.handleGetNodeEvents)
router.get("/v1/node/:name/pod",APIHandler.handleGetNodePods)

/**
 * PersistentVolume
 */

router.get("/v1/persistentvolume",APIHandler.handleGetPersistentVolumeList)
router.get("/v1/persistentvolume/:persistentvolume",APIHandler.handleGetPersistentVolumeDetail)

/**
 * PersistentVolumeClaim 
 */

router.get("/v1/persistentvolumeclaim",APIHandler.handleGetPersistentVolumeClaimList)
router.get("/v1/persistentvolumeclaim/:namespace",APIHandler.handleGetPersistentVolumeClaimList)
router.get("/v1/persistentvolumeclaim/:namespace/:name",APIHandler.handleGetPersistentVolumeClaimDetail)

/**
 * Pod
 */

router.get("/v1/pod",APIHandler.handleGetPods);
router.get("/v1/pod/:namespace",APIHandler.handleGetPods);
router.get("/v1/pod/:namespace/:pod",APIHandler.handleGetPodDetail);
router.get("/v1/pod/:namespace/:pod/container",APIHandler.handleGetPodContainers);
router.get("/v1/pod/:namespace/:pod/event",APIHandler.handleGetPodEvents)
router.get("/v1/pod/:namespace/:pod/persistentvolumeclaim",APIHandler.handleGetPodPersistentVolumeClaims)
router.get("/v1/pod/:namespace/:pod/shell/:container",APIHandler.handleExecShell)

/**
 * ReplicaSet
 */

router.get("/v1/replicaset",APIHandler.handleGetReplicaSets)
router.get("/v1/replicaset/:namespace",APIHandler.handleGetReplicaSets)
router.get("/v1/replicaset/:namespace/:replicaSet",APIHandler.handleGetReplicaSetDetail)
router.get("/v1/replicaset/:namespace/:replicaSet/event",APIHandler.handleGetReplicaSetEvents)
router.get("/v1/replicaset/:namespace/:replicaSet/pod",APIHandler.handleGetReplicaSetPods)
router.get("/v1/replicaset/:namespace/:replicaSet/service", APIHandler.handleGetReplicaSetServices)

/**
 * ReplicationController
 */

router.get("/v1/replicationcontroller",APIHandler.handleGetReplicationControllerList)
router.get("/v1/replicationcontroller/:namespace",APIHandler.handleGetReplicationControllerList)
router.get("/v1/replicationcontroller/:namespace/:replicationController",APIHandler.handleGetReplicationControllerDetail)
router.get("/v1/replicationcontroller/:namespace/:replicationController/event",APIHandler.handleGetReplicationControllerEvents)
router.get("/v1/replicationcontroller/:namespace/:replicationController/pod",APIHandler.handleGetReplicationControllerPods)
router.get("/v1/replicationcontroller/:namespace/:replicationController/service",APIHandler.handleGetReplicationControllerServices)
// router.post("/v1/replicationcontroller/:namespace/:replicationController/update/pod",APIHandler.handleUpdateReplicasCount)

/**
 * Role
 */

router.get("/v1/role",APIHandler.handleGetRoleList)
router.get("/v1/role/:namespace",APIHandler.handleGetRoleList)
router.get("/v1/role/:namespace/name",APIHandler.handleGetRoleDetail)



/**
 * RoleBinding
 */

router.get("/v1/rolebinding",APIHandler.handleGetRoleBindingList)
router.get("/v1/rolebinding/:namespace",APIHandler.handleGetRoleBindingList)
router.get("/v1/rolebinding/:namespace/:name",APIHandler.handleGetRoleBindingDetail)


/**
 * Generic resource scaling
 */

router.get("/v1/scale/:kind/:namespace/:name",APIHandler.handleGetReplicaCount)
router.put("/v1/scale/:kind/:namespace/:name",APIHandler.handleScaleResource)
router.get("/v1/scale/:kind/:name",APIHandler.handleGetReplicaCount)
// router.put("/v1/scale/:kind/:name",)

/**
 * Secret
 */


router.get("/v1/secret",APIHandler.handleGetSecretList)
// router.post("/v1/secret",)
router.get("/v1/secret/:namespace",APIHandler.handleGetSecretList)
router.get("/v1/secret/:namespace/:name",APIHandler.handleGetSecretDetail)

/**
 * Service
 */

router.get("/v1/service",APIHandler.handleGetServiceList)
router.get("/v1/service/:namespace",APIHandler.handleGetServiceList)
router.get("/v1/service/:namespace/:service",APIHandler.handleGetServiceDetail)
router.get("/v1/service/:namespace/:service/event",APIHandler.handleGetServiceEvent)
router.get("/v1/service/:namespace/:service/ingress",APIHandler.handleGetServiceIngressList)
router.get("/v1/service/:namespace/:service/pod",APIHandler.handleGetServicePods)

/**
 * ServiceAccount
 */

router.get("/v1/serviceaccount",APIHandler.handleGetServiceAccountList)
router.get("/v1/serviceaccount/:namespace",APIHandler.handleGetServiceAccountList)
router.get("/v1/serviceaccount/:namespace/:serviceaccount",APIHandler.handleGetServiceAccountDetail)
router.get("/v1/serviceaccount/:namespace/:serviceaccount/imagepullsecret",APIHandler.handleGetServiceAccountImagePullSecrets)
router.get("/v1/serviceaccount/:namespace/:serviceaccount/secret",APIHandler.handleGetServiceAccountSecrets)


/**
 * StatefulSet
 */

router.get("/v1/statefulset",APIHandler.handleGetStatefulSetList)
router.get("/v1/statefulset/:namespace",APIHandler.handleGetStatefulSetList)
router.get("/v1/statefulset/:namespace/:statefulset",APIHandler.handleGetStatefulSetDetail)
router.get("/v1/statefulset/:namespace/:statefulset/event",APIHandler.handleGetStatefulSetEvents)
router.get("/v1/statefulset/:namespace/:statefulset/pod",APIHandler.handleGetStatefulSetPods)

/**
 * StorageClass
 */

router.get("/v1/storageclass",APIHandler.handleGetStorageClassList)
router.get("/v1/storageclass/:storageclass",APIHandler.handleGetStorageClass)
router.get("/v1/storageclass/:storageclass/persistentvolume",APIHandler.handleGetStorageClassPersistentVolumes)


