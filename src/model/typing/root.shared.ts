export interface AppError {
	status: string;
	code: number;
	message: string;

	localize(): AppError;
}

export enum SupportedResources {
	ConfigMap = "ConfigMap",
	Secret = "Secret",
	PersistentVolumeClaim = "PersistentVolumeClaim",
}

export namespace SupportedResources {
	export function isSupported(sourceType: string): boolean {
		return Object.values(SupportedResources)
			.map((r) => r as string)
			.includes(sourceType);
	}
}
export interface StringMap {
	[key: string]: string;
}
