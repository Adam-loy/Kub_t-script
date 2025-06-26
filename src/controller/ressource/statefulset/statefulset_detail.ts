import * as k8s from '@kubernetes/client-node'; 
import {  Endpoint, EndpointList, EventList, K8sError, PodInfo, PodList, StatefulSetDetail, Subject } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetStatefulSetDetail(StatefulSet: k8s.V1StatefulSet): StatefulSetDetail {

    const errors: K8sError[] = [];

    const statefulSet: StatefulSetDetail = {
        labelSelector: StatefulSet.metadata?.labels,
        podInfo: {} as PodInfo , // Not Implemented
        podList: {} as PodList,  // Not Implemented
        containerImages: [] ,  // Not Implemented
        initContainerImages: [],  // Not Implemented
        eventList: {} as EventList,  // Not Implemented
        objectMeta: {
            name: StatefulSet.metadata?.name || '',
            namespace: StatefulSet.metadata?.namespace,
            labels: StatefulSet.metadata?.labels,
            annotations: StatefulSet.metadata?.annotations,
            creationTimestamp: StatefulSet.metadata?.creationTimestamp,
            uid: StatefulSet.metadata?.uid,
            ownerReferences: StatefulSet.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: StatefulSet.apiVersion || 'v1',
            kind: StatefulSet.kind || 'StatefulSet',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return statefulSet as StatefulSetDetail

} 