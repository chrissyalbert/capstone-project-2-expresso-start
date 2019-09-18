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

module.exports = menuItemsRouter;