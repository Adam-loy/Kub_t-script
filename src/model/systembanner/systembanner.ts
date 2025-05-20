

export interface SystemBanner {
    message: string,
    severity: string
}

enum BannerValue {
    SystemBannerSeverityInfo = "INFO",
    SystemBannerSeverityWarning = "WARNING",
    SystemBannerSeverityError = "ERROR"
}

export function toSystemBannerSeverity (severity: string): string{
    switch ( severity){
        case BannerValue.SystemBannerSeverityWarning:
            return BannerValue.SystemBannerSeverityWarning;
        case BannerValue.SystemBannerSeverityError:
            return BannerValue.SystemBannerSeverityError
        default:
            return BannerValue.SystemBannerSeverityInfo
    }
    
}