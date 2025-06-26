import * as k8s from '@kubernetes/client-node'; 
import {  ReplicationControllerDetail, K8sError, LabelSelector, PodList, PodInfo, EventList, ServiceList,  } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetReplicationControllerDetail(ReplicationController: k8s.V1ReplicationController): ReplicationControllerDetail {

    const errors: K8sError[] = [];

    const replicationController: ReplicationControllerDetail = {
        labelSelector: ReplicationController.metadata?.labels || {} as StringMap, 
        containerImages: [] , // Not Implemented
        initContainerImages: [], // Not Implemented
        podInfo: {} as PodInfo , // Not Implemented
        podList: {} as PodList, // Not Implemented
        serviceList: {} as ServiceList, // Not Implemented
        eventList: {} as EventList, // Not Implemented
        hasMetrics: false, // Not Implemented
        objectMeta: {
            name: ReplicationController.metadata?.name || '',
            namespace: ReplicationController.metadata?.namespace,
            labels: ReplicationController.metadata?.labels,
            annotations: ReplicationController.metadata?.annotations,
            creationTimestamp: ReplicationController.metadata?.creationTimestamp,
            uid: ReplicationController.metadata?.uid,
            ownerReferences: ReplicationController.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: ReplicationController.apiVersion || 'v1',
            kind: ReplicationController.kind || 'ReplicationController',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return replicationController as ReplicationControllerDetail

} 