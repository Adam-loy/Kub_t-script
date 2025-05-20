import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, RoleBinding, RoleBindingList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetRoleBindingList(listNamespacedRoleBinding: k8s.V1RoleBindingList): RoleBindingList {


    const items: RoleBinding[] = []

    const att_totalItems = listNamespacedRoleBinding.items.length || 0
    listNamespacedRoleBinding.items.forEach(item => {
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
                kind: listNamespacedRoleBinding.kind || '',
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
    } as RoleBindingList

}