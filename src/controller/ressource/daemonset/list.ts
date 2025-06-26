import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, DaemonSetList, DaemonSet, Status } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetDaemonSetList(listNamespacedDaemonSet: k8s.V1DaemonSetList): DaemonSetList {

    const att_totalItems = listNamespacedDaemonSet.items.length || 0
    
    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0}
    const daemonSets: DaemonSet[] = []

    listNamespacedDaemonSet.items.forEach(item => {
        // Extracting pod number with fallback to 0 
        const desired = item.status?.desiredNumberScheduled || 0;
        const running = item.status?.currentNumberScheduled || 0;
        const pending = Math.max(desired - running, 0);
        const failed = item.status?.numberUnavailable || 0;  
        const succeeded = item.status?.numberAvailable || 0 ;

        daemonSets.push({
            containerImages: item.spec?.template.spec?.containers.map(c => c.image || '') || [],
            initContainerImages: item.spec?.template.spec?.containers.map(c => c.image || '') || [],
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
                apiVersion: item.apiVersion || 'apps/v1',
                kind: item.kind || 'DaemonSet',
                scalable: false,
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
        daemonSets: daemonSets,
        status: status
    } as DaemonSetList
}