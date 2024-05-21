document.addEventListener('DOMContentLoaded', function () {
    // Handle redirection based on button clicks
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const userLoginBtn = document.getElementById('user-login-btn');
    console.log('Username Element:', document.getElementById('username-display'));
    console.log('Email Element:', document.getElementById('email-display'));

    if (adminLoginBtn && userLoginBtn) {
        adminLoginBtn.addEventListener('click', function () {
            // Redirect to the admin login page
            window.location.href = 'admin-login.html';
        });

        userLoginBtn.addEventListener('click', function () {
            // Redirect to the user login page
            window.location.href = 'user-login.html';
        });
    }

    const adminLoginForm = document.getElementById('admin-login-form');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const username = document.getElementById('admin-username').value;
            const password = document.getElementById('admin-password').value;

            try {
                const response = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });


                const data = await response.json();

                if (data.success) {
                    // Save the token to localStorage
                    localStorage.setItem('token', data.token);

                    // Redirect to the admin panel page upon successful login
                    window.location.href = 'admin-panel.html';
                } else {
                    console.log('Admin authentication failed');
                    // Handle authentication failure (e.g., display an error message)
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An unexpected error occurred');
            }
        });
    }

    // User login form submission handler
const userLoginForm = document.getElementById('user-login-form');
if (userLoginForm) {
    userLoginForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const username = document.getElementById('user-username').value;
        const password = document.getElementById('user-password').value;

        try {
            const response = await fetch('/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            console.log('Received data:', data);

            if (data.success) {
                // Save the user ID to localStorage
                localStorage.setItem('userId', data.userId);

                // Display user details
                const userDetails = data.user;
                if (userDetails) {
                    const usernameDisplay = document.getElementById('username-display');
                    const emailDisplay = document.getElementById('email-display');

                    if (usernameDisplay && emailDisplay) {
                        usernameDisplay.textContent = `Username: ${userDetails.username}`;
                        emailDisplay.textContent = `Email: ${userDetails.email}`;
                    } else {
                        console.error('Username or email display elements not found.');
                    }
                } else {
                    console.error('User details not provided in the response.');
                }

                // Redirect to the user panel page upon successful login
                window.location.href = 'user-panel.html';
            } else {
                // Handle authentication failure (display an error message)
                console.log('User authentication failed:', data.message);

                // Display error message to the user
                const errorMessage = document.getElementById('login-error-message');
                if (errorMessage) {
                    errorMessage.textContent = data.message;
                } else {
                    console.error('Login error message element not found.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        }
    });
}

});

function submitNewFoodItem() {
    console.log('Submit button clicked');

    const name = document.getElementById('name').value;
    const image = document.getElementById('image').value;
    const description = document.getElementById('description').value;
    const price = document.getElementById('price').value;
    const category = document.getElementById('category').value;

    console.log('Sending data to server:', { name, image, description, price, category });

    // Send the new food item data to the server
    fetch('/api/admin/addFoodItem', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            image,
            description,
            price,
            category,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);

            if (data.success) {
                // Display a success message (you can replace this with actual logic)
                alert('New food item added successfully');
            } else {
                // Handle the error (display an error message or take appropriate action)
                alert('Failed to add new food item');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}
function viewAllUsers() {
    // Load content for view all users
    fetch('/api/admin/viewUsers')
        .then(response => response.json())
        .then(data => {
            const usersHTML = data.map(user => `
                <div data-user-id="${user.id}">
                    <h3>${user.username}</h3>
                    <p>Email: ${user.email}</p>
                </div>
            `).join('');

            document.getElementById('admin-content').innerHTML = `
                <h2>View All Users</h2>
                <div id="users-container">
                    ${usersHTML}
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}

function viewAllFoodsItem() {
    // Load content for view all foods
    fetch('/api/admin/viewFoodItems')
        .then(response => response.json())
        .then(data => {
            const foodsHTML = data.map(food => `
                <div data-food-id="${food.id}">
                    <h3>${food.name}</h3>
                    <p>Description: ${food.description}</p>
                    <p>Price: ${food.price}</p>
                    <p>Category: ${food.category}</p>
                    <img src="${food.image}" alt="${food.name}" style="max-width: 200px;">
                    <button onclick="editFoodItem(${food.id})">Edit</button>
                    <button onclick="deleteFoodItem(${food.id})">Delete</button>
                </div>
            `).join('');

            document.getElementById('admin-content').innerHTML = `
                <h2>View All Foods</h2>
                <div id="foods-container">
                    ${foodsHTML}
                </div>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}



function submitEditFoodItem(foodId) {
    console.log('Submit button clicked for food ID:', foodId);

    const name = document.getElementById('edit-name').value;
    const image = document.getElementById('edit-image').value;
    const description = document.getElementById('edit-description').value;
    const price = document.getElementById('edit-price').value;
    const category = document.getElementById('edit-category').value;

    console.log('Sending data to server:', { name, image, description, price, category });

    fetch(`/api/admin/editFoodItem/${foodId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            image,
            description,
            price,
            category,
        }),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Server response:', data);

            if (data.success) {
                // Display a success message (you can replace this with actual logic)
                alert('Food item edited successfully');
            } else {
                // Handle the error (display an error message or take appropriate action)
                alert('Failed to edit food item');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}


function deleteFoodItem(foodId) {
    const confirmation = confirm('Are you sure you want to delete this food item?');

    if (confirmation) {
        fetch(`/api/admin/deleteFoodItem/${foodId}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Reload the view after successful deletion
                    viewAllFoodsItem();
                } else {
                    alert('Error deleting food item: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error deleting food item:', error);
                alert('An unexpected error occurred while deleting the food item');
            });
    }
}



function viewItemDetails(foodId) {
    // Load details for the selected food item
    fetch(`/api/user/itemDetails/${foodId}`)
        .then(response => response.json())
        .then(foodItem => {
            const detailsHTML = `
                <h2>${foodItem.name} Details</h2>
                <p>Description: ${foodItem.description}</p>
                <p>Price: ${foodItem.price}</p>
                <p>Category: ${foodItem.category}</p>
                <img src="${foodItem.image}" alt="${foodItem.name}" style="max-width: 200px;">
                <button onclick="addToCart(${foodItem.id})">Add to Cart</button>
            `;

            document.getElementById('user-content').innerHTML = detailsHTML;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}

// Function to view account information
function viewAccountInfo() {
    // Fetch user details from the server
    fetch('/api/user/accountInfo')
        .then(response => response.json())
        .then(data => {
            const userContent = document.getElementById('user-content');
            userContent.innerHTML = `
                <h2>Account Information</h2>
                <p id="username-display">Username: ${data.username}</p>
                <p id="email-display">Email: ${data.email}</p>
                <button onclick="showManageAccount()">Back to Manage Account</button>
            `;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}

// Function to show the change password form
function showManageAccount() {
    const userContent = document.getElementById('user-content');

    // Add loading state or message to indicate that data is being fetched
    userContent.innerHTML = '<p>Loading user details...</p>';

    // Retrieve user ID from localStorage
    const userId = localStorage.getItem('userId');

    if (!userId) {
        console.error('User ID not found in localStorage.');
        alert('An unexpected error occurred');
        return;
    }

    // Fetch user details from the server
    fetch(`/api/user/accountInfo/${userId}`)
        .then(response => response.json())
        .then(data => {
            // Display user details and options
            const user = data.user;
            if (user) {
                userContent.innerHTML = `
                    <h2>Manage Account</h2>
                    <p id="username-display">Username: ${user.username}</p>
                    <p id="email-display">Email: ${user.email}</p>
                    <button onclick="showChangePasswordForm()">Change Password</button>
                `;
            } else {
                console.error('User details not provided in the response.');
                alert('An unexpected error occurred');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}



// Function to show the change password form
function showChangePasswordForm() {
    const userContent = document.getElementById('user-content');

    // Display the change password form
    userContent.innerHTML = `
        <h2>Change Password</h2>
        <form id="change-password-form">
            <label for="current-password">Current Password:</label>
            <input type="password" id="current-password" required><br>

            <label for="new-password">New Password:</label>
            <input type="password" id="new-password" required><br>

            <label for="confirm-password">Confirm New Password:</label>
            <input type="password" id="confirm-password" required><br>

            <button type="submit">Change Password</button>
        </form>
    `;

    // Attach an event listener to the form for handling password change
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function (event) {
            event.preventDefault();

            // Get the values from the form fields
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            // Perform validation and handle password change logic
            if (newPassword === confirmPassword) {
                // Send the password change request to the server
                const userId = '1'; // Replace with the actual user ID
                fetch(`/api/user/resetPassword/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ currentPassword, newPassword }),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert('Password changed successfully!');
                            // Redirect to the user-panel page upon successful password change
                            window.location.href = 'user-panel.html';
                        } else {
                            console.error('Password change failed:', data.message);
                            alert('Password change failed. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An unexpected error occurred');
                    });
            } else {
                alert('New password and confirm password do not match.');
            }
        });
    }
}



function viewMenuList() {
    const userContent = document.getElementById('user-content');

    // Check if userContent is null before proceeding
    if (!userContent) {
        console.error('Error: user-content element not found.');
        return;
    }

    // Fetch the menu items from the server
    fetch('/api/user/menuList')
        .then(response => response.json())
        .then(data => {
            // Display the menu items
            userContent.innerHTML = '<h2>Menu List</h2>';

            if (data.length > 0) {
                data.forEach(foodItem => {
                    userContent.innerHTML += `
                        <div class="food-item">
                            <img src="${foodItem.image}" alt="${foodItem.name}">
                            <h3>${foodItem.name}</h3>
                            <p>${foodItem.description}</p>
                            <p>Price: $${foodItem.price}</p>
                            <button onclick="console.log('Before addToCart - userId:', ${userId}, 'foodId:', ${foodItem.id}); if (!isNaN(${userId}) && !isNaN(${foodItem.id})) { addToCart(Number(${userId}), ${foodItem.id}); } else { console.error('Invalid userId or foodItem.id.'); }">Add to Cart</button>
                            `;
                });
            } else {
                userContent.innerHTML += '<p>No food items available.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}


viewMenuList();


// Call this function after adding an item to the cart
function refreshShoppingCart(userId, foodId) {
    // Introduce a small delay before refreshing the cart
    setTimeout(() => {
        viewShoppingCart(userId);
    }, 500); // You can adjust the delay (in milliseconds) as needed
}


// Modified addToCart function to refresh the cart after adding an item
async function addToCart(userId, foodId) {
    console.log('Received addToCart request - userId:', userId, 'foodId:', foodId);
    console.log('userId:', userId);
    console.log('foodId:', foodId);  // Add this line
    try {
        const response = await fetch(`/api/user/addToCart/${userId}/${foodId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);  // Display success message
            refreshShoppingCart(userId, foodId);  // Refresh the displayed cart with userId and foodId
        } else {
            alert(`Error: ${data.message}`);  // Display error message
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        alert('An unexpected error occurred. Please try again.');  // Display generic error message
    }
}


// Function to view the user's shopping cart
function viewShoppingCart(userId) {
    const userContent = document.getElementById('user-content');

    // Check if userContent is null before proceeding
    if (!userContent) {
        console.error('Error: user-content element not found.');
        return;
    }

    fetch(`/api/user/viewCart/${userId}`)
        .then(response => response.json())
        .then(data => {
            userContent.innerHTML = '<h2>Shopping Cart</h2>';

            if (data.cart && data.cart.items.length > 0) {
                // Temporary object to hold aggregated quantities
                const aggregatedItems = {};

                // Aggregate quantities
                data.cart.items.forEach(cartItem => {
                    if (aggregatedItems[cartItem.foodItemId]) {
                        aggregatedItems[cartItem.foodItemId].quantity += cartItem.quantity;
                    } else {
                        aggregatedItems[cartItem.foodItemId] = { ...cartItem };
                    }
                });

                // Display aggregated cart items
                Object.values(aggregatedItems).forEach(cartItem => {
                    userContent.innerHTML += `
                        <div class="cart-item">
                            <p>Food Item ID: ${cartItem.foodItemId}</p>
                            <p>Quantity: ${cartItem.quantity}</p>
                        </div>
                    `;
                });
            } else {
                userContent.innerHTML += '<p>Your shopping cart is empty.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}

// Assuming userId is available in your context
const userId = localStorage.getItem('userId');
viewShoppingCart(userId);
// Function to view user's orders

// Function to view user's orders
function viewOrders(userId) {
    const userContent = document.getElementById('user-content');

    // Check if userContent is null before proceeding
    if (!userContent) {
        console.error('Error: user-content element not found.');
        return;
    }

    fetch(`/api/user/viewCart/${userId}`)
        .then(response => response.json())
        .then(data => {
            userContent.innerHTML = '<h2>View Order</h2>';

            if (data.cart && data.cart.items.length > 0) {
                // Temporary object to hold aggregated quantities
                const aggregatedItems = {};

                // Aggregate quantities
                data.cart.items.forEach(cartItem => {
                    if (aggregatedItems[cartItem.foodItemId]) {
                        aggregatedItems[cartItem.foodItemId].quantity += cartItem.quantity;
                    } else {
                        aggregatedItems[cartItem.foodItemId] = { ...cartItem };
                    }
                });

                // Display aggregated cart items
                Object.values(aggregatedItems).forEach(cartItem => {
                    userContent.innerHTML += `
                        <div class="cart-item">
                            <p>Food Item ID: ${cartItem.foodItemId}</p>
                            <p>Quantity: ${cartItem.quantity}</p>
                            
                        </div>
                    `;
                });
            } else {
                userContent.innerHTML += '<p>Your Order List is empty.</p>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred');
        });
}





// Function to delete an item from the order
async function deleteItemFromOrder(userId, foodItemId) {
    try {
        const response = await fetch(`/api/user/deleteItemFromOrder/${userId}/${foodItemId}`, {
            method: 'DELETE',
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Display success message
            alert(data.message);

            // Refresh the order details after deleting an item
            viewOrder(userId);
        } else {
            // Display error message from the server
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        // Handle unexpected error
        console.error('Error deleting item from order:', error);
        alert('An unexpected error occurred');
    }
}


// Function to get food item details by ID (you need to implement this based on your data structure)
function getFoodItemDetails(foodItemId) {
    // Implement logic to retrieve food item details from your data source (e.g., API)
    // Replace this with actual implementation based on your data structure
    // Example: const foodItem = fetch(`/api/foodItems/${foodItemId}`).then(response => response.json());
    // Note: This is a placeholder, you should replace it with your actual logic.
    return { name: 'Food Item Name', price: 10.99 }; // Replace with actual details
}

// Function to delete an item from the order
async function deleteItemFromOrder(userId, foodItemId) {
    try {
        // Send a request to the server to remove the item from the shopping cart
        const response = await fetch(`/api/user/removeFromCart/${userId}/${foodItemId}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (response.ok) {
            // Refresh the order details after deleting the item
            viewOrder(userId);
            alert(data.message); // Display success message
        } else {
            alert(`Error: ${data.message}`); // Display error message
        }
    } catch (error) {
        console.error('Error deleting item from order:', error);
        alert('An unexpected error occurred. Please try again.');
    }
}


function logout() {
    // Clear user-related information from local storage
    localStorage.removeItem('userId');

    // Redirect to the login or home page
    window.location.href = 'index.html'; // Replace 'login.html' with the actual path to your login page
}