import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, PersistentVolumeClaim, PersistentVolumeClaimList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetPersistentVolumeClaimList(listNamespacedPersistentVolumeClaim: k8s.V1PersistentVolumeClaimList): PersistentVolumeClaimList {

    const att_totalItems = listNamespacedPersistentVolumeClaim.items.length || 0
    const items: PersistentVolumeClaim[] = [];
    
    listNamespacedPersistentVolumeClaim.items.forEach(item => {

        items.push({
            status: item.status?.modifyVolumeStatus?.status || '',
            volume: item.spec?.volumeName || '',
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
                apiVersion: item.apiVersion || 'v1',
                kind: item.kind ||'PersistentVolumeClaim',
                scalable: false,
                restartable: false,
            }
        })
    })

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        items: items,
    } as PersistentVolumeClaimList

}