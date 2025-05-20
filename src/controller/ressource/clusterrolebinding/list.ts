import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, ClusterRoleBindingList, ClusterRoleBinding } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetClusterRoleBindingList(listNamespacedClusterRoleBinding: k8s.V1ClusterRoleBindingList): ClusterRoleBindingList {

    const items: ClusterRoleBinding[] = []

    const att_totalItems = listNamespacedClusterRoleBinding.items.length || 0
    listNamespacedClusterRoleBinding.items.forEach(item => {
        items.push({
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
                kind: listNamespacedClusterRoleBinding.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        items: items
    } as ClusterRoleBindingList

}