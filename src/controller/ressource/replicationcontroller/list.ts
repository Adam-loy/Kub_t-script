import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, ReplicationControllerList, ReplicationController, Status } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetReplicationControllerList(listNamespacedReplicationController: k8s.V1ReplicationControllerList): ReplicationControllerList {

    const att_totalItems = listNamespacedReplicationController.items.length || 0
    
    const  replicationControllers: ReplicationController[] = [];
    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0}
    
    listNamespacedReplicationController.items.forEach(item => {
        // Extracting pod number with fallback to 0 
        const desired = item.status?.replicas || 0;
        const running = item.status?.availableReplicas || 0;
        const pending = Math.max(desired - running, 0);
        const failed = 0; // Fix
        const succeeded = item.status?.readyReplicas || 0 ;

        replicationControllers.push({
            containerImages: item.spec?.template?.spec?.containers.map(c => c.image || '') || [],
            initContainerImages: item.spec?.template?.spec?.containers.map(c => c.image || '') || [],
            podInfo: {
                current: running,
                desired: desired,
                running: running,
                pending: pending,
                failed: failed,
                succeeded: succeeded,
                warnings: [] // fill it later
            },
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
                kind:  item.kind || 'ReplicationController',
                scalable: true,
                restartable: true,
            }
        })

        status.running += running
        status.failed += failed
        status.pending += pending
        status.succeeded += succeeded
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        replicationControllers: replicationControllers,
        status: status
    } as ReplicationControllerList

}