

enum env  {
    userAgent = "dashboard-web",
    dev = "0.0.0-dev"
}

export function getUserAgent(): string {
    return env.userAgent + env.dev;
}

export function getVersion(): string {
    return env.dev
}