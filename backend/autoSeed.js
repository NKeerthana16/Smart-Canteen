const User = require('./models/User');
const Category = require('./models/Category');
const Food = require('./models/Food');
const PickupSlot = require('./models/PickupSlot');

const autoSeed = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data. Skipping auto-seed.');
      return;
    }

    console.log('Database empty. Running auto-seed initialization...');

    // 1. Admin
    await User.create({
      name: 'Canteen Admin',
      email: 'admin@gmail.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'admin',
      status: 'active'
    });

    // 2. Students
    await User.create({
      name: 'Student User',
      email: 'student@gmail.com',
      phone: '9876543211',
      password: '123456',
      role: 'student',
      status: 'active'
    });

    await User.create({
      name: 'Keerthana N',
      email: 'keerthana@gmail.com',
      phone: '9876543212',
      password: '123456',
      role: 'student',
      status: 'active'
    });

    // 3. Categories
    const categoriesData = [
      { name: 'Breakfast', description: 'Freshly made south indian breakfast options', icon: 'fa-sun' },
      { name: 'Lunch', description: 'Fulfilling meals and rice options', icon: 'fa-bowl-rice' },
      { name: 'Snacks', description: 'Quick bites and evening snacks', icon: 'fa-cookie' },
      { name: 'Beverages', description: 'Hot teas, coffees, and fresh juices', icon: 'fa-mug-hot' }
    ];
    await Category.insertMany(categoriesData);

    // 4. Foods
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
    await Food.insertMany(foodItemsData);

    // 5. Pickup Slots
    const slotsData = [
      { time: '08:00 AM - 08:30 AM', maxCapacity: 10, bookedCount: 0, status: 'active' },
      { time: '08:30 AM - 09:00 AM', maxCapacity: 10, bookedCount: 0, status: 'active' },
      { time: '12:00 PM - 12:30 PM', maxCapacity: 10, bookedCount: 0, status: 'active' },
      { time: '12:30 PM - 01:00 PM', maxCapacity: 10, bookedCount: 0, status: 'active' },
      { time: '04:00 PM - 04:30 PM', maxCapacity: 10, bookedCount: 0, status: 'active' },
      { time: '04:30 PM - 05:00 PM', maxCapacity: 10, bookedCount: 0, status: 'active' }
    ];
    await PickupSlot.insertMany(slotsData);

    console.log('✔ Auto-seeding completed successfully!');
  } catch (error) {
    console.error('Auto-seed error:', error.message);
  }
};

module.exports = autoSeed;
