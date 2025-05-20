import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, CRDList, CRD } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetCustomeResourceDefenitionList(listNamespacedCustomeResourceDefenition: k8s.V1CustomResourceDefinitionList): CRDList {

    const att_totalItems = listNamespacedCustomeResourceDefenition.items.length || 0
    const items: CRD[] = []
    listNamespacedCustomeResourceDefenition.items.forEach(item => {
        // Find the "Established" condition in the status.conditions array
        const establishedCondition = item.status?.conditions?.find(
            (cond) => cond.type === 'Established'
        );

        items.push({
            group: item.spec.group || '',
            scope: item.spec.scope || '',
            nameKind: item.spec.names.kind ,
            established: establishedCondition?.type === 'True' ? 'True' : 'False' , //work here 
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
                kind: listNamespacedCustomeResourceDefenition.kind || '',
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
    } as CRDList

}