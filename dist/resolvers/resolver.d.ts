export declare const resolvers: {
    readonly Query: {
        readonly books: () => {
            title: string;
            author: string;
        }[];
        readonly reviews: () => {
            id: string;
            rating: number;
            content: string;
        }[];
        readonly games: () => {
            id: string;
            title: string;
            platform: string[];
        }[];
        readonly authors: () => {
            id: string;
            name: string;
            verified: boolean;
        }[];
    };
};
