import express from 'express'; // levantar servidores 
import bodyparser from 'body-parser'; // analizar el cuerpo de las solicitudes
import { createConnection } from './config/database.js'; // importar la función de conexión a la base de datos

const app = express();
app.use(bodyparser.json()); // Middleware to parse JSON bodies

// Función para ejecutar consultas a la base de datos
const executeQuery = async (query, params = []) => {
    let connection;
    try {
        connection = await createConnection();
        const [results] = await connection.execute(query, params);
        return results;
    } catch (error) {
        console.error('Error executing query:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};

app.get('/', (req, res) => {
  res.send('Welcome to my first API!!!');
});

// Endpoint to get all products
app.get('/products', async (req, res) => {
    try {
        const query = 'SELECT * FROM products ORDER BY id';
        const products = await executeQuery(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Endpoint to get a specific product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const query = 'SELECT * FROM products WHERE id = ?';
        const products = await executeQuery(query, [productId]);
        
        if (products.length > 0) {
            res.json(products[0]);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error.message });
    }
});

// Endpoint to add a new product
app.post('/products', async (req, res) => {
    try {
        const { name, category, price } = req.body;
        
        // Validate required fields
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        const query = `
            INSERT INTO products (name, category, price) 
            VALUES (?, ?, ?)
        `;
        const params = [name || null, price || 0, category || null];
        
        const result = await executeQuery(query, params);
        
        // Fetch the newly created product to return it
        const newProductQuery = 'SELECT * FROM products WHERE id = ?';
        const newProduct = await executeQuery(newProductQuery, [result.insertId]);
        
        res.status(201).json(newProduct[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Endpoint to update an existing product by ID
app.put('/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        const { name, category, price } = req.body;
        
        // Validate if the product exists
        const checkQuery = 'SELECT * FROM products WHERE id = ?';
        const existingProduct = await executeQuery(checkQuery, [productId]);
        
        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Prepare the update query
        const updateQuery = `
            UPDATE products 
            SET name = ?, category = ?, price = ?
            WHERE id = ?
        `;
        const params = [
            name || existingProduct[0].name,
            category !== undefined ? category : existingProduct[0].category,
            price !== undefined ? price : existingProduct[0].price,
            productId
        ];
        
        await executeQuery(updateQuery, params);
        
        // Fetch the updated product to return it
        const updatedProduct = await executeQuery(checkQuery, [productId]);
        
        res.json({
            message: 'Product updated successfully',
            product: updatedProduct[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error.message });
    }
});

// Endpoint to delete a product by ID
app.delete('/products/:id', async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        // Validate if the product exists
        const checkQuery = 'SELECT * FROM products WHERE id = ?';
        const existingProduct = await executeQuery(checkQuery, [productId]);
        
        if (existingProduct.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Prepare the delete query
        const deleteQuery = 'DELETE FROM products WHERE id = ?';
        await executeQuery(deleteQuery, [productId]);
        
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error.message });
    }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
  console.log('API connected to MySQL database');
});