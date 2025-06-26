import * as k8s from '@kubernetes/client-node'; 
import {  K8sError, PolicyRule, RoleDetail } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetRoleDetail(Role: k8s.V1Role): RoleDetail {

    const errors: K8sError[] = [];

    const role: RoleDetail = {
        rules: Role.rules as PolicyRule[], 
        objectMeta: {
            name: Role.metadata?.name || '',
            namespace: Role.metadata?.namespace,
            labels: Role.metadata?.labels,
            annotations: Role.metadata?.annotations,
            creationTimestamp: Role.metadata?.creationTimestamp,
            uid: Role.metadata?.uid,
            ownerReferences: Role.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: Role.apiVersion || 'v1',
            kind: Role.kind || 'Role',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return role as RoleDetail

} 