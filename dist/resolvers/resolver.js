// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
import { books, games, reviews, authors } from "../data/data.js";
export const resolvers = {
    Query: {
        books: () => books,
        reviews: () => reviews,
        games: () => games, // Changed from "game" to "games"
        authors: () => authors,
    },
};
