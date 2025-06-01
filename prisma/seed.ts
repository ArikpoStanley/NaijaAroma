import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@naijaaroma.com' },
    update: {},
    create: {
      email: 'admin@naijaaroma.com',
      username: 'admin',
      phone: '+2348000000000',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
    },
  });
  console.log('✅ Admin user created');

  // Create test customer
  const customerPassword = await bcrypt.hash('Customer123!', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      username: 'testcustomer',
      phone: '+2348123456789',
      password: customerPassword,
      role: 'CUSTOMER',
      isVerified: true,
    },
  });
  console.log('✅ Test customer created');

  // Create categories
  const categories = [
    {
      name: 'Rice Dishes',
      description: 'Delicious Nigerian rice dishes',
      sortOrder: 1,
    },
    {
      name: 'Soups & Stews',
      description: 'Traditional Nigerian soups and stews',
      sortOrder: 2,
    },
    {
      name: 'Grilled & Fried',
      description: 'Grilled and fried Nigerian delicacies',
      sortOrder: 3,
    },
    {
      name: 'Swallow',
      description: 'Nigerian swallow foods',
      sortOrder: 4,
    },
    {
      name: 'Snacks & Sides',
      description: 'Nigerian snacks and side dishes',
      sortOrder: 5,
    },
    {
      name: 'Beverages',
      description: 'Traditional and modern Nigerian drinks',
      sortOrder: 6,
    },
  ];

  const createdCategories: Array<{
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }> = [];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: categoryData,
    });
    createdCategories.push(category);
  }
  console.log('✅ Categories created');

  // Create menu items
  const menuItems = [
    // Rice Dishes
    {
      name: 'Jollof Rice',
      description: 'Nigeria\'s famous one-pot rice dish cooked in a rich tomato base with spices',
      price: 1500,
      categoryName: 'Rice Dishes',
      isSpicy: true,
      prepTime: 30,
    },
    {
      name: 'Fried Rice',
      description: 'Colorful Nigerian fried rice with mixed vegetables and protein',
      price: 1800,
      categoryName: 'Rice Dishes',
      prepTime: 25,
    },
    {
      name: 'Coconut Rice',
      description: 'Fragrant rice cooked in coconut milk with spices',
      price: 1600,
      categoryName: 'Rice Dishes',
      prepTime: 35,
    },

    // Soups & Stews
    {
      name: 'Egusi Soup',
      description: 'Traditional Nigerian soup made with ground melon seeds and leafy vegetables',
      price: 2000,
      categoryName: 'Soups & Stews',
      isSpicy: true,
      prepTime: 45,
    },
    {
      name: 'Pepper Soup',
      description: 'Spicy Nigerian soup perfect for cold weather',
      price: 1800,
      categoryName: 'Soups & Stews',
      isSpicy: true,
      prepTime: 30,
    },
    {
      name: 'Okra Soup',
      description: 'Delicious soup made with fresh okra and assorted meat',
      price: 1900,
      categoryName: 'Soups & Stews',
      prepTime: 40,
    },

    // Grilled & Fried
    {
      name: 'Suya',
      description: 'Spicy grilled beef skewers with Nigerian suya spice',
      price: 2500,
      categoryName: 'Grilled & Fried',
      isSpicy: true,
      prepTime: 20,
    },
    {
      name: 'Grilled Fish',
      description: 'Fresh fish grilled to perfection with Nigerian spices',
      price: 3000,
      categoryName: 'Grilled & Fried',
      prepTime: 25,
    },
    {
      name: 'Fried Plantain',
      description: 'Sweet ripe plantains fried to golden perfection',
      price: 800,
      categoryName: 'Grilled & Fried',
      isVegetarian: true,
      prepTime: 10,
    },

    // Swallow
    {
      name: 'Pounded Yam',
      description: 'Traditional Nigerian swallow made from yam',
      price: 1200,
      categoryName: 'Swallow',
      isVegetarian: true,
      prepTime: 20,
    },
    {
      name: 'Eba (Garri)',
      description: 'Popular Nigerian swallow made from cassava flour',
      price: 800,
      categoryName: 'Swallow',
      isVegetarian: true,
      prepTime: 5,
    },
    {
      name: 'Fufu',
      description: 'Soft Nigerian swallow made from cassava',
      price: 1000,
      categoryName: 'Swallow',
      isVegetarian: true,
      prepTime: 15,
    },

    // Snacks & Sides
    {
      name: 'Puff Puff',
      description: 'Sweet Nigerian doughnuts',
      price: 500,
      categoryName: 'Snacks & Sides',
      isVegetarian: true,
      prepTime: 15,
    },
    {
      name: 'Chin Chin',
      description: 'Crunchy Nigerian snack',
      price: 600,
      categoryName: 'Snacks & Sides',
      isVegetarian: true,
      prepTime: 5,
    },
    {
      name: 'Meat Pie',
      description: 'Nigerian pastry filled with seasoned meat',
      price: 800,
      categoryName: 'Snacks & Sides',
      prepTime: 10,
    },

    // Beverages
    {
      name: 'Zobo',
      description: 'Refreshing Nigerian hibiscus drink',
      price: 500,
      categoryName: 'Beverages',
      isVegetarian: true,
      prepTime: 5,
    },
    {
      name: 'Chapman',
      description: 'Nigerian cocktail drink with fruits',
      price: 800,
      categoryName: 'Beverages',
      isVegetarian: true,
      prepTime: 5,
    },
    {
      name: 'Palm Wine',
      description: 'Traditional Nigerian alcoholic beverage',
      price: 1000,
      categoryName: 'Beverages',
      prepTime: 2,
    },
  ];

  for (const itemData of menuItems) {
    const category = createdCategories.find(cat => cat.name === itemData.categoryName);
    if (category) {
      // For MongoDB, we need to check if the item exists first
      const existingItem = await prisma.menuItem.findFirst({
        where: {
          name: itemData.name,
          categoryId: category.id,
        },
      });

      if (!existingItem) {
        await prisma.menuItem.create({
          data: {
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            categoryId: category.id,
            isSpicy: itemData.isSpicy || false,
            isVegetarian: itemData.isVegetarian || false,
            prepTime: itemData.prepTime,
          },
        });
      }
    } else {
      console.warn(`⚠️ Category not found for item: ${itemData.name}`);
    }
  }
  console.log('✅ Menu items created');

  // Create sample gallery items
  const galleryItems = [
    {
      title: 'Delicious Jollof Rice',
      description: 'Our signature jollof rice served with grilled chicken',
      imageUrl: '/uploads/gallery/jollof-rice.jpg',
      category: 'food',
      sortOrder: 1,
    },
    {
      title: 'Traditional Egusi Soup',
      description: 'Authentic egusi soup with assorted meat',
      imageUrl: '/uploads/gallery/egusi-soup.jpg',
      category: 'food',
      sortOrder: 2,
    },
    {
      title: 'Wedding Catering',
      description: 'Beautiful setup for a traditional Nigerian wedding',
      imageUrl: '/uploads/gallery/wedding-catering.jpg',
      category: 'events',
      sortOrder: 3,
    },
    {
      title: 'Restaurant Interior',
      description: 'Our cozy and welcoming restaurant atmosphere',
      imageUrl: '/uploads/gallery/restaurant-interior.jpg',
      category: 'restaurant',
      sortOrder: 4,
    },
  ];

  for (const galleryData of galleryItems) {
    const existingGalleryItem = await prisma.gallery.findFirst({
      where: { title: galleryData.title },
    });

    if (!existingGalleryItem) {
      await prisma.gallery.create({
        data: galleryData,
      });
    }
  }
  console.log('✅ Gallery items created');

  // Create sample reviews
  const reviews = [
    {
      userId: customer.id,
      rating: 5,
      comment: 'Amazing food! The jollof rice was absolutely delicious and reminded me of home. Will definitely order again!',
      isApproved: true,
    },
    {
      userId: customer.id,
      rating: 4,
      comment: 'Great Nigerian restaurant. The egusi soup was perfect and the service was excellent. Highly recommended!',
      isApproved: true,
    },
  ];

  for (const reviewData of reviews) {
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: reviewData.userId,
        comment: reviewData.comment,
      },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: reviewData,
      });
    }
  }
  console.log('✅ Sample reviews created');

  // Create default settings
  const settings = [
    {
      key: 'restaurant_name',
      value: 'Naija Aroma',
      description: 'Restaurant name',
    },
    {
      key: 'restaurant_phone',
      value: '+234 XXX XXX XXXX',
      description: 'Restaurant contact phone',
    },
    {
      key: 'restaurant_email',
      value: 'info@naijaaroma.com',
      description: 'Restaurant contact email',
    },
    {
      key: 'restaurant_address',
      value: 'Port Harcourt, Rivers State, Nigeria',
      description: 'Restaurant address',
    },
    {
      key: 'delivery_fee',
      value: '500',
      description: 'Default delivery fee in Naira',
    },
    {
      key: 'free_delivery_threshold',
      value: '5000',
      description: 'Minimum order amount for free delivery',
    },
    {
      key: 'max_delivery_distance',
      value: '10',
      description: 'Maximum delivery distance in kilometers',
    },
    {
      key: 'restaurant_open_time',
      value: '09:00',
      description: 'Restaurant opening time',
    },
    {
      key: 'restaurant_close_time',
      value: '22:00',
      description: 'Restaurant closing time',
    },
    {
      key: 'whatsapp_number',
      value: process.env.WHATSAPP_PHONE_NUMBER || '+234 XXX XXX XXXX',
      description: 'WhatsApp contact number',
    },
  ];

  for (const settingData of settings) {
    await prisma.settings.upsert({
      where: { key: settingData.key },
      update: { value: settingData.value },
      create: settingData,
    });
  }
  console.log('✅ Default settings created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin: admin@naijaaroma.com / Admin123!');
  console.log('Customer: customer@test.com / Customer123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });