import * as k8s from '@kubernetes/client-node'; 
import { Condition, EventList, PersistentVolumeDetail, K8sError, ResourceQuotaDetailList, LimitRange } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';
import { PersistentVolumeSource } from '../../../model/typing/volume.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetPersistentVolumeDetail(PersistentVolume: k8s.V1PersistentVolume): PersistentVolumeDetail {

    const errors: K8sError[] = [];

    const persistentVolume: PersistentVolumeDetail = {
        status: PersistentVolume.status?.phase || '', // Not so Sure
        claim: PersistentVolume.spec?.claimRef?.name || '', // Not so sure,
        reclaimPolicy: PersistentVolume.spec?.persistentVolumeReclaimPolicy || '', 
        capacity: PersistentVolume.spec?.capacity  || {}  as StringMap , 
        message: PersistentVolume.status?.message || '',
        storageClass: PersistentVolume.spec?.storageClassName || '',
        reason: PersistentVolume.status?.reason || '',
        persistentVolumeSource: {} as PersistentVolumeSource, // Not Implemented
        mountOptions: PersistentVolume.spec?.mountOptions ,
        accessModes: PersistentVolume.spec?.accessModes || [],
        objectMeta: {
            name: PersistentVolume.metadata?.name || '',
            namespace: PersistentVolume.metadata?.namespace,
            labels: PersistentVolume.metadata?.labels,
            annotations: PersistentVolume.metadata?.annotations,
            creationTimestamp: PersistentVolume.metadata?.creationTimestamp,
            uid: PersistentVolume.metadata?.uid,
            ownerReferences: PersistentVolume.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: PersistentVolume.apiVersion || 'v1',
            kind: PersistentVolume.kind || 'PersistentVolume',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return persistentVolume as PersistentVolumeDetail

} 