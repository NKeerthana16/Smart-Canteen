/**
 * Smart Canteen AngularJS Controllers
 * Standard AngularJS 1.x controllers using $scope, $location, $routeParams and $http promises
 */

// 1. Home Controller
app.controller("HomeController", function($scope, $location, CanteenService) {
    $scope.featuredFoods = [];
    CanteenService.getFoods().then(function(foods) {
        $scope.featuredFoods = foods.slice(0, 4);
    });
    
    $scope.goToMenu = function() {
        $location.path("/menu");
    };
});

// 2. Login Controller
app.controller("LoginController", function($scope, $location, AuthService) {
    $scope.loginData = {
        email: "",
        password: ""
    };
    $scope.errorMessage = "";

    // Fill demo student credentials
    $scope.fillStudentDemo = function() {
        $scope.loginData.email = "student@gmail.com";
        $scope.loginData.password = "123456";
    };

    // Fill demo admin credentials
    $scope.fillAdminDemo = function() {
        $scope.loginData.email = "admin@gmail.com";
        $scope.loginData.password = "admin123";
    };

    $scope.doLogin = function() {
        $scope.errorMessage = "";
        if (!$scope.loginData.email || !$scope.loginData.password) {
            $scope.errorMessage = "Please enter email and password.";
            return;
        }

        AuthService.login($scope.loginData.email, $scope.loginData.password).then(function(result) {
            if (result.success) {
                if (result.user.role === "admin") {
                    $location.path("/admin-dashboard");
                } else {
                    $location.path("/student-dashboard");
                }
            } else {
                $scope.errorMessage = result.message;
            }
        });
    };
});

// 3. Register Controller
app.controller("RegisterController", function($scope, $location, AuthService) {
    $scope.regData = {
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    };
    $scope.errorMessage = "";

    $scope.doRegister = function() {
        $scope.errorMessage = "";

        if (!$scope.regData.name || !$scope.regData.email || !$scope.regData.phone || !$scope.regData.password) {
            $scope.errorMessage = "All fields are required.";
            return;
        }

        if ($scope.regData.password !== $scope.regData.confirmPassword) {
            $scope.errorMessage = "Passwords do not match.";
            return;
        }

        if ($scope.regData.phone.length < 10) {
            $scope.errorMessage = "Please enter a valid 10-digit phone number.";
            return;
        }

        AuthService.register($scope.regData).then(function(result) {
            if (result.success) {
                $location.path("/student-dashboard");
            } else {
                $scope.errorMessage = result.message;
            }
        });
    };
});

// 4. Student Dashboard Controller
app.controller("StudentDashboardController", function($scope, $location, AuthService, OrderService, CartService, CanteenService) {
    $scope.user = AuthService.getCurrentUser();
    
    if (!$scope.user || $scope.user.role !== "student") {
        $location.path("/login");
        return;
    }

    $scope.cartCount = CartService.getTotalCount();
    $scope.todaysFoods = [];
    $scope.recentOrders = [];
    $scope.activeOrder = null;

    CanteenService.getFoods().then(function(foods) {
        $scope.todaysFoods = foods.filter(function(f) { return f.available; }).slice(0, 4);
    });

    OrderService.getOrdersByUser($scope.user.email).then(function(orders) {
        $scope.recentOrders = orders;
        $scope.activeOrder = orders.find(function(o) {
            return o.status !== "Completed" && o.status !== "Cancelled";
        });
    });
});

// 5. Menu Controller
app.controller("MenuController", function($scope, CanteenService, CartService, $rootScope) {
    $scope.foods = [];
    $scope.categories = [];
    $scope.selectedCategory = "All";
    $scope.searchQuery = "";
    $scope.toastMessage = "";

    $scope.loadData = function() {
        CanteenService.getFoods().then(function(foods) {
            $scope.foods = foods;
        });
        CanteenService.getCategories().then(function(cats) {
            $scope.categories = cats;
        });
    };

    $scope.loadData();

    $scope.filterCategory = function(catName) {
        $scope.selectedCategory = catName;
    };

    $scope.customCategoryFilter = function(food) {
        if ($scope.selectedCategory === "All") return true;
        return food.category === $scope.selectedCategory;
    };

    $scope.addToCart = function(food) {
        if (!food.available) return;
        CartService.addToCart(food, 1);
        $rootScope.updateCartCount();

        $scope.toastMessage = food.name + " added to cart!";
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.toastMessage = "";
            });
        }, 2000);
    };
});

// 6. Food Details Controller
app.controller("FoodDetailsController", function($scope, $routeParams, CanteenService, CartService, $rootScope, $location) {
    var foodId = $routeParams.id;
    $scope.food = null;
    $scope.quantity = 1;
    $scope.toastMessage = "";

    CanteenService.getFoodById(foodId).then(function(food) {
        if (!food) {
            $location.path("/menu");
            return;
        }
        $scope.food = food;
    });

    $scope.increaseQty = function() {
        $scope.quantity++;
    };

    $scope.decreaseQty = function() {
        if ($scope.quantity > 1) {
            $scope.quantity--;
        }
    };

    $scope.addToCart = function() {
        if (!$scope.food || !$scope.food.available) return;
        CartService.addToCart($scope.food, $scope.quantity);
        $rootScope.updateCartCount();

        $scope.toastMessage = $scope.quantity + " x " + $scope.food.name + " added to cart!";
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.toastMessage = "";
                $location.path("/cart");
            });
        }, 1000);
    };
});

// 7. Cart Controller
app.controller("CartController", function($scope, $location, CartService, $rootScope) {
    $scope.loadCart = function() {
        $scope.cart = CartService.getCart();
        $scope.totalAmount = CartService.getTotalAmount();
        $rootScope.updateCartCount();
    };

    $scope.loadCart();

    $scope.increaseQty = function(item) {
        CartService.updateQuantity(item.id, item.quantity + 1);
        $scope.loadCart();
    };

    $scope.decreaseQty = function(item) {
        CartService.updateQuantity(item.id, item.quantity - 1);
        $scope.loadCart();
    };

    $scope.removeItem = function(itemId) {
        CartService.removeFromCart(itemId);
        $scope.loadCart();
    };

    $scope.clearCart = function() {
        CartService.clearCart();
        $scope.loadCart();
    };

    $scope.proceedToCheckout = function() {
        if ($scope.cart.length === 0) return;
        $location.path("/checkout");
    };
});

// 8. Checkout Controller
app.controller("CheckoutController", function($scope, $location, AuthService, CartService, SlotService, OrderService, $rootScope) {
    $scope.user = AuthService.getCurrentUser();
    
    if (!$scope.user) {
        $location.path("/login");
        return;
    }

    $scope.cart = CartService.getCart();
    $scope.totalAmount = CartService.getTotalAmount();

    if ($scope.cart.length === 0) {
        $location.path("/cart");
        return;
    }

    var todayStr = new Date().toISOString().split("T")[0];
    $scope.checkoutData = {
        pickupDate: todayStr,
        selectedSlot: "",
        paymentMethod: "Counter Cash / UPI",
        notes: ""
    };

    $scope.slots = [];
    $scope.errorMessage = "";

    SlotService.getSlots().then(function(slots) {
        $scope.slots = slots;
    });

    $scope.selectSlot = function(slot) {
        if (slot.status === "SLOT FULL" || slot.remaining <= 0) return;
        $scope.checkoutData.selectedSlot = slot.time;
    };

    $scope.placeOrder = function() {
        $scope.errorMessage = "";

        if (!$scope.checkoutData.selectedSlot) {
            $scope.errorMessage = "Please select a pickup time slot.";
            return;
        }

        var orderPayload = {
            items: $scope.cart,
            pickupDate: $scope.checkoutData.pickupDate,
            pickupSlot: $scope.checkoutData.selectedSlot,
            paymentMethod: $scope.checkoutData.paymentMethod,
            notes: $scope.checkoutData.notes
        };

        OrderService.createOrder(orderPayload).then(function(result) {
            if (result.success) {
                CartService.clearCart();
                $rootScope.updateCartCount();
                var createdId = result.data ? (result.data.id || result.data.orderId || result.data._id) : "";
                $location.path("/order-success/" + createdId);
            } else {
                $scope.errorMessage = result.message;
            }
        });
    };
});

// 9. Order Success Controller
app.controller("OrderSuccessController", function($scope, $routeParams, OrderService) {
    var orderId = $routeParams.id;
    $scope.order = null;

    OrderService.getOrderById(orderId).then(function(order) {
        $scope.order = order;
    });
});

// 10. Order Tracking Controller
app.controller("OrderTrackingController", function($scope, $routeParams, OrderService) {
    var orderId = $routeParams.id;
    $scope.order = null;
    $scope.statuses = ["Placed", "Accepted", "Preparing", "Ready for Pickup", "Completed"];

    $scope.refreshStatus = function() {
        OrderService.getOrderById(orderId).then(function(order) {
            $scope.order = order;
        });
    };

    $scope.refreshStatus();

    $scope.getStatusStepClass = function(stepName) {
        if (!$scope.order) return "";
        var orderStatus = $scope.order.status;

        if (orderStatus === "Cancelled") {
            return stepName === "Placed" ? "step-active step-cancelled" : "step-inactive";
        }

        var currentIndex = $scope.statuses.indexOf(orderStatus);
        var stepIndex = $scope.statuses.indexOf(stepName);

        if (stepIndex < currentIndex) {
            return "step-completed";
        } else if (stepIndex === currentIndex) {
            return "step-active";
        } else {
            return "step-inactive";
        }
    };
});

// 11. My Orders Controller
app.controller("MyOrdersController", function($scope, AuthService, OrderService, $location) {
    $scope.user = AuthService.getCurrentUser();
    if (!$scope.user) {
        $location.path("/login");
        return;
    }

    $scope.orders = [];
    OrderService.getOrdersByUser($scope.user.email).then(function(orders) {
        $scope.orders = orders;
    });
});

// 12. Profile Controller
app.controller("ProfileController", function($scope, AuthService, $location) {
    $scope.user = AuthService.getCurrentUser();
    if (!$scope.user) {
        $location.path("/login");
        return;
    }

    $scope.profileData = {
        name: $scope.user.name,
        email: $scope.user.email,
        phone: $scope.user.phone,
        password: ""
    };

    $scope.successMessage = "";
    $scope.errorMessage = "";

    $scope.saveProfile = function() {
        $scope.successMessage = "";
        $scope.errorMessage = "";

        AuthService.updateProfile($scope.profileData).then(function(result) {
            if (result.success) {
                $scope.user = AuthService.getCurrentUser();
                $scope.successMessage = result.message || "Profile updated successfully!";
                $scope.profileData.password = "";
            } else {
                $scope.errorMessage = result.message || "Failed to update profile.";
            }
        });
    };
});

// 13. Feedback Controller
app.controller("FeedbackController", function($scope, AuthService, OrderService, FeedbackService, $location) {
    $scope.user = AuthService.getCurrentUser();
    if (!$scope.user) {
        $location.path("/login");
        return;
    }

    $scope.userOrders = [];
    OrderService.getOrdersByUser($scope.user.email).then(function(orders) {
        $scope.userOrders = orders;
    });

    $scope.feedbackData = {
        orderId: "",
        rating: 5,
        comment: ""
    };

    $scope.successMessage = "";
    $scope.errorMessage = "";

    $scope.submitFeedback = function() {
        $scope.successMessage = "";
        $scope.errorMessage = "";

        if (!$scope.feedbackData.comment) {
            $scope.errorMessage = "Please enter your feedback comments.";
            return;
        }

        FeedbackService.addFeedback({
            orderId: $scope.feedbackData.orderId || "General",
            rating: $scope.feedbackData.rating,
            comment: $scope.feedbackData.comment
        }).then(function(result) {
            if (result.success) {
                $scope.successMessage = result.message || "Thank you for your feedback!";
                $scope.feedbackData = { orderId: "", rating: 5, comment: "" };
            } else {
                $scope.errorMessage = result.message || "Failed to submit feedback.";
            }
        });
    };
});

// ---------------- ADMIN CONTROLLERS ----------------

// 14. Admin Dashboard Controller
app.controller("AdminDashboardController", function($scope, AuthService, AdminService) {
    $scope.totalUsers = 0;
    $scope.totalFoods = 0;
    $scope.totalOrders = 0;
    $scope.pendingOrders = 0;
    $scope.completedOrders = 0;
    $scope.todayRevenue = 0;
    $scope.recentOrders = [];

    AdminService.getDashboard().then(function(data) {
        if (data) {
            $scope.totalUsers = data.totalUsers;
            $scope.totalFoods = data.totalFoods;
            $scope.totalOrders = data.totalOrders;
            $scope.pendingOrders = data.pendingOrders;
            $scope.completedOrders = data.completedOrders;
            $scope.todayRevenue = data.totalRevenue;
            $scope.recentOrders = data.recentOrders;
        }
    });
});

// 15. Admin Food Management Controller
app.controller("AdminFoodController", function($scope, CanteenService) {
    $scope.foods = [];
    $scope.categories = [];
    
    $scope.isEditing = false;
    $scope.formData = {
        id: null,
        name: "",
        category: "Breakfast",
        price: "",
        description: "",
        image: "",
        available: true
    };

    $scope.refreshData = function() {
        CanteenService.getFoods().then(function(foods) {
            $scope.foods = foods;
        });
        CanteenService.getCategories().then(function(cats) {
            $scope.categories = cats;
        });
    };

    $scope.refreshData();

    $scope.resetForm = function() {
        $scope.isEditing = false;
        $scope.formData = {
            id: null,
            name: "",
            category: $scope.categories.length > 0 ? $scope.categories[0].name : "Breakfast",
            price: "",
            description: "",
            image: "",
            available: true
        };
    };

    $scope.editFood = function(food) {
        $scope.isEditing = true;
        $scope.formData = {
            id: food.id || food._id,
            name: food.name,
            category: food.category,
            price: food.price,
            description: food.description,
            image: food.image,
            available: food.available
        };
    };

    $scope.saveFood = function() {
        if (!$scope.formData.name || !$scope.formData.price) return;

        if ($scope.isEditing) {
            CanteenService.updateFood($scope.formData.id, $scope.formData).then(function() {
                $scope.refreshData();
                $scope.resetForm();
            });
        } else {
            CanteenService.addFood($scope.formData).then(function() {
                $scope.refreshData();
                $scope.resetForm();
            });
        }
    };

    $scope.deleteFood = function(id) {
        if (confirm("Are you sure you want to delete this item?")) {
            CanteenService.deleteFood(id).then(function() {
                $scope.refreshData();
            });
        }
    };

    $scope.toggleAvailability = function(food) {
        CanteenService.toggleAvailability(food.id || food._id, food.available).then(function() {
            $scope.refreshData();
        });
    };
});

// 16. Admin Orders Controller
app.controller("AdminOrdersController", function($scope, OrderService) {
    $scope.orders = [];
    $scope.statusOptions = ["Placed", "Accepted", "Preparing", "Ready for Pickup", "Completed", "Cancelled"];
    $scope.selectedStatusFilter = "All";

    $scope.refreshOrders = function() {
        OrderService.getOrders().then(function(orders) {
            $scope.orders = orders;
        });
    };

    $scope.refreshOrders();

    $scope.filterByStatus = function(status) {
        $scope.selectedStatusFilter = status;
    };

    $scope.customOrderFilter = function(order) {
        if ($scope.selectedStatusFilter === "All") return true;
        return order.status === $scope.selectedStatusFilter;
    };

    $scope.updateStatus = function(order, newStatus) {
        OrderService.updateOrderStatus(order.id || order._id, newStatus).then(function() {
            $scope.refreshOrders();
        });
    };
});

// 17. Admin Categories Controller
app.controller("AdminCategoriesController", function($scope, CanteenService) {
    $scope.categories = [];
    $scope.newCategoryName = "";

    $scope.refreshCategories = function() {
        CanteenService.getCategories().then(function(cats) {
            $scope.categories = cats;
        });
    };

    $scope.refreshCategories();

    $scope.addCategory = function() {
        if (!$scope.newCategoryName) return;
        CanteenService.addCategory($scope.newCategoryName).then(function(result) {
            if (result.success) {
                $scope.refreshCategories();
                $scope.newCategoryName = "";
            } else {
                alert(result.message || "Failed to add category.");
            }
        });
    };

    $scope.deleteCategory = function(id) {
        if (confirm("Delete this category?")) {
            CanteenService.deleteCategory(id).then(function() {
                $scope.refreshCategories();
            });
        }
    };
});

// 18. Admin Slots Controller
app.controller("AdminSlotsController", function($scope, SlotService) {
    $scope.slots = [];
    $scope.isEditing = false;
    $scope.slotForm = {
        id: null,
        time: "",
        maxCapacity: 10
    };

    $scope.refreshSlots = function() {
        SlotService.getSlots().then(function(slots) {
            $scope.slots = slots;
        });
    };

    $scope.refreshSlots();

    $scope.resetForm = function() {
        $scope.isEditing = false;
        $scope.slotForm = { id: null, time: "", maxCapacity: 10 };
    };

    $scope.editSlot = function(slot) {
        $scope.isEditing = true;
        $scope.slotForm = {
            id: slot.id || slot._id,
            time: slot.time,
            maxCapacity: slot.maxCapacity
        };
    };

    $scope.saveSlot = function() {
        if (!$scope.slotForm.time || !$scope.slotForm.maxCapacity) return;

        if ($scope.isEditing) {
            SlotService.updateSlot($scope.slotForm.id, $scope.slotForm.time, $scope.slotForm.maxCapacity).then(function() {
                $scope.refreshSlots();
                $scope.resetForm();
            });
        } else {
            SlotService.addSlot($scope.slotForm.time, $scope.slotForm.maxCapacity).then(function() {
                $scope.refreshSlots();
                $scope.resetForm();
            });
        }
    };

    $scope.deleteSlot = function(id) {
        if (confirm("Delete this pickup slot?")) {
            SlotService.deleteSlot(id).then(function() {
                $scope.refreshSlots();
            });
        }
    };
});

// 19. Admin Feedback Controller
app.controller("AdminFeedbackController", function($scope, FeedbackService) {
    $scope.feedbacks = [];
    FeedbackService.getFeedback().then(function(feedbacks) {
        $scope.feedbacks = feedbacks;
    });
});

// 20. Admin Users Controller
app.controller("AdminUsersController", function($scope, AuthService) {
    $scope.users = [];
    $scope.refreshUsers = function() {
        AuthService.getAllUsers().then(function(users) {
            $scope.users = users;
        });
    };
    $scope.refreshUsers();

    $scope.toggleStatus = function(user) {
        var userId = (typeof user === 'object' && user !== null) ? (user.id || user._id) : user;
        if (!userId) return;
        AuthService.toggleUserStatus(userId).then(function() {
            $scope.refreshUsers();
        });
    };
});

// 21. Admin Reports Controller
app.controller("AdminReportsController", function($scope, AdminService) {
    $scope.totalOrders = 0;
    $scope.completedOrders = 0;
    $scope.pendingOrders = 0;
    $scope.cancelledOrders = 0;
    $scope.totalRevenue = 0;
    $scope.popularItems = [];
    $scope.mostOrderedFood = "N/A";

    AdminService.getReports().then(function(reports) {
        if (reports) {
            $scope.totalOrders = reports.totalOrders;
            $scope.completedOrders = reports.completedOrders;
            $scope.pendingOrders = reports.pendingOrders;
            $scope.cancelledOrders = reports.cancelledOrders;
            $scope.totalRevenue = reports.totalRevenue;
            $scope.popularItems = reports.popularItems;
            $scope.mostOrderedFood = reports.mostOrderedFood;
        }
    });
});
