import * as k8s from "@kubernetes/client-node";

    // Initialize Kubernetes configuration
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault(); // Load kubeconfig from default path or environment
    const apisApi = kc.makeApiClient(k8s.ApisApi);
    const discoveryApi = kc.makeApiClient(k8s.DiscoveryV1Api); 

export async function getGroupAndVersion(kind: string, name: string): Promise<{ group: string; version: string } | null> {
    try{

        // Fetch all api for group and version
        const apiGroupResponse = apisApi.getAPIVersions();
        const apiGroup = (await apiGroupResponse).groups 
        
        for(const group of apiGroup){
            for (const version of group.versions) {
                const groupName = group.name || '';
                const versionName = version.version;

                // Fetcch API Resource for this group and version
                const resourceList = discoveryApi.getAPIResources({
                    group: groupName,
                    version: versionName
                }) // this query parameter could be rong there is no implementation for a parameter in this function
            
                // if you think there is somethink rong i think because the kind need to be a plural 's' at the end
                for (const resource of (await resourceList).resources ){
                    if (kind === resource.kind && resource.name === name) {
                        return {
                            group: resource.group || '',
                            version: resource.version || '',
                        }
                    }
                }
            }
        }


    } catch(err) {
        console.error("Error fetching group and version for kind:", err)
        return null;
    }
    return null;
}