import * as k8s from '@kubernetes/client-node'; 
import { Condition, EventList, JobDetail, JobStatus, K8sError, PodInfo, PodList } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetJobDetail(Job: k8s.V1Job): JobDetail {

    const errors: K8sError[] = [];

    const job: JobDetail = {
            podInfo: {} as PodInfo , // Not Implemented
            podList: {} as PodList, // Not Implemented
            containerImages: Job.spec?.template.spec?.containers.map(container => {
                return container.image || ''
            }) || [],
            initContainerImages: [], // Not Implemented
            parallelism: Job.spec?.parallelism || 0,
            completions: Job.spec?.completions || 0,
            jobStatus: {
                message: '',// Not Implemented
                status: '',// Not Implemented 
                conditions: Job.status?.conditions as Condition[]
            } as JobStatus,
            eventList: {
                // Not Implemented
            } as EventList ,
            objectMeta: {
                name: Job.metadata?.name || '',
                namespace: Job.metadata?.namespace,
                labels: Job.metadata?.labels,
                annotations: Job.metadata?.annotations,
                creationTimestamp: Job.metadata?.creationTimestamp,
                uid: Job.metadata?.uid,
                ownerReferences: Job.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: Job.apiVersion || 'v1',
                kind: Job.kind || 'Job',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return job as JobDetail

} 