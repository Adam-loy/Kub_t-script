import * as k8s from '@kubernetes/client-node'; 
import {   LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetReplicationControllerLogList(listNamespacedReplicationController: k8s.V1ReplicationControllerList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const ReplicationController = listNamespacedReplicationController.items.find(item => item.metadata?.name === resourceName);
    if (!ReplicationController) return logSources;
  
    const template = ReplicationController.spec?.template;
    if (!template) return logSources;
  
    logSources.podNames.push(template.metadata?.name || '');
    logSources.containerNames = (ReplicationController.spec?.template?.spec?.containers || []).map(c => c.name || '')
    logSources.initContainerNames = (ReplicationController.spec?.template?.spec?.initContainers || []).map(c => c.name || '')


    return logSources

}