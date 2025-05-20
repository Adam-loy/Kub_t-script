import { Request, response, Response } from 'express';
import * as k8s from '@kubernetes/client-node'; 
import { ResourceList, ObjectMeta, CronJobList, CronJob, Status } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetCronJobList(listNamespacedCronJob: k8s.V1CronJobList): CronJobList {

    const att_totalItems = listNamespacedCronJob.items.length || 0

    const status: Status = {running: 0, failed: 0, pending: 0, succeeded: 0}
    const items: CronJob[] = [] 

    listNamespacedCronJob.items.forEach(item => {
        const active = item.status?.active?.length || 0

        items.push({
            containerImages: (item.spec?.jobTemplate?.spec?.template.spec?.containers || []).map(c => c.image || ''),
            schedule: item.spec?.schedule || '',
            suspend: item.spec?.suspend || false ,
            active: active , // work here
            lastSchedule: item.status?.lastScheduleTime || new Date() ,
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
                kind: listNamespacedCronJob.kind || '',
                scalable: false,
                restartable: false,
            }
        })

        status.running += active
    });

    return {
        listMeta: {
            totalItems: att_totalItems
        },
        items: items,
        status: status
    } as CronJobList

}