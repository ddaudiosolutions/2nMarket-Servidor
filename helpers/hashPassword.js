const bcryptjs = require("bcryptjs");

let hashpassword;
const hashPassword = async (newPassword) => {
  const salt = await bcryptjs.genSalt(10);
  hashpassword = await bcryptjs.hash(newPassword, salt);
  return hashpassword;
}

module.exports = hashPassword;