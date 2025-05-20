import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, SecretList, Secret } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetSecretList(listNamespacedSecret: k8s.V1SecretList): SecretList {

    const att_totalItems = listNamespacedSecret.items.length || 0

    const secrets: Secret[] = [];

    const items = listNamespacedSecret.items.forEach(item => {
        secrets.push({
            type: item.type || '',
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
                kind: listNamespacedSecret.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });


    return {
        listMeta: {
            totalItems: att_totalItems
        },
        secrets: secrets,
    } as SecretList

}