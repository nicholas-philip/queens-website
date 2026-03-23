// Simple logger to prevent server crashes
const logActivity = async (req, action, details) => {
  console.log(`📝 Audit Log: [${action}] ${details}`);
};
module.exports = logActivity;
