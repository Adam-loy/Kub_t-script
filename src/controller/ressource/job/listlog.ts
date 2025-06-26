import * as k8s from '@kubernetes/client-node'; 
import {  JobList, Job, Status, LogSources } from '../../../model/typing/root.api';

const kubeclient = new k8s.KubeConfig();
kubeclient.loadFromDefault() ;// Will load your default kubeconfig (e.g., ~/.kube/config)


export function GetJobLogList(listNamespacedJob: k8s.V1JobList, resourceName: string): LogSources {

    const logSources: LogSources= {
        podNames: [],
        containerNames: [],
        initContainerNames: []
    };

    const Job = listNamespacedJob.items.find(item => item.metadata?.name === resourceName);
    if (!Job) return logSources;
  
    const template = Job.spec?.template
    if (!template) return logSources;
  
    logSources.podNames.push(template.metadata?.name || '');
  
    const spec = template.spec;
    if (spec) {
      logSources.containerNames = (spec.containers || []).map(c => c.name || '');
      logSources.initContainerNames = (spec.initContainers || []).map(c => c.name || '');
    }

    return logSources

}