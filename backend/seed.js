const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Food = require('./models/Food');
const PickupSlot = require('./models/PickupSlot');

const seedData = async () => {
  try {
    await connectDB();

    console.log('Seeding Smart Canteen Database...');

    // 1. Seed Admin User (admin@gmail.com / admin123)
    let admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Canteen Admin',
        email: 'admin@gmail.com',
        phone: '9876543210',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      });
      console.log('✔ Admin user created: admin@gmail.com / admin123');
    } else {
      console.log('✔ Admin user already exists.');
    }

    // 2. Seed Student User (student@gmail.com / 123456)
    let student = await User.findOne({ email: 'student@gmail.com' });
    if (!student) {
      student = await User.create({
        name: 'Student User',
        email: 'student@gmail.com',
        phone: '9876543211',
        password: '123456',
        role: 'student',
        status: 'active'
      });
      console.log('✔ Student user created: student@gmail.com / 123456');
    } else {
      console.log('✔ Student user already exists.');
    }

    // Also check keerthana@gmail.com if used in demo
    let student2 = await User.findOne({ email: 'keerthana@gmail.com' });
    if (!student2) {
      await User.create({
        name: 'Keerthana N',
        email: 'keerthana@gmail.com',
        phone: '9876543212',
        password: '123456',
        role: 'student',
        status: 'active'
      });
      console.log('✔ Keerthana student user created: keerthana@gmail.com / 123456');
    }

    // 3. Seed Categories
    const categoriesData = [
      { name: 'Breakfast', description: 'Freshly made south indian breakfast options', icon: 'fa-sun' },
      { name: 'Lunch', description: 'Fulfilling meals and rice options', icon: 'fa-bowl-rice' },
      { name: 'Snacks', description: 'Quick bites and evening snacks', icon: 'fa-cookie' },
      { name: 'Beverages', description: 'Hot teas, coffees, and fresh juices', icon: 'fa-mug-hot' }
    ];

    for (const cat of categoriesData) {
      const exists = await Category.findOne({ name: cat.name });
      if (!exists) {
        await Category.create(cat);
      }
    }
    console.log('✔ Categories initialized.');

    // 4. Seed Foods
    const foodItemsData = [
      {
        name: 'Idli',
        category: 'Breakfast',
        price: 30,
        description: 'Soft steamed rice cakes served with sambar and coconut chutney.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Dosa',
        category: 'Breakfast',
        price: 50,
        description: 'Crispy golden rice crepe served with flavorful chutneys & sambar.',
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Pongal',
        category: 'Breakfast',
        price: 40,
        description: 'Traditional savory rice and lentil dish tempered with ghee, pepper, and cashews.',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Veg Meals',
        category: 'Lunch',
        price: 80,
        description: 'Complete South Indian thali meal with rice, sambar, rasam, kootu, and curd.',
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Chicken Rice',
        category: 'Lunch',
        price: 120,
        description: 'Flavorful spiced chicken fried rice served with raita.',
        image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Veg Fried Rice',
        category: 'Lunch',
        price: 100,
        description: 'Wok-tossed aromatic rice with fresh garden vegetables.',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Samosa',
        category: 'Snacks',
        price: 20,
        description: 'Crispy fried pastry filled with spiced potato masala.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Sandwich',
        category: 'Snacks',
        price: 50,
        description: 'Grilled vegetable sandwich with cheese and green chutney.',
        image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Tea',
        category: 'Beverages',
        price: 15,
        description: 'Hot spiced Indian milk tea (Chai).',
        image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Coffee',
        category: 'Beverages',
        price: 20,
        description: 'Freshly brewed South Indian filter coffee.',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        available: true
      },
      {
        name: 'Fresh Juice',
        category: 'Beverages',
        price: 40,
        description: 'Fresh seasonal fruit juice.',
        image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
        available: true
      }
    ];

    for (const food of foodItemsData) {
      const exists = await Food.findOne({ name: food.name });
      if (!exists) {
        await Food.create(food);
      }
    }
    console.log('✔ Food items initialized.');

    // 5. Seed Pickup Slots
    const slotsData = [
      { time: '08:00 AM - 08:30 AM', maxCapacity: 10 },
      { time: '08:30 AM - 09:00 AM', maxCapacity: 10 },
      { time: '12:00 PM - 12:30 PM', maxCapacity: 10 },
      { time: '12:30 PM - 01:00 PM', maxCapacity: 10 },
      { time: '04:00 PM - 04:30 PM', maxCapacity: 10 },
      { time: '04:30 PM - 05:00 PM', maxCapacity: 10 }
    ];

    for (const slot of slotsData) {
      const exists = await PickupSlot.findOne({ time: slot.time });
      if (!exists) {
        await PickupSlot.create({
          time: slot.time,
          maxCapacity: slot.maxCapacity,
          bookedCount: 0,
          status: 'active'
        });
      }
    }
    console.log('✔ Pickup slots initialized.');

    console.log('Database seeding finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error.message);
    process.exit(1);
  }
};

seedData();
