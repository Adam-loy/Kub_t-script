import * as k8s from '@kubernetes/client-node'; 
import {   LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetDeploymentLogList(listNamespacedDeployment: k8s.V1DeploymentList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const Deployment = listNamespacedDeployment.items.find(item => item.metadata?.name === resourceName);
    if (!Deployment) return logSources;
  
    const template = Deployment.spec?.template;
    if (!template) return logSources;
  
    logSources.podNames.push(template.metadata?.name || '');
    logSources.containerNames = (Deployment.spec?.template?.spec?.containers || []).map(c => c.name || '')
    logSources.initContainerNames = (Deployment.spec?.template?.spec?.initContainers || []).map(c => c.name || '')


    return logSources

}