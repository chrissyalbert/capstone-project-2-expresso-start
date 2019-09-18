const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId', {$menuId: req.params.menuId}, (error, items) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menuItems: items});
    }
  });
});

menuItemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const description = req.body.menuItem.description;
  const menuId = req.params.menuId;

  if (!name || !inventory || !price) {
    res.sendStatus(400);
  }

  const sql = 'INSERT INTO MenuItem (name, inventory, price, description, menu_id) VALUES ($name, $inventory, $price, $description, $menuId)';
  const values = {
    $name: name, 
    $inventory: inventory, 
    $price: price, 
    $description: description, 
    $menuId: menuId
  };

  db.run(sql, values, function(error) {
    if(error) {
      next(error);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, item) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({menuItem: item});
        }
      });
    }
  });
});

module.exports = menuItemsRouter;