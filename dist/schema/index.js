import { gql } from 'graphql-tag';
export const typeDefs = gql `
  scalar DateTime

  enum UserRole {
    CUSTOMER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    READY
    DELIVERED
    CANCELLED
  }

  enum OrderType {
    DELIVERY
    PICKUP
  }

  enum CateringStatus {
    INQUIRY
    QUOTED
    CONFIRMED
    COMPLETED
    CANCELLED
  }

  type User {
    id: ID!
    email: String!
    username: String!
    phone: String!
    role: UserRole!
    isVerified: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    orders: [Order!]!
    reviews: [Review!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Category {
    id: ID!
    name: String!
    description: String
    imageUrl: String
    isActive: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
    menuItems: [MenuItem!]!
  }

  type MenuItem {
    id: ID!
    name: String!
    description: String!
    price: Float!
    imageUrl: String
    isAvailable: Boolean!
    isSpicy: Boolean!
    isVegetarian: Boolean!
    prepTime: Int
    categoryId: String!
    createdAt: DateTime!
    updatedAt: DateTime!
    category: Category!
  }

  type Order {
    id: ID!
    orderNumber: String!
    userId: String!
    type: OrderType!
    status: OrderStatus!
    totalAmount: Float!
    deliveryFee: Float
    customerName: String!
    customerPhone: String!
    customerEmail: String!
    deliveryAddress: String
    deliveryNotes: String
    paymentStatus: String!
    paymentMethod: String
    stripePaymentId: String
    requestedTime: DateTime
    estimatedTime: DateTime
    deliveredAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
    items: [OrderItem!]!
  }

  type OrderItem {
    id: ID!
    orderId: String!
    menuItemId: String!
    quantity: Int!
    price: Float!
    notes: String
    createdAt: DateTime!
    menuItem: MenuItem!
  }

  type CateringInquiry {
    id: ID!
    userId: String
    name: String!
    email: String!
    phone: String!
    eventType: String!
    eventDate: DateTime!
    guestCount: Int!
    location: String!
    requirements: String!
    budget: Float
    status: CateringStatus!
    quotedAmount: Float
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User
  }

  type Review {
    id: ID!
    userId: String!
    rating: Int!
    comment: String!
    isApproved: Boolean!
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type Gallery {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    category: String!
    isActive: Boolean!
    sortOrder: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Settings {
    id: ID!
    key: String!
    value: String!
    description: String
    updatedAt: DateTime!
  }

  # Input Types
  input RegisterInput {
    email: String!
    username: String!
    phone: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateMenuItemInput {
    name: String!
    description: String!
    price: Float!
    imageUrl: String
    isSpicy: Boolean = false
    isVegetarian: Boolean = false
    prepTime: Int
    categoryId: String!
  }

  input UpdateMenuItemInput {
    name: String
    description: String
    price: Float
    imageUrl: String
    isAvailable: Boolean
    isSpicy: Boolean
    isVegetarian: Boolean
    prepTime: Int
    categoryId: String
  }

  input CreateCategoryInput {
    name: String!
    description: String
    imageUrl: String
    sortOrder: Int = 0
  }

  input UpdateCategoryInput {
    name: String
    description: String
    imageUrl: String
    isActive: Boolean
    sortOrder: Int
  }

  input OrderItemInput {
    menuItemId: String!
    quantity: Int!
    notes: String
  }

  input CreateOrderInput {
    type: OrderType!
    items: [OrderItemInput!]!
    customerName: String!
    customerPhone: String!
    customerEmail: String!
    deliveryAddress: String
    deliveryNotes: String
    requestedTime: DateTime
    paymentMethod: String!
  }

  input UpdateOrderStatusInput {
    status: OrderStatus!
    estimatedTime: DateTime
  }

  input CreateCateringInquiryInput {
    name: String!
    email: String!
    phone: String!
    eventType: String!
    eventDate: DateTime!
    guestCount: Int!
    location: String!
    requirements: String!
    budget: Float
  }

  input CreateReviewInput {
    rating: Int!
    comment: String!
  }

  input CreateGalleryInput {
    title: String!
    description: String
    imageUrl: String!
    category: String!
    sortOrder: Int = 0
  }

  input UpdateGalleryInput {
    title: String
    description: String
    imageUrl: String
    category: String
    isActive: Boolean
    sortOrder: Int
  }

  # Queries
  type Query {
    # Auth & User
    me: User
    users: [User!]! # Admin only

    # Menu
    categories: [Category!]!
    category(id: ID!): Category
    menuItems: [MenuItem!]!
    menuItem(id: ID!): MenuItem
    menuItemsByCategory(categoryId: ID!): [MenuItem!]!
    availableMenuItems: [MenuItem!]!

    # Orders
    orders: [Order!]! # Admin gets all, users get their own
    order(id: ID!): Order
    orderByNumber(orderNumber: String!): Order

    # Catering
    cateringInquiries: [CateringInquiry!]! # Admin gets all, users get their own
    cateringInquiry(id: ID!): CateringInquiry

    # Reviews
    reviews: [Review!]!
    approvedReviews: [Review!]!
    review(id: ID!): Review

    # Gallery
    galleryItems: [Gallery!]!
    galleryItem(id: ID!): Gallery
    galleryByCategory(category: String!): [Gallery!]!

    # Settings
    settings: [Settings!]! # Admin only
    setting(key: String!): Settings
  }

  # Mutations
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Menu Management (Admin only)
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    createMenuItem(input: CreateMenuItemInput!): MenuItem!
    updateMenuItem(id: ID!, input: UpdateMenuItemInput!): MenuItem!
    deleteMenuItem(id: ID!): Boolean!

    # Orders
    createOrder(input: CreateOrderInput!): Order!
    updateOrderStatus(id: ID!, input: UpdateOrderStatusInput!): Order! # Admin only
    cancelOrder(id: ID!): Order!

    # Catering
    createCateringInquiry(input: CreateCateringInquiryInput!): CateringInquiry!
    updateCateringStatus(id: ID!, status: CateringStatus!, quotedAmount: Float, notes: String): CateringInquiry! # Admin only

    # Reviews
    createReview(input: CreateReviewInput!): Review!
    approveReview(id: ID!): Review! # Admin only
    deleteReview(id: ID!): Boolean! # Admin only

    # Gallery (Admin only)
    createGalleryItem(input: CreateGalleryInput!): Gallery!
    updateGalleryItem(id: ID!, input: UpdateGalleryInput!): Gallery!
    deleteGalleryItem(id: ID!): Boolean!

    # Settings (Admin only)
    updateSetting(key: String!, value: String!): Settings!
  }
`;
