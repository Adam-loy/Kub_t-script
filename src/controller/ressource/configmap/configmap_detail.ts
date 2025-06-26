import * as k8s from '@kubernetes/client-node'; 
import { ConfigMapDetail, K8sError, } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetConfigMapDetail(ConfigMap: k8s.V1ConfigMap): ConfigMapDetail {
    

    const errors: K8sError[] = [];

    const configMap: ConfigMapDetail = {
            data: ConfigMap.data as StringMap, 
            objectMeta: {
                name: ConfigMap.metadata?.name || '',
                namespace: ConfigMap.metadata?.namespace,
                labels: ConfigMap.metadata?.labels,
                annotations: ConfigMap.metadata?.annotations,
                creationTimestamp: ConfigMap.metadata?.creationTimestamp,
                uid: ConfigMap.metadata?.uid,
                ownerReferences: ConfigMap.metadata?.ownerReferences,
            },
            typeMeta: {
                apiVersion: ConfigMap.apiVersion || 'v1',
                kind: ConfigMap.kind || 'ConfigMap',
                scalable: false,
                restartable: false,
            },
            errors: errors,

       }

    return configMap as ConfigMapDetail

}