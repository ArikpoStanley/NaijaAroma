import { Context } from './utils/auth.js';
interface ContextInput {
    req: {
        headers: {
            authorization?: string;
        };
    };
}
export declare function createContext({ req }: ContextInput): Promise<Context>;
export {};
