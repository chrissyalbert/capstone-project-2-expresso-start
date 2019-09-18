const express = require('express');
const menusRouter = express.Router();
const menuItemsRouter = require('./menuItems');
menusRouter.use('/:menusId/menu-items', menuItemsRouter);

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (error, menu) => {
    if(error) {
      next(error);
    } else {
      if (menu) {
        req.menu = menu;
        next();
      } else {
        res.sendStatus(404);
      }
    }  
    });
});

menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});

menusRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    res.sendStatus(400);
  }

  const sql = 'INSERT INTO Menu (title) VALUES ($title)';
  const values = {$title: title};

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, menu) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({menu: menu});
        }
      });
    }
  });
});

menusRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menusRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;

  if (!title) {
    res.sendStatus(400);
  }

  const sql = 'UPDATE Menu SET title = $title WHERE id = $menuId';
  const values = {
    $title: title,
    $menuId: req.params.menuId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`, (error, menu) => {
        if (error) {
          next(error);
        } else {
          res.status(200).json({menu: menu});
        }
      });
    }
  });
});

menusRouter.delete('/:menuId', (req, res, next) => {
  const itemsSql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
  const itemsValues = {$menuId: req.params.menuId};
  db.get(itemsSql, itemsValues, (error, item) => {
    if (error) {
      next(error);
    } else if (item) {
      res.sendStatus(400);
    } else {
      db.run('DELETE FROM Menu WHERE id = $menuId', {$menuId: req.params.menuId}, error => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});

module.exports = menusRouter;