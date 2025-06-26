import * as k8s from '@kubernetes/client-node'; 
import {  Endpoint, EndpointList, K8sError, PodList, ResourceRef, ServiceDetail, Subject } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetServiceDetail(Service: k8s.V1Service): ServiceDetail {

    const errors: K8sError[] = [];

    const service: ServiceDetail = {
        internalEndpoint: {} as Endpoint, // Not Implemented
        externalEndpoints: [] as Endpoint[] ,// Not Implemented
        endpointList: {} as EndpointList, // Not Implemented
        selector: Service.spec?.selector || {} as StringMap, // Not Implemented
        type: Service.spec?.type || '' ,
        clusterIP: Service.spec?.clusterIP || '',
        podList: {} as PodList, // Not Implemented
        sessionAffinity: Service.spec?.sessionAffinity || '',
        objectMeta: {
            name: Service.metadata?.name || '',
            namespace: Service.metadata?.namespace,
            labels: Service.metadata?.labels,
            annotations: Service.metadata?.annotations,
            creationTimestamp: Service.metadata?.creationTimestamp,
            uid: Service.metadata?.uid,
            ownerReferences: Service.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Service.apiVersion || 'v1',
            kind: Service.kind || 'Service',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return service as ServiceDetail

} 