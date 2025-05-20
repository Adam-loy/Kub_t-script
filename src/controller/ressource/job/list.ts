import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, Status, JobList, Job } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetJobList(listNamespacedJob: k8s.V1JobList): JobList {

    const att_totalItems = listNamespacedJob.items.length || 0;

    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0};
    const jobs: Job[] = [];

    listNamespacedJob.items.forEach(item => {

        const desired = item.spec?.completions ?? 1;
        const running = item.status?.active || 0;
        const failed = item.status?.failed || 0;
        const succeeded = item.status?.succeeded || 0;
        const pending = Math.max(desired - succeeded - failed - running, 0);


        jobs.push({
            containerImages: (item.spec?.template.spec?.containers || [])
                .map(c => c.image)
                .filter((img): img is string => !!img),
            initContainerImages: (item.spec?.template.spec?.initContainers || [])
                .map(c => c.image)
                .filter((img): img is string => !!img),
            podInfo: {
                current: running,
                desired: desired,
                running: running,
                pending: pending,
                failed: failed,
                succeeded: succeeded,
                warnings: [] // fill it later if needed
            },
            parallelism: item.spec?.parallelism || 0,
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
                kind: listNamespacedJob.kind || '',
                scalable: false,
                restartable: false,
            },
        });

        status.running += running;
        status.failed += failed;
        status.pending += pending;
        status.succeeded += succeeded;
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        jobs: jobs,
        status: status
    } as JobList;
}