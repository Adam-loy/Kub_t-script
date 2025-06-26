import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, ServiceAccount, ServiceAccountList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetServiceAccountList(listNamespacedServiceAccount: k8s.V1ServiceAccountList): ServiceAccountList {

    const items: ServiceAccount[] = []

    const att_totalItems = listNamespacedServiceAccount.items.length || 0
    listNamespacedServiceAccount.items.forEach(item => {
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
                apiVersion: item.apiVersion || 'v1',
                kind: item.kind || 'ServiceAccount',
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
    } as ServiceAccountList

}