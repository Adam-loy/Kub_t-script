import * as k8s from '@kubernetes/client-node'; 
import {  Endpoint, EndpointList, EventList, K8sError, PodInfo, PodList, StorageClassDetail, Subject } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetStorageClassDetail(StorageClass: k8s.V1StorageClass): StorageClassDetail {

    const errors: K8sError[] = [];

    const storageClass: StorageClassDetail = {
        parameters: StorageClass.parameters || {}  as StringMap,
        provisioner: StorageClass.provisioner || '',
        objectMeta: {
            name: StorageClass.metadata?.name || '',
            namespace: StorageClass.metadata?.namespace,
            labels: StorageClass.metadata?.labels,
            annotations: StorageClass.metadata?.annotations,
            creationTimestamp: StorageClass.metadata?.creationTimestamp,
            uid: StorageClass.metadata?.uid,
            ownerReferences: StorageClass.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: StorageClass.apiVersion || 'v1',
            kind: StorageClass.kind || 'StorageClass',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return storageClass as StorageClassDetail

} 