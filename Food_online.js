const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');


const userDataPath = path.join(__dirname, 'users.json');
const userData = JSON.parse(fs.readFileSync(userDataPath, 'utf-8'));
const dataFilePath = path.join(__dirname, 'data.json');
const dataData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));

const secretKey = 'yourSecretKey'; // Replace with a secure secret key

const app = express();
app.use(bodyParser.json());

// Serve static files from the main directory
app.use(express.static(__dirname));


class FoodItem {
    constructor(id, name, image, description, price, category, isEnabled = true) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.description = description;
        this.price = price;
        this.category = category;
        this.isEnabled = isEnabled;
    }
}
class ShoppingCart {
    constructor(userId) {
        this.userId = userId;
        this.items = [];
    }

    addItem(foodItemId, quantity) {
        this.items.push({ foodItemId, quantity });
    }

    removeItem(foodItemId) {
        const index = this.items.findIndex((item) => item.foodItemId === foodItemId);
        if (index !== -1) {
            this.items.splice(index, 1);
        }
    }

    updateItemQuantity(foodItemId, quantity) {
        const item = this.items.find((item) => item.foodItemId === foodItemId);
        if (item) {
            item.quantity = quantity;
        }
    }
}


class Order {
    constructor(id, foodItemId, userId, deliveryStatus = 'Pending') {
        this.id = id;
        this.foodItemId = foodItemId;
        this.userId = userId;
        this.deliveryStatus = deliveryStatus;
    }
}

class Transaction {
    constructor(id, userId, amount, date) {
        this.id = id;
        this.userId = userId;
        this.amount = amount;
        this.date = date;
    }
}

class User {
    constructor(id, username, password, email) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
    }
}

class Admin {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    // You can add authentication logic here
}


// In-memory storage
let shoppingCarts = [];
let foodItems = [];
let orders = [];
let transactions = [];


// API to login as an admin
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the provided username and password match any admin
    const admin = admins.find((a) => a.username === username && a.password === password);

    if (admin) {
        // Send the admin's user ID along with the success message
        res.json({ success: true, message: 'Admin login successful', userId: admin.id });
    } else {
        res.status(401).json({ success: false, message: 'Invalid admin credentials' });
    }
});

// API to login as a user
app.post('/api/user/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the provided username and password match any user
    const user = users.find((u) => u.username === username && u.password === password);

    if (user) {
        // Send the user's details along with the success message
        const { id, username, email } = user;
        res.json({ success: true, message: 'User login successful', userId: id, user: { id, username, email } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid user credentials' });
    }
});


// API to view all food items
app.get('/api/admin/viewFoodItems', (req, res) => {
    res.json(foodItems);
});

// API to get details of a specific food item for editing
app.get('/api/admin/viewFoodItem/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const foodItem = foodItems.find((item) => item.id === id);

    if (foodItem) {
        res.json(foodItem);
    } else {
        res.status(404).json({ success: false, message: 'Food item not found' });
    }
});
// API to add a new food item
app.post('/api/admin/addFoodItem', (req, res) => {
    try {
        const { name, image, description, price, category } = req.body;
        const id = foodItems.length + 1;
        const newFoodItem = new FoodItem(id, name, image, description, price, category);
        foodItems.push(newFoodItem);

        const updatedData = { admins, users, foodItems };

        console.log('Updated data:', updatedData);

        // Save the updated data to the data.json file
        fs.writeFile(dataFilePath, JSON.stringify(updatedData), 'utf-8', (err) => {
            if (err) {
                console.error('Error writing data to data.json:', err);
                res.status(500).json({ success: false, message: 'Error writing data to data.json', error: err });
            } else {
                console.log('Data successfully written to data.json', updatedData);
                res.json({ success: true, message: 'Food item added successfully', foodItem: newFoodItem });
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ success: false, message: 'Error processing request', error: error.message });
    }
});

// API to edit food item details
app.put('/api/admin/editFoodItem/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, image, description, price, category } = req.body;
    const foodItem = foodItems.find((item) => item.id === id);

    if (foodItem) {
        if (name !== undefined) foodItem.name = name;
        if (image !== undefined) foodItem.image = image;
        if (description !== undefined) foodItem.description = description;
        if (price !== undefined) foodItem.price = price;
        if (category !== undefined) foodItem.category = category;

        const updatedData = { admins, users, foodItems };

        // Save the updated data to the data.json file
        fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf-8', (err) => {
            if (err) {
                console.error('Error writing data to data.json:', err);
                res.status(500).json({ success: false, message: 'Error writing data to data.json', error: err });
            } else {
                console.log('Data successfully written to data.json', updatedData);
                res.json({ success: true, message: 'Food item updated successfully', foodItem });
            }
        });
    } else {
        res.status(404).json({ success: false, message: 'Food item not found' });
    }
});


// API to delete a food item
app.delete('/api/admin/deleteFoodItem/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = foodItems.findIndex((item) => item.id === id);

    if (index !== -1) {
        foodItems.splice(index, 1);

        // Call the deleteData function to update data.json
        deleteData();

        res.json({ success: true, message: 'Food item deleted successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Food item not found' });
    }
});

// API to update delivery status of a food order
app.put('/api/admin/updateDeliveryStatus/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { deliveryStatus } = req.body;
    const order = orders.find((o) => o.id === id);

    if (order) {
        order.deliveryStatus = deliveryStatus;
        res.json({ success: true, message: 'Delivery status updated successfully', order });
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// API to view transactions based on date and total amount
app.get('/api/admin/viewTransactions', (req, res) => {
    const { date, totalAmount } = req.query;

    let filteredTransactions = transactions;

    if (date) {
        filteredTransactions = filteredTransactions.filter((t) => t.date === date);
    }

    if (totalAmount) {
        filteredTransactions = filteredTransactions.filter((t) => t.amount === parseFloat(totalAmount));
    }

    res.json(filteredTransactions);
});

// API to view all registered users
app.get('/api/admin/viewUsers', (req, res) => {
    res.json(users);
});
app.post('/api/user/register', (req, res) => {
    const { username, password, email } = req.body;
    const id = users.length + 1;
    const newUser = new User(id, username, password, email);
    users.push(newUser);

    // Create a shopping cart for the user
    const shoppingCart = new ShoppingCart(id);
    shoppingCarts.push(shoppingCart);

    res.json({ success: true, message: 'User registered successfully', user: newUser });
});


// API to view menu list
app.post('/api/user/register', (req, res) => {
    const { username, password, email } = req.body;
    const id = users.length + 1;
    const newUser = new User(id, username, password, email);
    users.push(newUser);

    // Create a shopping cart for the user
    const shoppingCart = new ShoppingCart(id);
    shoppingCarts.push(shoppingCart);

    res.json({ success: true, message: 'User registered successfully', user: newUser });
});


// API to view menu list
app.get('/api/user/menuList', (req, res) => {
    res.json(foodItems);
});

// API to view item details
app.get('/api/user/itemDetails/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const foodItem = foodItems.find((item) => item.id === id);

    if (foodItem) {
        res.json(foodItem);
    } else {
        res.status(404).json({ success: false, message: 'Food item not found' });
    }
});

// Function to initialize the shopping cart for a new user
const initializeShoppingCart = (userId) => {
    shoppingCarts.push({ userId, items: [] });
};


// Function to read data from the JSON file
function readDataFile() {
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
}

// Function to write data to the JSON file
function writeDataFile(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}


const { promises: fsPromises } = require('fs');

async function readDataFromJson() {
    try {
        const data = await fsPromises.readFile('data.json', 'utf-8');

        if (!data) {
            // If the file is empty or not found, initialize with default values
            console.log('Initializing data with default values.');
            return { foodItems: [], shoppingCarts: [] };
        }

        const parsedData = JSON.parse(data);

        if (!parsedData.shoppingCarts) {
            // If shoppingCarts is not present in the parsed data, initialize with default values
            console.log('Shopping carts not found in parsed data. Initializing with default values.');
            return { foodItems: parsedData.foodItems || [], shoppingCarts: [] };
        }

        return parsedData;
    } catch (error) {
        console.error('Error reading data from data.json:', error);

        if (error.code === 'ENOENT') {
            // If the file does not exist, initialize with default values
            console.log('File not found. Initializing data with default values.');
            return { foodItems: [], shoppingCarts: [] };
        }

        throw error;
    }
}



async function saveDataToJson(data) {
    try {
        await fsPromises.writeFile('data.json', JSON.stringify(data, null, 2), 'utf-8');
        console.log('Data saved to data.json');
    } catch (error) {
        console.error('Error saving data to data.json:', error);
        throw error;
    }
}


// API to add an item to the user's shopping cart
app.post('/api/user/addToCart/:userId/:foodId', async (req, res) => {
    const userId = req.params.userId;
    const foodId = parseInt(req.params.foodId);

    try {
        const { foodItems, shoppingCarts } = await readDataFromJson();

        const userCart = shoppingCarts.find(cart => cart.userId === userId);
        const foodItem = foodItems.find(item => item.id === foodId);

        if (!userCart) {
            const newUserCart = new ShoppingCart(userId);
            shoppingCarts.push(newUserCart);
            await saveDataToJson({ foodItems, shoppingCarts });
            console.log('Shopping cart created for user:', userId);
        }

        const updatedUserCart = shoppingCarts.find(cart => cart.userId === userId);

        if (updatedUserCart && foodItem) {
            updatedUserCart.items.push({ foodItemId: foodId, quantity: 1 });
            await saveDataToJson({ foodItems, shoppingCarts });

            console.log('Item added to the cart successfully');
            res.json({ success: true, message: 'Item added to the cart successfully', cart: updatedUserCart });
        } else {
            console.log('User or food item not found');
            res.status(404).json({ success: false, message: 'User or food item not found', shoppingCarts });
        }
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});

// API to view the user's shopping cart
app.get('/api/user/viewCart/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const { foodItems, shoppingCarts } = await readDataFromJson();

        console.log('All shopping carts:', shoppingCarts); // Add this line for debugging

        const userCart = shoppingCarts.find(cart => cart.userId === userId);

        if (userCart) {
            res.json({ success: true, message: 'Shopping cart found', cart: userCart });
        } else {
            console.log('Shopping cart not found for userId:', userId);
            res.status(404).json({ success: false, message: 'Shopping cart not found', shoppingCarts });
        }
    } catch (error) {
        console.error('Error viewing cart:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
});


/// API to place an order
app.post('/api/user/placeOrder/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const shoppingCart = shoppingCarts.find((cart) => cart.userId === userId);

    console.log('Place Order Request - userId:', userId); // Add this log

    if (shoppingCart && shoppingCart.items.length > 0) {
        // ... (existing code)

        // Add the new order and transaction to their respective lists
        orders.push(newOrder);
        transactions.push(newTransaction);

        console.log('Order placed successfully - Order ID:', newOrder.id); // Add this log

        res.json({ success: true, message: 'Order placed successfully', orderId: newOrder.id });
    } else {
        res.status(400).json({ success: false, message: 'Shopping cart is empty' });
    }
});


// API to view orders for a user
app.get('/api/user/viewOrders/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    console.log('Requesting orders for userId:', userId); // Add this log

    const userOrders = orders.filter((order) => order.userId === userId);

    console.log('Orders response:', { success: true, orders: userOrders }); // Add this log

    if (userOrders.length > 0) {
        res.json({ success: true, orders: userOrders });
    } else {
        // Return an empty array when no orders are found
        res.json({ success: true, orders: [] });
    }
});






// API to delete an item from an order
app.delete('/api/user/deleteItemFromOrder/:userId/:foodItemId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const foodItemId = parseInt(req.params.foodItemId);

        // Find the order for the given user and food item
        const userOrder = orders.find((order) => order.userId === userId && order.foodItemId === foodItemId);

        if (userOrder) {
            // Perform the deletion logic here

            res.json({ success: true, message: 'Item deleted from the order successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Order not found for the user or item not in the order' });
        }
    } catch (error) {
        console.error('Error deleting item from order:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// API to remove an item from the shopping cart
app.delete('/api/user/removeFromCart/:userId/:foodItemId', (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const foodItemId = parseInt(req.params.foodItemId);

        const shoppingCart = shoppingCarts.find((cart) => cart.userId === userId);

        if (shoppingCart) {
            const itemIndex = shoppingCart.items.findIndex((item) => item.foodItemId === foodItemId);

            if (itemIndex !== -1) {
                // Remove the item from the shopping cart
                shoppingCart.items.splice(itemIndex, 1);
                res.json({ success: true, message: 'Item removed from the shopping cart' });
            } else {
                res.status(404).json({ success: false, message: 'Item not found in the shopping cart' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Shopping cart not found for userId: ' + userId });
        }
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// API to view purchase history
app.get('/api/user/purchaseHistory/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const userTransactions = transactions.filter((transaction) => transaction.userId === userId);
    res.json(userTransactions);
});

// API to reset password (simulated with a simple password update)
app.put('/api/user/resetPassword/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);
    const { currentPassword, newPassword } = req.body;
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex !== -1 && users[userIndex].password === currentPassword) {
        users[userIndex].password = newPassword;

        // Save updated users array to the file
        saveUsers(); // Add this line to save the changes

        res.json({ success: true, message: 'Password reset successful' });
    } else {
        res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
});

// Load existing users from the file
const loadUsers = () => {
    try {
        const data = fs.readFileSync(userDataPath, 'utf-8');
        return JSON.parse(data).users;
    } catch (error) {
        // File does not exist or is empty
        return [];
    }
};

// Save users array to the file
function saveUsers() {
    fs.writeFile(userDataPath, JSON.stringify({ admins, users }, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error writing users to users.json:', err);
        } else {
            console.log('Users successfully written to users.json');
        }
    });
}

// Load existing admins from the file
const loadAdmins = () => {
    try {
        const data = fs.readFileSync(userDataPath, 'utf-8');
        return JSON.parse(data).admins;
    } catch (error) {
        // File does not exist or is empty
        return [];
    }
};

// Save admins array to the file
const saveAdmins = (admins) => {
    fs.writeFile(userDataPath, JSON.stringify({ admins, users }, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error writing admins to users.json:', err);
        } else {
            console.log('Admins successfully written to users.json');
        }
    });
};


let users = loadUsers();
let admins = loadAdmins();

// API to get user details
app.get('/api/user/accountInfo/:userId', (req, res) => {
    const userId = parseInt(req.params.userId);

    // Find the user with the specified ID
    const user = users.find((u) => u.id === userId);

    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, message: 'User not found' });
    }
});




// Endpoint to change user password
app.put('/api/user/changePassword', (req, res) => {
    // Assume you have user authentication logic and user data available in the request
    const userId = req.user.id; // Replace with your actual user authentication logic
    const { currentPassword, newPassword } = req.body;

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1 && users[userIndex].password === currentPassword) {
        users[userIndex].password = newPassword;

        // Save updated users array to the file
        saveUsers();
        res.json({ success: true });
    } else {
        res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
});


// Load data from data.json on server start
const loadData = () => {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf-8');
        const parsedData = JSON.parse(data);

        // Update in-memory storage
        foodItems = parsedData.foodItems;
    } catch (error) {
        console.error('Error reading data.json:', error);
    }
};

const saveData = () => {
    const data = JSON.stringify({ foodItems }, null, 2);

    try {
        fs.writeFileSync(dataFilePath, data, 'utf-8');
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error writing data.json:', error);
    }
};

// Function to delete data
const deleteData = () => {
    const updatedData = { admins, users, foodItems };

    // Save the updated data to the data.json file
    fs.writeFile(dataFilePath, JSON.stringify(updatedData, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('Error writing data to data.json:', err);
        } else {
            console.log('Data successfully written to data.json', updatedData);
        }
    });
};

// Load data from data.json on server start
loadData();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});