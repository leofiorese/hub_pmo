module.exports = {
    apps: [{
        name: "backend-pmo-hub",
        script: "./src/app.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
            NODE_ENV: "development",
        },
        env_production: {
            NODE_ENV: "production",
        }
    }]
}
