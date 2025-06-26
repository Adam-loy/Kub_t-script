import * as k8s from '@kubernetes/client-node'; 
import {  K8sError, ServiceAccountDetail,  } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetServiceAccountDetail(ServiceAccount: k8s.V1ServiceAccount): ServiceAccountDetail {

    const errors: K8sError[] = [];

    const serviceAccount: ServiceAccountDetail = {
        objectMeta: {
            name: ServiceAccount.metadata?.name || '',
            namespace: ServiceAccount.metadata?.namespace,
            labels: ServiceAccount.metadata?.labels,
            annotations: ServiceAccount.metadata?.annotations,
            creationTimestamp: ServiceAccount.metadata?.creationTimestamp,
            uid: ServiceAccount.metadata?.uid,
            ownerReferences: ServiceAccount.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: ServiceAccount.apiVersion || 'v1',
            kind: ServiceAccount.kind || 'ServiceAccount',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return serviceAccount as ServiceAccountDetail

} 