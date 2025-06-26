import * as k8s from '@kubernetes/client-node'; 
import {   LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetStatefulSetLogList(listNamespacedStatefulSet: k8s.V1StatefulSetList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const StatefulSet = listNamespacedStatefulSet.items.find(item => item.metadata?.name === resourceName);
    if (!StatefulSet) return logSources;
  
    const template = StatefulSet.spec?.template;
    if (!template) return logSources;
  
    logSources.podNames.push(template.metadata?.name || '');
    logSources.containerNames = (StatefulSet.spec?.template?.spec?.containers || []).map(c => c.name || '')
    logSources.initContainerNames = (StatefulSet.spec?.template?.spec?.initContainers || []).map(c => c.name || '')


    return logSources

}