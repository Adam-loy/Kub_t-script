import * as k8s from '@kubernetes/client-node'; 
import { Condition, EventList, PersistentVolumeClaimDetail, K8sError, ResourceQuotaDetailList, LimitRange } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetPersistentVolumeClaimDetail(PersistentVolumeClaim: k8s.V1PersistentVolumeClaim): PersistentVolumeClaimDetail {

    const errors: K8sError[] = [];

    const persistentVolumeClaim: PersistentVolumeClaimDetail = {
        status: PersistentVolumeClaim.status?.phase || '', // Not So Sure
        volume: PersistentVolumeClaim.spec?.volumeName || '', // Not So Sure
        capacity: '' , // Not Implemented
        storageClass: PersistentVolumeClaim.spec?.storageClassName || '', 
        accessModes: PersistentVolumeClaim.spec?.accessModes || [], 
        objectMeta: {
            name: PersistentVolumeClaim.metadata?.name || '',
            namespace: PersistentVolumeClaim.metadata?.namespace,
            labels: PersistentVolumeClaim.metadata?.labels,
            annotations: PersistentVolumeClaim.metadata?.annotations,
            creationTimestamp: PersistentVolumeClaim.metadata?.creationTimestamp,
            uid: PersistentVolumeClaim.metadata?.uid,
            ownerReferences: PersistentVolumeClaim.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: PersistentVolumeClaim.apiVersion || 'v1',
            kind: PersistentVolumeClaim.kind || 'PersistentVolumeClaim',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return persistentVolumeClaim as PersistentVolumeClaimDetail

} 