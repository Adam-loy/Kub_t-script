import * as k8s from '@kubernetes/client-node'; 
import {   LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetPodLogList(listNamespacedPod: k8s.V1PodList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const Pod = listNamespacedPod.items.find(item => item.metadata?.name === resourceName);
    if (!Pod) return logSources;
  
    logSources.podNames.push(Pod.metadata?.name || '');
    logSources.containerNames = (Pod.spec?.containers || []).map(c => c.name || '')
    logSources.initContainerNames = (Pod.spec?.initContainers || []).map(c => c.name || '')


    return logSources

}