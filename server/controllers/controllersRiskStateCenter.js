// FTSA_AI_0.v1/server/controllers/controllersRiskStateCenter.js

const { getRiskState } = require("../services/servicesRiskStateCenter");

const riskStateController = async (req,res)=>{

  try{

    const { userId } = req.params;

    const state = await getRiskState(userId);

    res.json({
      success:true,
      data:state
    });

  }catch(err){

    console.error("RiskStateCenter error:",err);

    res.status(500).json({
      success:false,
      message:"Failed to fetch risk state"
    });

  }

};

module.exports = { riskStateController };