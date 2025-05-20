import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, StorageClassList, StorageClass } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetStorageClassList(listNamespacedStorageClass: k8s.V1StorageClassList): StorageClassList {
    const items: StorageClass[] = []

    const att_totalItems = listNamespacedStorageClass.items.length || 0
    listNamespacedStorageClass.items.forEach(item => {
        items.push({
            provisioner: item.provisioner,
            parameters: [item.parameters ?? {}],
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
                kind: listNamespacedStorageClass.kind || '',
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
    } as StorageClassList

}
