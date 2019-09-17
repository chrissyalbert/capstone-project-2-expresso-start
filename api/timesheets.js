const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const sql = 'SELECT * FROM Timesheet WHERE id = $timesheetId';
  const values = {$timesheetId: timesheetId};
  db.get(sql, values, (error, timesheet) => {
    if(error) {
      next(error);
    } else {
      if (timesheet) {
        req.timesheet = timesheet;
        next();
      } else {
        res.sendStatus(404);
      }
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', {$employeeId: req.params.employeeId}, (error, timesheets) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({timesheets: timesheets});
    }
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    res.sendStatus(400);
  }

  const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
  const values = {
    $hours: hours, 
    $rate: rate, 
    $date: date, 
    $employeeId: employeeId
  };

  db.run(sql, values, function(error) {
    if (error) {
      next(error)
    } else {
      db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, timesheet) => {
        if (error) {
          next(error);
        } else {
          res.status(201).json({timesheet: timesheet});
        }
      });
    }
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;

  if (!hours || !rate || !date) {
    res.sendStatus(400);
  }

  const sql = 'UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.id = $timesheetId';
  const values = {
    $hours: hours, 
    $rate: rate, 
    $date: date, 
    $employeeId: employeeId, 
    $timesheetId: req.params.timesheetId
  };

  db.run(sql, values, (error, timesheet) => {
    if (error) {
      next(error);
    } else {
      db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: req.params.timesheetId}, (error, timesheet) => {
        if (error) {
          next(error);
        } else {
          res.status(200).json({timesheet: timesheet});
        }
      });
    }
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run('DELETE FROM Timesheet WHERE id = $timesheetId', {$timesheetId: req.params.timesheetId}, (error) => {
    if (error) {
      next(error);
    } else {
      res.sendStatus(204);
    }
  });
});

module.exports = timesheetsRouter;