import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { PodList, ObjectMeta, Status, Pod, PodInfo } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetPodList(Pods: k8s.PodStatus[]): PodList {

    const att_totalItems = Pods.length || 0
     
    
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

    Pods.map(item => {
        const phase = item.Pod.status?.phase || '';
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
            ...(item.Pod.status?.containerStatuses || []),
            ...(item.Pod.status?.initContainerStatuses || [])
        ].reduce((acc, cs) => acc + (cs.restartCount || 0), 0);

        pods.push({
            status: phase,
            podIP: item.Pod.status?.podIP,
            restartCount: restartCount,
            qosClass: item.Pod.status?.qosClass,
            metrics: {
                cpuUsage: Number(item.CPU.CurrentUsage),
                cpuLimitTotal: Number(item.CPU.LimitTotal),
                cpuRequestTotal: Number(item.CPU.RequestTotal),
                memoryUsage: Number(item.Memory.CurrentUsage),
                memoryRequestTotal: Number(item.Memory.RequestTotal),
                memoryTotalRequest: Number(item.Memory.LimitTotal),
                cpuUsageHistory: [{timestamp: new Date(), value: 0}],
                memoryUsageHistory: [{timestamp: new Date(), value: 0}]
            },
            warnings: [], 
            nodeName: item.Pod.spec?.nodeName || '',
            serviceAccountName: item.Pod.spec?.serviceAccountName ||'',
            containerImages: item.Pod.spec?.containers?.map(c => c.image || '') || [],
            objectMeta: {
                name: item.Pod.metadata?.name || '',
                namespace: item.Pod.metadata?.namespace,
                labels: item.Pod.metadata?.labels,
                annotations: item.Pod.metadata?.annotations,
                creationTimestamp: item.Pod.metadata?.creationTimestamp,
                uid: item.Pod.metadata?.uid,
                ownerReferences: item.Pod.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: item.Pod.apiVersion || 'v1',
                kind: item.Pod.kind || 'Pod',
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
