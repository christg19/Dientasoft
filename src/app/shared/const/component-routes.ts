export interface ComponentRoutes {
    nameRoute:string;
    route: string;
    semantic: string[];
}

export const componentRoutes:ComponentRoutes[] = [
    {nameRoute: 'History', route: 'patients/history', semantic: ['library_books']}
]