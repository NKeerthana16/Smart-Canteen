/**
 * Smart Canteen AngularJS Application Configuration
 * Using standard AngularJS 1.8.2 ngRoute routing and REST API Integration
 */

var app = angular.module("canteenApp", ["ngRoute"]);

// API Base URL Constant
app.constant("API_BASE_URL", "http://localhost:5000/api");

// HTTP Interceptor to attach JWT Token to outgoing requests
app.factory("AuthInterceptor", function($window, $q, $location) {
    return {
        request: function(config) {
            var token = $window.localStorage.getItem("jwtToken");
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = "Bearer " + token;
            }
            return config;
        },
        responseError: function(rejection) {
            if (rejection.status === 401) {
                $window.localStorage.removeItem("jwtToken");
                $window.localStorage.removeItem("currentUser");
                $location.path("/login");
            }
            return $q.reject(rejection);
        }
    };
});

// App Route & Interceptor Configuration
app.config(function($routeProvider, $locationProvider, $httpProvider) {
    // Register JWT Auth Interceptor
    $httpProvider.interceptors.push("AuthInterceptor");

    // Disable HTML5 mode hash prefixes for standard hash-based navigation (#/route)
    $locationProvider.hashPrefix("");

    $routeProvider
        // Public Routes
        .when("/", {
            templateUrl: "views/home.html",
            controller: "HomeController"
        })
        .when("/login", {
            templateUrl: "views/login.html",
            controller: "LoginController"
        })
        .when("/register", {
            templateUrl: "views/register.html",
            controller: "RegisterController"
        })

        // Student Routes
        .when("/student-dashboard", {
            templateUrl: "views/student-dashboard.html",
            controller: "StudentDashboardController"
        })
        .when("/menu", {
            templateUrl: "views/menu.html",
            controller: "MenuController"
        })
        .when("/food-details/:id", {
            templateUrl: "views/food-details.html",
            controller: "FoodDetailsController"
        })
        .when("/cart", {
            templateUrl: "views/cart.html",
            controller: "CartController"
        })
        .when("/checkout", {
            templateUrl: "views/checkout.html",
            controller: "CheckoutController"
        })
        .when("/order-success/:id", {
            templateUrl: "views/order-success.html",
            controller: "OrderSuccessController"
        })
        .when("/order-tracking/:id", {
            templateUrl: "views/order-tracking.html",
            controller: "OrderTrackingController"
        })
        .when("/my-orders", {
            templateUrl: "views/my-orders.html",
            controller: "MyOrdersController"
        })
        .when("/profile", {
            templateUrl: "views/profile.html",
            controller: "ProfileController"
        })
        .when("/feedback", {
            templateUrl: "views/feedback.html",
            controller: "FeedbackController"
        })

        // Admin Routes
        .when("/admin-dashboard", {
            templateUrl: "views/admin-dashboard.html",
            controller: "AdminDashboardController"
        })
        .when("/admin-food", {
            templateUrl: "views/admin-food.html",
            controller: "AdminFoodController"
        })
        .when("/admin-orders", {
            templateUrl: "views/admin-orders.html",
            controller: "AdminOrdersController"
        })
        .when("/admin-categories", {
            templateUrl: "views/admin-categories.html",
            controller: "AdminCategoriesController"
        })
        .when("/admin-slots", {
            templateUrl: "views/admin-slots.html",
            controller: "AdminSlotsController"
        })
        .when("/admin-feedback", {
            templateUrl: "views/admin-feedback.html",
            controller: "AdminFeedbackController"
        })
        .when("/admin-users", {
            templateUrl: "views/admin-users.html",
            controller: "AdminUsersController"
        })
        .when("/admin-reports", {
            templateUrl: "views/admin-reports.html",
            controller: "AdminReportsController"
        })

        // Fallback
        .otherwise({
            redirectTo: "/"
        });
});

// Run block for global state management & navigation guards
app.run(function($rootScope, $location, AuthService, CartService) {
    // Sync current user state to root scope on route changes
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
        $rootScope.currentUser = AuthService.getCurrentUser();
        $rootScope.isLoggedIn = AuthService.isLoggedIn();
        $rootScope.isAdmin = AuthService.isAdmin();
        $rootScope.isStudent = AuthService.isStudent();
        $rootScope.cartCount = CartService.getTotalCount();

        var path = $location.path();

        // Admin route guard
        if (path.indexOf("/admin") === 0) {
            if (!$rootScope.isLoggedIn || !$rootScope.isAdmin) {
                $location.path("/login");
            }
        }

        // Protected student route guard
        var studentOnly = ["/student-dashboard", "/checkout", "/my-orders", "/profile"];
        if (studentOnly.indexOf(path) !== -1) {
            if (!$rootScope.isLoggedIn) {
                $location.path("/login");
            }
        }
    });

    // Global Logout helper
    $rootScope.logout = function() {
        AuthService.logout();
        $rootScope.currentUser = null;
        $rootScope.isLoggedIn = false;
        $rootScope.isAdmin = false;
        $rootScope.isStudent = false;
        $location.path("/login");
    };

    // Refresh cart count helper
    $rootScope.updateCartCount = function() {
        $rootScope.cartCount = CartService.getTotalCount();
    };
});
