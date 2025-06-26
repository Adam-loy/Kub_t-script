import * as k8s from '@kubernetes/client-node'; 
import { CronJobDetail, K8sError, Condition } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetCronJobDetail(CronJob: k8s.V1CronJob): CronJobDetail {
    let active = 0

    CronJob.status?.active?.map(act => {
        active += 1
    }) // Not the best think 
    const errors: K8sError[] = [];

    const cronJob: CronJobDetail = {
            schedule: CronJob.spec?.schedule || '',
            suspend: CronJob.spec?.suspend || false,
            active: active ,
            lastSchedule: CronJob.status?.lastScheduleTime?.toString() || '',
            concurrencyPolicy: CronJob.spec?.concurrencyPolicy || '',
            startingDeadlineSeconds: CronJob.spec?.startingDeadlineSeconds || 0,
            objectMeta: {
                name: CronJob.metadata?.name || '',
                namespace: CronJob.metadata?.namespace,
                labels: CronJob.metadata?.labels,
                annotations: CronJob.metadata?.annotations,
                creationTimestamp: CronJob.metadata?.creationTimestamp,
                uid: CronJob.metadata?.uid,
                ownerReferences: CronJob.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: CronJob.apiVersion || 'v1',
                kind: CronJob.kind || 'CronJob',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return cronJob as CronJobDetail

} 