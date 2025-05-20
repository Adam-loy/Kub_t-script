import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, NamespaceList, Namespace, Resource } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)

// const items:Resource[]  = [];
const namespaces: Namespace[] = [];

export function GetNamespaceList(listNamespacedNamespace: k8s.V1NamespaceList): NamespaceList {

    const att_totalItems = listNamespacedNamespace.items.length || 0

    listNamespacedNamespace.items.forEach(item => {
        // Build the item object
    
        // Build the namespace object
        namespaces.push({
            phase: item.status?.phase || '',
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
                kind: listNamespacedNamespace.kind || '',
                scalable: false,
                restartable: false,
            }
        });
    });

    // not a good practice but for let's keep it like that 

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        namespaces: namespaces
    }  as NamespaceList

}