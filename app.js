const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbpath = path.join(__dirname, "todoApplication.db");
let db = null;

const format = require("date-fns/format");
const connectdbandstartserver = async () => {
  try {
    db = await open({ filename: dbpath, driver: sqlite3.Database });
    app.listen(3000, () => {
      //   let a = [
      //     [
      //       { a: "b", b: "c" },
      //       { a: "b", b: "c" },
      //     ],
      //   ];
      //   a.map((obj) => console.log(obj));
      console.log("server started at port 3000");
      //   console.log(typeof a);
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};
connectdbandstartserver();

const priorityarray = ["HIGH", "MEDIUM", "LOW"];
const statusarray = ["TO DO", "IN PROGRESS", "DONE"];
const categoryarray = ["WORK", "HOME", "LEARNING"];
const representobj = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    category: obj.category,
    status: obj.status,
    dueDate: obj.due_date,
  };
};
const haspriorityandstatus = (obj) => {
  return obj.priority !== undefined && obj.status !== undefined;
};

const hascategoryandstatus = (obj) => {
  return obj.category !== undefined && obj.status !== undefined;
};

const hascategoryandpriority = (obj) => {
  return obj.category !== undefined && obj.priority !== undefined;
};

const hasstatus = (obj) => {
  return obj.status !== undefined;
};
const haspriority = (obj) => {
  return obj.priority !== undefined;
};
const hassearchq = (obj) => {
  return obj.search_q !== undefined;
};
const hascategory = (obj) => {
  return obj.category !== undefined;
};

app.get("/todos/", async (req, res) => {
  const { status, priority, search_q = "", category } = req.query;

  let query;
  let invalid = "";
  // const statusresult = statusarray.includes(status);
  // if(statusresult){

  // }
  switch (true) {
    case haspriorityandstatus(req.query):
      query = `select * from todo where priority = '${priority}' AND status = '${status}';`;
      break;
    case hascategoryandstatus(req.query):
      query = `select * from todo where category= '${category}' AND status = '${status}';`;
      break;
    case hascategoryandpriority(req.query):
      query = `select * from todo where category = '${category}' AND priority='${priority}';`;
      break;
    case hasstatus(req.query):
      if (statusarray.includes(status)) {
        query = `select * from todo where status = '${status}';`;
      } else {
        invalid = "Invalid Todo Status";
      }
      break;
    case haspriority(req.query):
      if (priorityarray.includes(priority)) {
        query = `select * from todo where priority = '${priority}';`;
      } else {
        invalid = "Invalid Todo Priority";
      }
      break;
    case hascategory(req.query):
      if (categoryarray.includes(category)) {
        query = `select * from todo where category='${category}';`;
      } else {
        invalid = "Invalid Todo Category";
      }
      break;
    default:
      query = `select * from todo where todo like '%${search_q}%';`;
      break;
  }
  if (invalid === "") {
    const responsedb = await db.all(query);
    res.send(responsedb.map((obj) => representobj(obj)));
  } else {
    res.status(400);
    res.send(invalid);
  }
});

app.get("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const query = `select * from todo where id=${todoId};`;
  const responsedb = await db.get(query);
  res.send(representobj(responsedb));
});

app.get("/agenda/", async (req, res) => {
  try {
    const { date } = req.query;
    // let testdate = $.datepicker.parseDate("mm/dd/yy", date);
    const dateformat = format(new Date(date), "yyyy-MM-dd");
    // if (new Date(date).toString() !== "Invalid Date") {
    const query = `select * from todo where due_date = '${dateformat}';`;
    const responsedb = await db.all(query);
    res.send(responsedb.map((obj) => representobj(obj)));
    // }
  } catch (e) {
    res.status(400);
    res.send("Invalid Due Date");
  }
  //   const { date } = req.query;
  //   //   const type = "yyyy-MM-dd";
  //   //   console.log(date);
  //   const dateformat = format(new Date(date), "yyyy-MM-dd");
  //   //   console.log(dateformat);
  //   //   res.send(`hi this is date: ${dateformat}`);
  //   if (new Date(date).toString() !== "Invalid Date") {
  //     const query = `select * from todo where due_date = '${dateformat}';`;
  //     const responsedb = await db.all(query);
  //     res.send(responsedb.map((obj) => representobj(obj)));
  //   } else {
  //     res.status(400);
  //     res.send("Invalid Due Date");
  //   }
});

app.post("/todos/", async (req, res) => {
  let invalid = "";
  const { id, todo, category, priority, status, dueDate } = req.body;
  if (priorityarray.includes(priority)) {
    if (statusarray.includes(status)) {
      if (categoryarray.includes(category)) {
        if (new Date(dueDate).toString() !== "Invalid Date") {
          const query = `INSERT INTO todo(id,todo,category,priority,status,due_date)
    VALUES(${id},
        '${todo}',
        '${category}',
        '${priority}',
        '${status}',
        '${dueDate}');`;
          await db.run(query);
          res.send("Todo Successfully Added");
        } else {
          res.status(400);
          res.send("Invalid Due Date");
        }
      } else {
        res.status(400);
        res.send("Invalid Todo Category");
      }
    } else {
      res.status(400);
      res.send("Invalid Todo Status");
    }
  } else {
    res.status(400);
    res.send("Invalid Todo Priority");
  }

  //   if (priorityarray.includes(priority)) {
  //     ok = "ok";
  //   } else {
  //     invalid = "Invalid Todo Priority";
  //   }
  //   if (statusarray.includes(status)) {
  //     ok = "ok";
  //   } else {
  //     invalid = "Invalid Todo Status";
  //   }
  //   if (categoryarray.includes(category)) {
  //     ok = "pk";
  //   } else {
  //     invalid = "Invalid Todo Category";
  //   }
  //   if (new Date(dueDate).toString() !== "Invalid Date") {
  //     ok = "ok";
  //   } else {
  //     invalid = "Invalid Due Date";
  //   }
  //   if ((invalid = "")) {
  //   } else {
  //     res.status(400);
  //     res.send(invalid);
  //   }
});

app.put("/todos/:todoId", async (req, res) => {
  let invalid = "";
  const { todoId } = req.params;
  const query = `select * from todo where id = ${todoId}`;
  const previousdata = await db.get(query);
  const requestbody = req.body;
  let updatedcolumn;
  switch (true) {
    case requestbody.status !== undefined:
      if (statusarray.includes(requestbody.status)) {
        updatedcolumn = "Status";
      } else {
        invalid = "Invalid Todo Status";
      }
      break;
    case requestbody.priority !== undefined:
      if (priorityarray.includes(requestbody.priority)) {
        updatedcolumn = "Priority";
      } else {
        invalid = "Invalid Todo Priority";
      }
      break;
    case requestbody.todo !== undefined:
      updatedcolumn = "Todo";
      break;
    case requestbody.category !== undefined:
      if (categoryarray.includes(requestbody.category)) {
        updatedcolumn = "Category";
      } else {
        invalid = "Invalid Todo Category";
      }
      break;
    case requestbody.dueDate !== undefined:
      if (new Date(requestbody.dueDate).toString() !== "Invalid Date") {
        updatedcolumn = "Due Date";
      } else {
        invalid = "Invalid Due Date";
      }
      //   updatedcolumn = "Due Date";
      break;
  }

  if (invalid === "") {
    const {
      id = previousdata.id,
      todo = previousdata.todo,
      category = previousdata.category,
      priority = previousdata.priority,
      status = previousdata.status,
      dueDate = previousdata.due_date,
    } = req.body;
    const updatequery = `
    UPDATE todo 
    SET 
        todo = '${todo}',
        category = '${category}',
        priority = '${priority}',
        status = '${status}',
        due_date = '${dueDate}'
    where id = ${todoId};
  `;
    const responsedb = await db.run(updatequery);
    res.send(`${updatedcolumn} Updated`);
  } else {
    res.status(400);
    res.send(invalid);
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const query = `delete  from todo where id=${todoId};`;
  const responsedb = await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
