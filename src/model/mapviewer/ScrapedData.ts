import * as k8s from '@kubernetes/client-node'; 

export interface ScrapedData {
    pods: k8s.V1PodList;
    services: k8s.V1ServiceList;
    endpoints: k8s.V1EndpointsList;
    pvs: k8s.V1PersistentVolumeList;
    pvcs: k8s.V1PersistentVolumeClaimList;
    configmaps: k8s.V1ConfigMapList;
    secrets: k8s.V1SecretList;
    deployments: k8s.V1DeploymentList;
    daemonsets: k8s.V1DaemonSetList;
    replicasets: k8s.V1ReplicaSetList;
    statefulsets: k8s.V1StatefulSetList;
    ingresses: k8s.V1IngressList;
}

// make this for developer

// add one more for team manager and have those missing 
/*
Jobs	For batch processing (and also CronJobs create these)
CronJobs	If you’re managing scheduled tasks
HorizontalPodAutoscalers	If you use autoscaling based on metrics
NetworkPolicies	For understanding network access rules
ResourceQuotas & LimitRanges	For namespace-level resource enforcement
IngressClasses	If you're working with Ingress objects
Roles & RoleBindings	RBAC security-related info (per namespace)
ServiceAccounts	Who your pods run as (and access rights)
*/