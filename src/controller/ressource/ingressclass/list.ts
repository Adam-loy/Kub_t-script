import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, IngressClassList, IngressClass,  } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetIngressClassList(listNamespacedIngressClass: k8s.V1IngressClassList): IngressClassList {

    const att_totalItems = listNamespacedIngressClass.items.length || 0

    const items: IngressClass[] = [];

    listNamespacedIngressClass.items.forEach(item => {
        items.push({
            controller: item.spec?.controller || '',
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
                apiVersion: item.apiVersion || 'networking.k8s.io/v1',
                kind: item.kind || 'IngressClass',
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
    } as IngressClassList

}