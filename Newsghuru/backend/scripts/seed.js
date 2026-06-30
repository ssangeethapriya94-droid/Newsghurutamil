const seedUsers = [
  {
    name: "Admin User",
    email: process.env.ADMIN_EMAIL || "newsghuruadmin@gmail.com",
    password: process.env.ADMIN_PASSWORD || "adminnewsghuru123",
    role: "admin",
  },
  {
    name: "Editor User",
    email: "editor@newsghuru.com",
    password: "editorpassword123",
    role: "editor",
  },
  {
    name: "Reporter User",
    email: "reporter@newsghuru.com",
    password: "reporterpassword123",
    role: "reporter",
  },
];

module.exports = seedUsers;
