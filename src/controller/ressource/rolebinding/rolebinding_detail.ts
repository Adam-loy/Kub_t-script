import * as k8s from '@kubernetes/client-node'; 
import {  K8sError, ResourceRef, RoleBindingDetail, Subject } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export  function GetRoleBindingDetail(RoleBinding: k8s.V1RoleBinding): RoleBindingDetail {

    const errors: K8sError[] = [];

    const roleBinding: RoleBindingDetail = {
        subjects: RoleBinding.subjects as Subject[],
        roleRef: RoleBinding.roleRef as ResourceRef ,
        objectMeta: {
            name: RoleBinding.metadata?.name || '',
            namespace: RoleBinding.metadata?.namespace,
            labels: RoleBinding.metadata?.labels,
            annotations: RoleBinding.metadata?.annotations,
            creationTimestamp: RoleBinding.metadata?.creationTimestamp,
            uid: RoleBinding.metadata?.uid,
            ownerReferences: RoleBinding.metadata?.ownerReferences,
        },
        typeMeta: {
            apiVersion: RoleBinding.apiVersion || 'v1',
            kind: RoleBinding.kind || 'RoleBinding',
            scalable: false,
            restartable: false,
        },
        errors: errors,

       }

    return roleBinding as RoleBindingDetail

} 