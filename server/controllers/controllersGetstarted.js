const getStartedService = require('../services/servicesGetstarted');

class GetStartedController {
  async createReferral(req, res) {
  try {
    const { email, referralCode } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if email already exists
    const existing = await getStartedService.getByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const newReferral = await getStartedService.createReferral({ email, referralCode: referralCode || '' });
    res.status(201).json({ message: 'Success', data: newReferral });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

  async getAllReferrals(req, res) {
    try {
      const referrals = await getStartedService.getAllReferrals();
      res.json(referrals);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new GetStartedController();