// in controllers/sauce.js

const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    req.body.sauce = JSON.parse(req.body.sauce);
    const url = req.protocol + '://' + req.get('host');
    const sauce = new Sauce({
        userId: req.body.sauce.userId,
        name: req.body.sauce.name,
        manufacturer: req.body.sauce.manufacturer,
        description: req.body.sauce.description,
        mainPepper: req.body.sauce.mainPepper,
        imageUrl: url + "/images/" + req.file.filename,
        heat: req.body.sauce.heat,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
  });
  sauce.save().then(
    () => {
      res.status(201).json({
        message: 'Post saved successfully!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
    let sauce = new Sauce({ _id: req.params._id });
    if (req.file) {             
        const url = req.protocol + '://' + req.get('host');
        req.body.sauce = JSON.parse(req.body.sauce);
        sauce = {
            _id: req.params.id,
            userId: req.body.sauce.userId,
            name: req.body.sauce.name,
            manufacturer: req.body.sauce.manufacturer,
            description: req.body.sauce.description,
            mainPepper: req.body.sauce.mainPepper,
            imageUrl: url + '/images/' + req.file.filename,
            heat: req.body.sauce.heat,
        }
    } else {
        sauce = {
            _id: req.params.id,
            userId: req.body.userId,
            name: req.body.name,
            manufacturer: req.body.manufacturer,
            description: req.body.description,
            mainPepper: req.body.mainPepper,
            //imageUrl: req.body.imageUrl,
            heat: req.body.heat,
        };
    }
    Sauce.updateOne({_id: req.params.id}, sauce)
    .then(() => {
        res.status(201).json({
            message: 'Sauce updated successfully!',
        });
    }).catch((error) => {
        res.status(400).json({
            error: error,
        });
    });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        const filename = sauce.imageUrl.split('/images/')[1];       
        fs.unlink('images/' + filename, () => { 
        Sauce.deleteOne({_id: req.params.id})
            .then(() => {
                res.status(200).json({
                    message: 'Deleted!',
                });
            }).catch((error) => {
                res.status(400).json({
                    error: error,
                });
            });
        });
    });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

///////////////////////////////////////////////////////////////////////////

exports.rateSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id}).then((sauce) => {
        //like a sauce (and, if applicable, removes a dislike)
        if (req.body.like === 1  && !sauce.usersLiked.includes(req.body.userId)) {
            console.log(req.body.like);
            sauce.usersLiked.push(req.body.userId); 
            sauce.likes += 1;
        //dislike a sauce (and, if applicable, removes a like)    
        } else if (req.body.like === -1 && !sauce.usersDisliked.includes(req.body.userId)) {  
            console.log(req.body.like);                     
            sauce.usersDisliked.push(req.body.userId);
            sauce.dislikes += 1;
        //otherwise remove the likes and the userIds from the users liked/disliked
        } else {
            req.body.like = 0
            if (sauce.usersLiked.includes(req.body.userId)) {
                sauce.usersLiked.remove(req.body.userId);
                sauce.likes += -1;
            }
            if (sauce.usersDisliked.includes(req.body.userId)) {
                sauce.usersDisliked.remove(req.body.userId);
                sauce.dislikes += -1;
            }
        }
        Sauce.updateOne({_id: req.params.id}, sauce)
        .then((sauce) => {
            res.status(201).json(sauce)
        }) .catch((error) => {
            res.status(400).json({
                error: error,
            });  
        });
    });
};