import * as k8s from '@kubernetes/client-node'; 
import {  K8sError, ResourceQuotaDetail, ResourceQuotaStatus } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetResourceQuotaDetail(ResourceQuota: k8s.V1ResourceQuota): ResourceQuotaDetail {

    const errors: K8sError[] = [];

    const resourceQuota: ResourceQuotaDetail = {
        scopes: ResourceQuota.spec?.scopes || [],
        statusList: {} as { [key: string]: ResourceQuotaStatus }, // Not Implemented
        objectMeta: {
            name: ResourceQuota.metadata?.name || '',
            namespace: ResourceQuota.metadata?.namespace,
            labels: ResourceQuota.metadata?.labels,
            annotations: ResourceQuota.metadata?.annotations,
            creationTimestamp: ResourceQuota.metadata?.creationTimestamp,
            uid: ResourceQuota.metadata?.uid,
            ownerReferences: ResourceQuota.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: ResourceQuota.apiVersion || 'v1',
            kind: ResourceQuota.kind || 'ResourceQuota',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return resourceQuota as ResourceQuotaDetail

} 