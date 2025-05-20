import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, NodeList, Node } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetNodeList(listNamespacedNode: k8s.V1NodeList): NodeList {

    const att_totalItems = listNamespacedNode.items.length || 0
    const nodes: Node[] = [];
    listNamespacedNode.items.map(item => {

        const readyCondition = item.status?.conditions?.find(cond => cond.type === "Ready");

        nodes.push({
            ready: readyCondition?.status === 'True' ? 'True' : 'False',
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
                kind: listNamespacedNode.kind || '',
                scalable: false,
                restartable: false,
            }
        })
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        nodes: nodes,
    } as NodeList

}