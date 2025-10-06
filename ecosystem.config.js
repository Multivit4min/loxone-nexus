module.exports = {
  apps: [{
    name: "loxone-nexus",
    script: "npm",
    args: "start",
    watch: false,
    autorestart: true,
    instances: 1,
    exec_mode: "fork",
    max_memory_restart: "500M",
    error_file: "./data/err.log",
    out_file: "./data/out.log"
  }],
}