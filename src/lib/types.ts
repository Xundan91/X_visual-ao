export type Tag = { name: string; value: string };

export type TDependencies = {
    [key: string]: {
        "version": string
    }
}

export type TPackage = {
    ID: string
    Vendor: string
    Name: string
    Version: string
    Versions?: string[]
    Description: string
    Owner: string
    Readme: string
    PkgID: string
    Source: string
    Authors: string[] | string
    Dependencies: TDependencies | string
    Repository: string
    Timestamp: number
    Installs: number
    TotalInstalls: number
    Keywords: string[]
    IsFeatured: boolean
    Warnings: {
        modifiesGlobalState: boolean
        installMessage: string
    } | string
    License: string
    Main?: string
    ////////////
    installed: boolean
}