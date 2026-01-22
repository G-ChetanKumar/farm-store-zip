const User = require("../models/UserModel");
const Counter = require("../models/CounterModel");

/**
 * User Counter Selection Controller
 * Handles user's preferred counter/store selection
 */

// Save user's preferred counter
exports.setPreferredCounter = async (req, res) => {
  try {
    const { userId, counterId } = req.body;

    console.log('Setting preferred counter:', { userId, counterId });

    if (!userId || !counterId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID and Counter ID are required" 
      });
    }

    // Verify counter exists
    const counter = await Counter.findById(counterId);
    if (!counter) {
      return res.status(404).json({ 
        success: false,
        message: "Counter not found" 
      });
    }

    // Update user's preferred counter
    const user = await User.findByIdAndUpdate(
      userId,
      {
        preferred_counter: counterId,
        counter_selection_date: new Date(),
        $inc: { counter_selection_count: 1 }
      },
      { new: true }
    ).populate('preferred_counter');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    console.log('Preferred counter updated successfully for user:', user.name);

    res.status(200).json({
      success: true,
      message: "Preferred counter set successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email
        },
        preferred_counter: user.preferred_counter,
        counter_selection_date: user.counter_selection_date,
        counter_selection_count: user.counter_selection_count
      }
    });
  } catch (error) {
    console.error('Error setting preferred counter:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get user's preferred counter
exports.getPreferredCounter = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId)
      .populate('preferred_counter')
      .select('name mobile email preferred_counter counter_selection_date counter_selection_count');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email
        },
        preferred_counter: user.preferred_counter,
        counter_selection_date: user.counter_selection_date,
        counter_selection_count: user.counter_selection_count
      }
    });
  } catch (error) {
    console.error('Error getting preferred counter:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get all users for a specific counter (Admin view)
exports.getUsersByCounter = async (req, res) => {
  try {
    const { counterId } = req.params;

    if (!counterId) {
      return res.status(400).json({ 
        success: false,
        message: "Counter ID is required" 
      });
    }

    // Verify counter exists
    const counter = await Counter.findById(counterId);
    if (!counter) {
      return res.status(404).json({ 
        success: false,
        message: "Counter not found" 
      });
    }

    // Get all users who selected this counter
    const users = await User.find({ preferred_counter: counterId })
      .select('name mobile email user_type counter_selection_date counter_selection_count status')
      .sort({ counter_selection_date: -1 });

    res.status(200).json({
      success: true,
      counter: {
        _id: counter._id,
        counterName: counter.counterName,
        pinCode: counter.pinCode,
        address: counter.address,
        agentName: counter.agentName
      },
      totalUsers: users.length,
      users: users
    });
  } catch (error) {
    console.error('Error getting users by counter:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get counter statistics (users per counter)
exports.getCounterStats = async (req, res) => {
  try {
    // Aggregate users by counter
    const stats = await User.aggregate([
      {
        $match: {
          preferred_counter: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$preferred_counter",
          userCount: { $sum: 1 },
          farmers: {
            $sum: {
              $cond: [{ $eq: ["$user_type", "Farmer"] }, 1, 0]
            }
          },
          retailers: {
            $sum: {
              $cond: [{ $eq: ["$user_type", "Agri-Retailer"] }, 1, 0]
            }
          },
          agents: {
            $sum: {
              $cond: [{ $eq: ["$user_type", "Agent"] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: "counters",
          localField: "_id",
          foreignField: "_id",
          as: "counterInfo"
        }
      },
      {
        $unwind: "$counterInfo"
      },
      {
        $project: {
          counter: {
            _id: "$counterInfo._id",
            counterName: "$counterInfo.counterName",
            pinCode: "$counterInfo.pinCode",
            address: "$counterInfo.address",
            agentName: "$counterInfo.agentName"
          },
          totalUsers: "$userCount",
          farmers: 1,
          retailers: 1,
          agents: 1
        }
      },
      {
        $sort: { totalUsers: -1 }
      }
    ]);

    // Get counters with no users
    const allCounters = await Counter.find();
    const counterIds = stats.map(s => s.counter._id.toString());
    const countersWithoutUsers = allCounters.filter(
      c => !counterIds.includes(c._id.toString())
    ).map(c => ({
      counter: {
        _id: c._id,
        counterName: c.counterName,
        pinCode: c.pinCode,
        address: c.address,
        agentName: c.agentName
      },
      totalUsers: 0,
      farmers: 0,
      retailers: 0,
      agents: 0
    }));

    const allStats = [...stats, ...countersWithoutUsers];

    res.status(200).json({
      success: true,
      totalCounters: allStats.length,
      totalUsersWithSelection: stats.reduce((sum, s) => sum + s.totalUsers, 0),
      counters: allStats
    });
  } catch (error) {
    console.error('Error getting counter stats:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Clear user's preferred counter
exports.clearPreferredCounter = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required" 
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        preferred_counter: null,
        counter_selection_date: null
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Preferred counter cleared successfully"
    });
  } catch (error) {
    console.error('Error clearing preferred counter:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = exports;
