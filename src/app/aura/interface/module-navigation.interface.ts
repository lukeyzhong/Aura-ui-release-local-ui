// GlobalModuleResultResponse interface
export interface GlobalModuleResultResponse {
    errorCode: number;
    errorMessage: string;
    result: GlobalModuleResult;
}

// GlobalModuleResult interface
export interface GlobalModuleResult {
    moduleId: string;
    name: string;
    displayValue: string;
    displayOrder: number;
    url: string;
    menuItems: GlobalSubModuleResult[];
    enabled: boolean;
}

// GlobalSubModuleResult interface
export interface GlobalSubModuleResult {
    menuItemId: string;
    name: string;
    displayValue: string;
    displayOrder: number;
    moduleId: string;
    parentMenuItemId: string;
    imagePath: string;
    url: string;
    querystring: string;
    menuItems: GlobalSubModuleResult[];
}
