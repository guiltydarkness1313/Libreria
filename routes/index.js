var express = require('express');
var router = express.Router();
var mariadb = require("mysql");
var multer = require('multer');
var fs = require('fs');
const multerConf =
    {
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, "./public/images")
            },
            filename: function (req, file, next) {
                console.log(file);
                const ext = file.mimetype.split('/')[1];
                next(null, file.fieldname + "-" + Date.now() + "." + ext);
            }
        }),
        fileFilter:function (req,file,next) {
            if(!file){
                next();
            }
            const image = file.mimetype.startsWith('image/');
            if(image){
                console.log('image uploaded!');
                next(null,true);
            }else{
                console.log("file not supported!");
                return next();
            }
    }
};


//MariaDB connection
var connection = mariadb.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"libreria",
    port:3307
});
connection.connect(function(error){
    if(!error){
        console.log("successfull connection!");
    }else{
        throw error;
    }
});
//connection.end();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/new',function (req,res) {
    res.render('new-book');
});
router.post('/new',multer(multerConf).single('image'),function (req,res) {
    let item={
        image:req.file.filename,
        name:req.body.name,
        author:req.body.author,
        category:req.body.category,
        date:req.body.date,
        summary:req.body.summary
    };
    console.log(item.name);
    console.log(item.image);
    var query =
        connection.query("INSERT INTO book (name, author, category, date, image, summary) VALUES (?, ?, ?, ?, ?, ?)",
            [item.name,item.author,item.category,item.date,item.image,item.summary],function (error,result) {
                if(!error){
                    console.log("edit complete!");
                    res.redirect('admin');
                }else {
                    throw error;
                }
            });
    //res.send("Complete ")
});

router.get('/books',function (req,res) {
  var query=connection.query("SELECT * FROM book",function (error,result) {
     if(!error){
       console.log("data fetched!");
       res.render('books',{result:result});
     } else{
       throw error;
     }
  });
  // res.render('books');
});
router.get("/admin",function (req,res) {
  var query=connection.query("SELECT * FROM book",function (error, result) {
    if(!error){
      console.log("data fetched! /admin");
        res.render('admin',{result:result});
    }else{
      throw error;
    }
  });
});
router.get("/detail",function (req,res) {
   if(req.query.id){
       var query= connection.query("SELECT * FROM book WHERE id = ?",[req.query.id],
           function (error,result) {
              if(!error){
                  console.log(result);
                  console.log(" se ha encontrado el libro con el id "+req.query.id)
                  res.render('detail',{item:result[0]});
              }else{
                  console.log("no se ha encontrado el registro"+req.query.id);
                  throw error;
              }
           });
   }else{
        console.log("no se ha especificado el id");
        res.redirect('/admin');
   }
});

router.post("/detail",multer(multerConf).single('image'),function (req,res) {

    let item={
        image:"",
        name:"",
        author:"",
        category:"",
        date:"",
        summary:""
    };

    connection.query("Select * from book WHERE id = ?",[req.query.id],
        function (error,result) {
           if(!error){
               let book=result[0];
               item.image=book.image;
               item.name=book.name;
               item.author=book.author;
               item.category=book.category;
               item.date=book.date;
               item.summary=book.summary;
               fs.unlink("public/images/"+item.image,function (error) {
                   if(!error){
                       console.log("Imagen borrada "+item.image)
                   }else{
                       return console.log(error);
                   }
               });
           }
        });
    console.log(item.name);
    item.name=req.body.name;
    item.author=req.body.author;
    item.summary=req.body.summary;
    item.date=req.body.date;
    item.category=req.body.category;
    item.image=req.file.filename;
    var query = connection.query("UPDATE book SET name=?, author=?, category=?, date=?, image=?, summary=? WHERE id = ?",
        [item.name,item.author,item.category,item.date,item.image,item.summary,req.query.id],
        function (error, result) {
            if(!error) {
                console.log("update complete!");
                res.redirect('admin')
            }else{
                console.log(error);
                throw error;
            }
        });
});

router.get("/delete",multer(multerConf).single('image'),function (req,res) {
    if(req.query.id) {
        let item={
            image:"",
            name:"",
            author:"",
            category:"",
            date:"",
            summary:""
        };
        connection.query("Select * from book WHERE id = ?",[req.query.id],
            function (error,result) {
                if(!error){
                    let book=result[0];
                    item.image=book.image;
                    item.name=book.name;
                    item.author=book.author;
                    item.category=book.category;
                    item.date=book.date;
                    item.summary=book.summary;
                    fs.unlink("public/images/"+item.image,function (error) {
                        if(!error){
                            console.log("Imagen borrada "+item.image)
                        }else{
                            return console.log(error);
                        }
                    });
                }
            });
        var query =
            connection.query("DELETE FROM book WHERE id = ?",
        [req.query.id],function (error,result) {
                if(!error){
                    console.log("borrado complete!");
                    res.redirect('admin');
                }else {
                    throw error;
                }
            });
    }else{
        console.log("no hay parametros")
    }
});
module.exports = router;
