// Placeholder figures for Part 1. Real income and tax come from transactions in Part 2.
function getDashboard(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      user: { id: req.user.id, email: req.user.email },
      summary: {
        currency: "ZAR",
        grossIncome: 0,
        estimatedTax: 0,
        netIncome: 0,
      },
    },
  });
}

module.exports = { getDashboard };
