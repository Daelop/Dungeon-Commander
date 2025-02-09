export interface Action {
    name: string;
    description: string;
    costs: {
        resource: string;
        amount: number;
    }
    effects: (context: unknown) => boolean;
}