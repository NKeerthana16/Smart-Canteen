const Food = require('../models/Food');

// @desc    Get all foods (supports ?search= and ?category=)
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res) => {
  try {
    const { search, category, available } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (available === 'true') {
      query.available = true;
    }

    const foods = await Food.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, data: foods });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    return res.json({ success: true, data: food });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res) => {
  try {
    const { name, category, price, description, image, available } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
    }

    const food = await Food.create({
      name,
      category,
      price: parseFloat(price),
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      available: available !== undefined ? available : true
    });

    return res.status(201).json({ success: true, message: 'Food item created successfully', data: food });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res) => {
  try {
    const { name, category, price, description, image, available } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    if (name) food.name = name;
    if (category) food.category = category;
    if (price !== undefined) food.price = parseFloat(price);
    if (description !== undefined) food.description = description;
    if (image) food.image = image;
    if (available !== undefined) food.available = available;

    const updatedFood = await food.save();
    return res.json({ success: true, message: 'Food item updated successfully', data: updatedFood });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    await food.deleteOne();
    return res.json({ success: true, message: 'Food item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood
};
