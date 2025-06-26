import * as k8s from '@kubernetes/client-node'; 
import {  K8sError, SecretDetail } from '../../../model/typing/root.api';
import { StringMap } from '../../../model/typing/root.shared';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetSecretDetail(Secret: k8s.V1Secret): SecretDetail {

    const errors: K8sError[] = [];

    const secret: SecretDetail = {
        type: Secret.type || '',
        data: Secret.data || {} as StringMap,
        objectMeta: {
            name: Secret.metadata?.name || '',
            namespace: Secret.metadata?.namespace,
            labels: Secret.metadata?.labels,
            annotations: Secret.metadata?.annotations,
            creationTimestamp: Secret.metadata?.creationTimestamp,
            uid: Secret.metadata?.uid,
            ownerReferences: Secret.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Secret.apiVersion || 'v1',
            kind: Secret.kind || 'Secret',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return secret as SecretDetail

} 