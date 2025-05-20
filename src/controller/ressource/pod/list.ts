import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { PodList, ObjectMeta, Status, Pod, PodInfo } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetPodList(listNamespacedPod: k8s.V1PodList): PodList {

    const att_totalItems = listNamespacedPod.items.length || 0
    
    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0}
    const pods: Pod[] = []
    const podInfo: PodInfo = {
        current: 0,
        desired: att_totalItems,
        running: 0,
        pending: 0,
        failed: 0,
        succeeded: 0,
        warnings: []
    };

    listNamespacedPod.items.map(item => {
        const phase = item.status?.phase || '';
        if (phase === 'Running') {
            status.running += 1;
            podInfo.running += 1;
            podInfo.current += 1;
        } else if (phase === 'Pending') {
            status.pending += 1;
            podInfo.pending += 1;
            podInfo.current += 1;
        } else if (phase === 'Failed') {
            status.failed += 1;
            podInfo.failed += 1;
        } else if (phase === 'Succeeded') {
            status.succeeded += 1;
            podInfo.succeeded += 1;
        }
  
        // Restart count: sum all container and init container restart counts
        const restartCount = [
            ...(item.status?.containerStatuses || []),
            ...(item.status?.initContainerStatuses || [])
        ].reduce((acc, cs) => acc + (cs.restartCount || 0), 0);

        pods.push({
            status: phase,
            podIP: item.status?.podIP,
            restartCount: restartCount,
            qosClass: item.status?.qosClass,
            metrics: {
                cpuUsage: 0,
                memoryUsage: 0,
                cpuUsageHistory: [{timestamp: new Date(), value: 0}],
                memoryUsageHistory: [{timestamp: new Date(), value: 0}]
            }, 
            warnings: [], 
            nodeName: item.spec?.nodeName || '',
            serviceAccountName: item.spec?.serviceAccountName ||'',
            containerImages: item.spec?.containers?.map(c => c.image || '') || [],
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
                kind: listNamespacedPod.kind || '',
                scalable: false,
                restartable: true,
            }
        })

    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        pods: pods,
        podInfo: podInfo,
        status: status
    } as PodList

}