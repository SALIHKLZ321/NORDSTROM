const mongoose = require("mongoose");
const Banner = require("../models/banner");
module.exports = {
    renderPage:async(req,res)=>{
        let banner=await Banner.find()
        res.render('admin/banner',{banner})
    },
  renderAddBanner:(req,res)=> {
    
    res.render('admin/addBanner')
},
  addBanner: (req, res) => {
    req.body.image = req.file.path;
    const { title, route, description, image } = req.body;
    const newBanner = new Banner({ title, description, route, image })
    newBanner.save().then((result) => {
      res.redirect("/admin");
    });
  },
  editBannerPage:async(req,res)=>{
    bannerId=req.query.id
    let banner=await Banner.findOne({_id:bannerId})
    res.render('admin/editBanner',{banner})
  },
  editBanner:async(req,res)=>{
    bannerId=req.query.id
    data=req.body
    console.log(data.image);
    await Banner.updateOne({_id:bannerId},{
        $set:{
            title:data.title,
            route:data.route,
            description:data.description,
            image:data.image

        }
    })
    res.redirect('/admin/banner')

  },
  deleteBanner:async(req,res)=>{
    id=req.query.id
    await Banner.deleteOne({_id:id})
    res.redirect('/admin/banner')
  }
};
