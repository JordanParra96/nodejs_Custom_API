import express from 'express'; // levantar servidores 
import fs from 'fs'; // trabajar con archivos del sistema
import bodyparser from 'body-parser'; // analizar el cuerpo de las solicitudes

const app = express();
app.use(bodyparser.json()); // Middleware to parse JSON bodies

const readData = () => {
    try {
        const data = fs.readFileSync('./db.json'); // ReadFileSync lee el archivo de forma sincrónica
        return(JSON.parse(data));
    }
    catch (error) {
        console.error('Error reading file:', error);
    }
};

const writeData = (data) => {
    try {
        fs.writeFileSync('./db.json', JSON.stringify(data)); // WriteFileSync escribe el archivo de forma sincrónica
        console.log('Data written successfully');
    } catch (error) {
        console.error('Error writing file:', error);
    }
};

app.get('/', (req, res) => {
  res.send('Welcome to my first API!!!');
});

// Endpoint to read data from db.json
app.get('/products', (req, res) => {
    const data = readData(); // Read the data from db.json
    res.json(data.products); // Send the products as a JSON response
});

// Endpoint to get a specific product by ID
app.get('/products/:id', (req, res) => {
    const data = readData(); // Read the data from db.json
    const productId = parseInt(req.params.id); // Get the product ID from the request parameters
    const product = data.products.find((prod) => prod.id === productId); // Find the product by ID
    if (product) {
        res.json(product); // Send the product as a JSON response
    } else {
        res.status(404).json({ message: 'Product not found' }); // Send a 404 error if the product is not found
    }
});

// Endpoint to add a new product
app.post('/products', (req, res) => {
    const data = readData(); // Read the data from db.json
    const body = req.body; // Get the new product data from the request body
    const newProduct = {
        id: data.products.length + 1, // Assign a new ID based on the current length of the products array
        ...body // Spread the body to include all other product properties
    };
    data.products.push(newProduct); // Add the new product to the products array
    writeData(data); // Write the updated data back to db.json
    res.status(201).json(newProduct); // Send the new product as a JSON response with a 201 status code
});

// Endpoint to update an existing product by ID
app.put('/products/:id', (req, res) => {
    const data = readData(); // Read the data from db.json
    const body = req.body; // Get the new product data from the request body
    const productId = parseInt(req.params.id); // Get the product ID from the request parameters
    const index = data.products.findIndex((prod) => prod.id === productId); // Find the index of the product by ID
    data.products[index] = {
        ...data.products[index], // Keep the existing product properties
        ...body // Update with the new properties from the request body
    };
    writeData(data); // Write the updated data back to db.json
    res.json({
        message: 'Product updated successfully',
        product: data.products[index] // Send the updated product as a JSON response})
    });
});

// Endpoint to delete a product by ID
app.delete('/products/:id', (req, res) => {
    const data = readData(); // Read the data from db.json
    const productId = parseInt(req.params.id); // Get the product ID from the request parameters
    const index = data.products.findIndex((prod) => prod.id === productId); // Find the index of the product by ID
    if (index !== -1) {
        data.products.splice(index, 1); // Remove the product from the products array
        writeData(data); // Write the updated data back to db.json
        res.json({ message: 'Product deleted successfully' }); // Send a success message as a JSON response
    } else {
        res.status(404).json({ message: 'Product not found' }); // Send a 404 error if the product is not found
    }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});