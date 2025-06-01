import { Context } from '../utils/auth.js';
export declare const settingsResolvers: {
    Query: {
        settings: (_: unknown, __: unknown, context: Context) => Promise<{
            id: string;
            updatedAt: Date;
            description: string | null;
            value: string;
            key: string;
        }[]>;
        setting: (_: unknown, { key }: {
            key: string;
        }) => Promise<{
            id: string;
            updatedAt: Date;
            description: string | null;
            value: string;
            key: string;
        }>;
    };
    Mutation: {
        updateSetting: (_: unknown, { key, value }: {
            key: string;
            value: string;
        }, context: Context) => Promise<{
            id: string;
            updatedAt: Date;
            description: string | null;
            value: string;
            key: string;
        }>;
    };
};
