import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, PersistentVolume, PersistentVolumeList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetPersistentVolumeList(listNamespacedPersistentVolume: k8s.V1PersistentVolumeList): PersistentVolumeList {

    const att_totalItems = listNamespacedPersistentVolume.items.length || 0
    const items: PersistentVolume[] = []
    listNamespacedPersistentVolume.items.forEach(item => {
        
        items.push({
            capacity: item.spec?.capacity || {},
            storageClass: item.spec?.storageClassName || '',
            accessModes: item.spec?.accessModes ||[],
            reclaimPolicy: item.spec?.persistentVolumeReclaimPolicy || '',
            mountOptions: item.spec?.mountOptions || [],
            status: item.status?.phase || '',
            claim: item.spec?.claimRef ? `${item.spec.claimRef.namespace}/${item.spec.claimRef.name}` : '',
            reason: item.status?.reason || '',
            objectMeta: {
                name: item.metadata?.name || '',
                namespace: item.metadata?.namespace,
                labels: item.metadata?.labels,
                annotations: item.metadata?.annotations,
                creationTimestamp: item.metadata?.creationTimestamp,
                uid: item.metadata?.uid,
                ownerReferences: item.metadata?.ownerReferences,
            },
            typeMeta: {
                kind: listNamespacedPersistentVolume.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        items: items,
    } as PersistentVolumeList

}