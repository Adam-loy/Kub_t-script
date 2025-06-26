import * as k8s from '@kubernetes/client-node'; 
import {  ReplicaSetDetail, K8sError, LabelSelector, PodList, PodInfo, EventList,  } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetReplicaSetDetail(ReplicaSet: k8s.V1ReplicaSet): ReplicaSetDetail {

    const errors: K8sError[] = [];

    const replicaSet: ReplicaSetDetail = {
        selector: {
            matchLabels: ReplicaSet.spec?.selector.matchLabels
        } as LabelSelector,
        podInfo: {} as PodInfo , // Not implemented
        podList: {} as PodList, // Not Implemented
        containerImages: [], // Not implemented
        initContainerImages: [], // Not implemented
        eventList: {} as EventList, // Not implemented
        objectMeta: {
            name: ReplicaSet.metadata?.name || '',
            namespace: ReplicaSet.metadata?.namespace,
            labels: ReplicaSet.metadata?.labels,
            annotations: ReplicaSet.metadata?.annotations,
            creationTimestamp: ReplicaSet.metadata?.creationTimestamp,
            uid: ReplicaSet.metadata?.uid,
            ownerReferences: ReplicaSet.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: ReplicaSet.apiVersion || 'v1',
            kind: ReplicaSet.kind || 'ReplicaSet',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return replicaSet as ReplicaSetDetail

} 