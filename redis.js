const IORedis = require('ioredis');
const util = require('util');

const redis = new IORedis({
  port: 6379,
  host: "127.0.0.1",
});
redis.get = util.promisify(redis.get);

function getUsers() {
  return new Promise((resolve, reject) => {
      redis.smembers("users", (err, users) => {
          if (err) {
              reject(err);
          } else {
              resolve(users);
          }
      });
  });
}

function getLastAssignedIndex() {
  return redis.get("lastAssignedIndex");
}

function setLastAssignedIndex(index) {
  return new Promise((resolve, reject) => {
      redis.set("lastAssignedIndex", index, (err) => {
          if (err) {
              reject(err);
          } else {
              resolve();
          }
      });
  });
}

function assignTaskToUser(task, user) {
  // Implement task assignment logic here
  console.log(`Assigned task "${task}" to user ${user}`);
  // You may want to update task status or perform other actions here
}

async function assignTask(task) {
  try {
      const users = await getUsers();
      if (users.length === 0) {
          throw new Error("No users available");
      }

      let lastAssignedIndex = await getLastAssignedIndex();

      const assignedUser = users[lastAssignedIndex];
      assignTaskToUser(task, assignedUser);

      // Update last assigned index for next assignment
      lastAssignedIndex = (lastAssignedIndex + 1) % users.length;
      await setLastAssignedIndex(lastAssignedIndex);

      return assignedUser;
  } catch (error) {
      throw new Error("Task assignment failed: " + error.message);
  }
}

(() => {
  assignTask("Task 4");
})();
