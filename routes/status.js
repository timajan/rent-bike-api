const express = require('express');

const router = express.Router();

router.get('/status', (req, res) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();

  res.json({
    uptime: Number(uptime.toFixed(2)),
    uptimeFormatted: `${Math.floor(uptime / 60)} min ${Math.floor(uptime % 60)} sec`,
    memoryUsage: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    cpuUsage: {
      user: cpuUsage.user,
      system: cpuUsage.system,
    },
  });
});

module.exports = router;
