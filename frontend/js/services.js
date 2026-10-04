/**
 * Smart Canteen AngularJS Services / Factories
 * Connected to Express REST API backend using $http
 */

// Auth Factory
app.factory("AuthService", function($http, $window, API_BASE_URL) {
    return {
        getCurrentUser: function() {
            var userJson = $window.localStorage.getItem("currentUser");
            return userJson ? JSON.parse(userJson) : null;
        },

        getJwtToken: function() {
            return $window.localStorage.getItem("jwtToken");
        },

        login: function(email, password) {
            return $http.post(API_BASE_URL + "/auth/login", {
                email: email,
                password: password
            }).then(function(response) {
                if (response.data && response.data.success) {
                    $window.localStorage.setItem("jwtToken", response.data.token);
                    $window.localStorage.setItem("currentUser", JSON.stringify(response.data.user));
                }
                return response.data;
            }, function(error) {
                var errMsg = (error.data && error.data.message) ? error.data.message : (error.data || "Login failed. Could not connect to authentication server.");
                return { success: false, message: errMsg };
            });
        },

        register: function(userData) {
            return $http.post(API_BASE_URL + "/auth/register", userData)
                .then(function(response) {
                    if (response.data && response.data.success) {
                        $window.localStorage.setItem("jwtToken", response.data.token);
                        $window.localStorage.setItem("currentUser", JSON.stringify(response.data.user));
                    }
                    return response.data;
                }, function(error) {
                    var errMsg = (error.data && error.data.message) ? error.data.message : (error.data || "Registration failed. Could not connect to authentication server.");
                    return { success: false, message: errMsg };
                });
        },

        logout: function() {
            $window.localStorage.removeItem("jwtToken");
            $window.localStorage.removeItem("currentUser");
        },

        isLoggedIn: function() {
            return this.getCurrentUser() !== null && this.getJwtToken() !== null;
        },

        isAdmin: function() {
            var user = this.getCurrentUser();
            return user && user.role === "admin";
        },

        isStudent: function() {
            var user = this.getCurrentUser();
            return user && user.role === "student";
        },

        updateProfile: function(updatedData) {
            return $http.put(API_BASE_URL + "/users/profile", updatedData)
                .then(function(response) {
                    if (response.data.success) {
                        $window.localStorage.setItem("currentUser", JSON.stringify(response.data.data));
                    }
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to update profile." };
                });
        },

        getAllUsers: function() {
            return $http.get(API_BASE_URL + "/users")
                .then(function(response) {
                    return response.data.data || [];
                }, function(error) {
                    return [];
                });
        },

        toggleUserStatus: function(userId) {
            return $http.put(API_BASE_URL + "/users/" + userId + "/status")
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to update status." };
                });
        }
    };
});

// Canteen Menu Factory
app.factory("CanteenService", function($http, API_BASE_URL) {
    return {
        getFoods: function(search, category) {
            var params = {};
            if (search) params.search = search;
            if (category && category !== "All") params.category = category;

            return $http.get(API_BASE_URL + "/foods", { params: params })
                .then(function(response) {
                    // Map _id to id for AngularJS compatibility
                    var foods = response.data.data || [];
                    return foods.map(function(f) {
                        f.id = f._id;
                        return f;
                    });
                }, function(error) {
                    return [];
                });
        },

        getFoodById: function(id) {
            return $http.get(API_BASE_URL + "/foods/" + id)
                .then(function(response) {
                    var f = response.data.data;
                    if (f) f.id = f._id;
                    return f;
                }, function(error) {
                    return null;
                });
        },

        addFood: function(foodData) {
            return $http.post(API_BASE_URL + "/foods", foodData)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to add food." };
                });
        },

        updateFood: function(id, foodData) {
            return $http.put(API_BASE_URL + "/foods/" + id, foodData)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to update food." };
                });
        },

        deleteFood: function(id) {
            return $http.delete(API_BASE_URL + "/foods/" + id)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to delete food." };
                });
        },

        toggleAvailability: function(id, currentAvailable) {
            return $http.put(API_BASE_URL + "/foods/" + id, { available: !currentAvailable })
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to update availability." };
                });
        },

        getCategories: function() {
            return $http.get(API_BASE_URL + "/categories")
                .then(function(response) {
                    var cats = response.data.data || [];
                    return cats.map(function(c) {
                        c.id = c._id;
                        return c;
                    });
                }, function(error) {
                    return [];
                });
        },

        addCategory: function(name) {
            return $http.post(API_BASE_URL + "/categories", { name: name })
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to add category." };
                });
        },

        deleteCategory: function(id) {
            return $http.delete(API_BASE_URL + "/categories/" + id)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to delete category." };
                });
        }
    };
});

// Cart Factory (Client side temporary shopping cart)
app.factory("CartService", function($window) {
    return {
        getCart: function() {
            var cartJson = $window.localStorage.getItem("cart");
            return cartJson ? JSON.parse(cartJson) : [];
        },

        saveCart: function(cart) {
            $window.localStorage.setItem("cart", JSON.stringify(cart));
        },

        addToCart: function(foodItem, quantity) {
            var qty = parseInt(quantity) || 1;
            var cart = this.getCart();
            var foodId = foodItem._id || foodItem.id;

            var existingIndex = cart.findIndex(function(item) {
                return (item.id === foodId || item._id === foodId);
            });

            if (existingIndex !== -1) {
                cart[existingIndex].quantity += qty;
                cart[existingIndex].subtotal = cart[existingIndex].quantity * cart[existingIndex].price;
            } else {
                cart.push({
                    id: foodId,
                    _id: foodId,
                    name: foodItem.name,
                    price: foodItem.price,
                    image: foodItem.image,
                    category: foodItem.category,
                    quantity: qty,
                    subtotal: qty * foodItem.price
                });
            }

            this.saveCart(cart);
        },

        updateQuantity: function(foodId, newQty) {
            var cart = this.getCart();
            var item = cart.find(function(i) { return (i.id === foodId || i._id === foodId); });
            if (item) {
                if (newQty <= 0) {
                    this.removeFromCart(foodId);
                } else {
                    item.quantity = newQty;
                    item.subtotal = item.quantity * item.price;
                    this.saveCart(cart);
                }
            }
        },

        removeFromCart: function(foodId) {
            var cart = this.getCart();
            cart = cart.filter(function(i) { return (i.id !== foodId && i._id !== foodId); });
            this.saveCart(cart);
        },

        clearCart: function() {
            this.saveCart([]);
        },

        getTotalCount: function() {
            var cart = this.getCart();
            return cart.reduce(function(total, item) { return total + item.quantity; }, 0);
        },

        getTotalAmount: function() {
            var cart = this.getCart();
            return cart.reduce(function(total, item) { return total + item.subtotal; }, 0);
        }
    };
});

// Pickup Slot Factory
app.factory("SlotService", function($http, API_BASE_URL) {
    return {
        getSlots: function() {
            return $http.get(API_BASE_URL + "/slots")
                .then(function(response) {
                    var slots = response.data.data || [];
                    return slots.map(function(s) {
                        s.id = s._id;
                        return s;
                    });
                }, function(error) {
                    return [];
                });
        },

        getSlotById: function(id) {
            return $http.get(API_BASE_URL + "/slots/" + id)
                .then(function(response) {
                    var s = response.data.data;
                    if (s) s.id = s._id;
                    return s;
                }, function(error) {
                    return null;
                });
        },

        addSlot: function(time, maxCapacity) {
            return $http.post(API_BASE_URL + "/slots", {
                time: time,
                maxCapacity: parseInt(maxCapacity)
            }).then(function(response) {
                return response.data;
            }, function(error) {
                return error.data || { success: false, message: "Failed to add slot." };
            });
        },

        updateSlot: function(id, time, maxCapacity) {
            return $http.put(API_BASE_URL + "/slots/" + id, {
                time: time,
                maxCapacity: parseInt(maxCapacity)
            }).then(function(response) {
                return response.data;
            }, function(error) {
                return error.data || { success: false, message: "Failed to update slot." };
            });
        },

        deleteSlot: function(id) {
            return $http.delete(API_BASE_URL + "/slots/" + id)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to delete slot." };
                });
        }
    };
});

// Order Factory
app.factory("OrderService", function($http, API_BASE_URL) {
    return {
        getOrders: function() {
            return $http.get(API_BASE_URL + "/orders")
                .then(function(response) {
                    return response.data.data || [];
                }, function(error) {
                    return [];
                });
        },

        getOrdersByUser: function(email) {
            return this.getOrders();
        },

        getOrderById: function(orderId) {
            return $http.get(API_BASE_URL + "/orders/" + orderId)
                .then(function(response) {
                    return response.data.data;
                }, function(error) {
                    return null;
                });
        },

        createOrder: function(orderData) {
            return $http.post(API_BASE_URL + "/orders", orderData)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to place order." };
                });
        },

        updateOrderStatus: function(orderId, newStatus) {
            return $http.put(API_BASE_URL + "/orders/" + orderId + "/status", { status: newStatus })
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to update order status." };
                });
        }
    };
});

// Feedback Factory
app.factory("FeedbackService", function($http, API_BASE_URL) {
    return {
        getFeedback: function() {
            return $http.get(API_BASE_URL + "/feedback")
                .then(function(response) {
                    return response.data.data || [];
                }, function(error) {
                    return [];
                });
        },

        addFeedback: function(feedbackData) {
            return $http.post(API_BASE_URL + "/feedback", feedbackData)
                .then(function(response) {
                    return response.data;
                }, function(error) {
                    return error.data || { success: false, message: "Failed to submit feedback." };
                });
        }
    };
});

// Admin Dashboard & Reports Factory
app.factory("AdminService", function($http, API_BASE_URL) {
    return {
        getDashboard: function() {
            return $http.get(API_BASE_URL + "/admin/dashboard")
                .then(function(response) {
                    return response.data.data;
                }, function(error) {
                    return null;
                });
        },

        getReports: function() {
            return $http.get(API_BASE_URL + "/admin/reports")
                .then(function(response) {
                    return response.data.data;
                }, function(error) {
                    return null;
                });
        }
    };
});
