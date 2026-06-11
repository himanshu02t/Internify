module.exports = (req,res,next)=>{
  if(req.userRole !== "admin" && req.userRole !== "recruiter"){
    return res.status(403).json({msg:"Access denied"});
  }
  next();
};
