import * as k8s from '@kubernetes/client-node'; 
import {   LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetDaemonSetLogList(listNamespacedDaemonSet: k8s.V1DaemonSetList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const DaemonSet = listNamespacedDaemonSet.items.find(item => item.metadata?.name === resourceName);
    if (!DaemonSet) return logSources;
  
    const template = DaemonSet.spec?.template;
    if (!template) return logSources;
  
    logSources.podNames.push(template.metadata?.name || '');
    logSources.containerNames = (DaemonSet.spec?.template?.spec?.containers || []).map(c => c.name || '')
    logSources.initContainerNames = (DaemonSet.spec?.template?.spec?.initContainers || []).map(c => c.name || '')


    return logSources

}