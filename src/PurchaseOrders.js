const pool = require("./config/db");

async function getOrders() {
  const connection = await pool.getConnection();
  try {
    const [rows, _fields] = await connection.execute(
      "SELECT * FROM purchase_orders"
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}
async function getOrder(id) {
  const connection = await pool.getConnection();
  try {
    const [row] = await connection.execute(
      "SELECT * FROM purchase_orders WHERE id = ?",
      [id]
    );
    const [rowDetails] = await connection.execute(
      "SELECT id, product_id, quantity, price FROM order_details WHERE order_id = ?",
      [id]
    );
    row.push(rowDetails);
    return row;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function verifyId(id) {
  const connection = await pool.getConnection();
  try {
    const [myId] = await connection.execute(
      "SELECT * FROM purchase_orders where id = ?",
      [id]
    );
    return myId.length;
  } catch (error) {
    throw error;
  }
}

async function checkTrack(track_number) {
  const connection = await pool.getConnection();
  try {
  const [track] = await connection.execute("SELECT track_number FROM purchase_orders")
    for(let i in track) {
      let get = track[i]
      if(get.track_number === track_number){
        return true
      }
    }
  } catch (error) {
    throw error
  } finally {
    connection.release();
  }
}

async function addOrder(order, orderDetails) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      "INSERT INTO purchase_orders(date, customer_id, delivery_address, track_number, status) VALUES (?, ?, ?, ?, ?)",
      [
        order.date,
        order.customer_id,
        order.delivery_address,
        order.track_number,
        order.status,
      ]
    );
    let newOrder = Object.assign({ id: results.insertId }, order);
    for (let item in orderDetails) {
      let detail = orderDetails[item];
      const [returned] = await connection.execute(
        "INSERT INTO order_details(order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [newOrder.id, detail.product_id, detail.quantity, detail.price]
      );
    }
    return results.insertId;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function editOrder(order, orderDetails) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      "update purchase_orders set date = ?, customer_id = ?, delivery_address = ?, track_number = ?, status = ? where id = ?",
      [order.date, order.customer_id, order.delivery_address, order.track_number, order.status, order.id]
      );
      for(let item in orderDetails) {
        let detail = orderDetails[item]
        const [result] = await connection.execute(
          "update order_details set product_id = ?, quantity = ?, price = ? where order_id = ?",
          [detail.product_id, detail.quantity, detail.price, order.id]
        );
      }
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}

async function dropOrder(id) {
  const connection = await pool.getConnection();
  try {
    const [results] = await connection.execute(
      "delete from purchase_orders where id = ?",
      [id]
    );
    return results.affectedRows;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
}


module.exports = {
  getOrders,
  addOrder,
  editOrder,
  dropOrder,
  getOrder,
  verifyId,
  checkTrack,
};
