export interface IModule {
    readonly name: string;
    readonly Component: React.ReactNode | JSX.Element | React.LazyExoticComponent<any> | any;
}