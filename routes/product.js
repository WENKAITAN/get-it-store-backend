const express = require('express');
const router = express.Router();
const { Product } = require('../models')
// const Redis = require('redis')

// let redisClient;

// (async () => {
//   redisClient = Redis.createClient();

//   redisClient.on('error', (err) => console.log('Redis Client Error', err));

//   await redisClient.connect();
  
// })();

// const DEFAULT_EXPIRATION = 3600

//only admin can create a new product
router.post('/new', async (req, res) => {
    const { name, price, description, imageLink, shelf, color } = req.body;
    try {
        const product = await Product.create({name, price, description, imageLink, shelf, color});
        return res.json(product);
    }catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})
//anyone can access the product lists
router.get('/', async (req, res) => {
    // const products = await redisClient.get('products');
    // if(products != null){
    //     console.log("Cache hit")
    //     return res.json(JSON.parse(products))
    // }


    try{
        // console.log("Cache missed")
        const products = await Product.findAll();
        //redisClient.setEx("products", DEFAULT_EXPIRATION, JSON.stringify(products))
        return res.json(products)

    }catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})

// anyone can access the specified product
router.get('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    // const product = await redisClient.get(`products/${product_id}`);
    // if(product != null){
    //     console.log("Cache hit")
    //     return res.json(JSON.parse(product))
    // }
    try{
        //console.log("Cache missed")
        const product = await Product.findOne({
            where: { product_id}
        })
        //redisClient.setEx(`products/${product_id}`, DEFAULT_EXPIRATION, JSON.stringify(product))
        return res.json(product)
    }catch (err) {
        console.log(err)
        return res.status(500).json(err)
    }
})
//only admin can change the product info
router.patch('/:product_id', async (req, res) => {
    const { product_id } = req.params;
    const { name, price, description, imageLink, shelf, color } = req.body;
    try{
        const product = await Product.findOne({where: {product_id}});
        if(name){
            product.name = name;
        }
        if(price){
            product.price = price;
        }
        if(description){
            product.description = description;
        }
        if(imageLink){
            product.imageLink = imageLink;
        }
        if(shelf){
            product.shelf = shelf;
        }
        if(color){
            product.color = color;
        }

        await product.save();

        return res.json(product)
    }catch(e){
        console.log(e);
        return res.status(500).json(e)
    }
})
// only admin can delete product
router.delete('/:product_id', async(req, res) => {
    const { product_id } = req.params;
    try{
        const product = await Product.findOne({where: {product_id}});

        await product.destroy();
        return res.json("Product deleted!")
    }catch(e){
        console.log(e);
        return res.status(500).json(e)
    }
})

module.exports = router;