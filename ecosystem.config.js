module.exports = {
  apps: [
    {
      name: "node-ts-prisma-auth-boilerplate",
      script: "npm",
      args: "run dev",
      env: {
        NODE_ENV: "development",
      },
    },
  ],
};
