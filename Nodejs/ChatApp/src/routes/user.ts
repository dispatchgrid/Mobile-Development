import { Router } from "express";
import db from "../db";
import { RowDataPacket } from "mysql2";
import multer from "multer"


const router = Router();
const promise = db.promise();

router.post("/login", (req, res) => {
    const { mobile, password } = req.body;

    console.log("Received login request:", { mobile, password });
    db.query("SELECT * FROM user WHERE mobile = '" + mobile + "' AND password = '" + password + "'", (err, result: RowDataPacket[]) => {
        if (!err) {
            console.log("Database query result:", result);
            if (result.length == 1) {
                res.status(200).send({ isSuccess: true, user: result[0] });
            } else {
                res.status(401).send("Invalid Credentials");
            }
        } else {
            res.status(500).send(err.message);
        }
    });
});

router.post("/signup", (req, res) => {
    const { fname, lname, mobile, password } = req.body;
    console.log(fname, lname, mobile, password);
    db.query("SELECT * FROM user WHERE mobile = '" + mobile + "'", (err, resultSearch: RowDataPacket[]) => {
        if (!err) {
            if (resultSearch.length == 0) {
                db.query("INSERT INTO user (fname, lname, mobile, password) VALUES ('" + fname + "', '" + lname + "', '" + mobile + "', '" + password + "')", (err, resultInsert: RowDataPacket[]) => {
                    if (!err) {
                        res.status(200).send("User registered successfully");
                        promise.query("INSERT INTO chat (user_1,user_2) VALUES (?,?)", [mobile, "0000000000"]);

                    }
                });
            } else {
                res.status(400).send("Mobile number already exists");
            }
        }
    });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "." + getFileExtensionManual(file.originalname);

        cb(null, uniqueName);
    },
})

function getFileExtensionManual(filename:any) {
    const lastDotIndex = filename.lastIndexOf('.');
    
    if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
      return filename.slice(lastDotIndex + 1);
    }
    
    return "";
  }
  


const upload = multer({ storage: storage });

router.get("/user-info", async (req, res) => {

    try {

        const mobile = req.query.mobile;


        if (!mobile) {
            res.status(400).send({ msg: "Mobile number is required" });
        }



        const [users] = await promise.query<RowDataPacket[]>("SELECT fname,lname,img FROM user WHERE mobile=?", [mobile]);
        if (users.length > 0) {
            res.status(200).send({ info: users[0] });
        } else {

            res.status(401).send({ msg: "User does not exist" });
        }


    } catch (err) {
        console.error(err);
    }


});

const pool = db.promise();
router.post("/update", upload.single("image"), async (req, res) => {
    const imagepath = "/uploads/" + req.file?.filename;
  
    const { fname, lname, password, mobile } = req.body;
  
    try {
  
      const [result] = await pool.query(
        "UPDATE user SET fname = ?, lname = ?, password = ? , img = ? WHERE mobile = ?",
        [fname, lname, password, imagepath, mobile],
      );
      console.log(mobile);
      console.log(result);
  
      res.status(200).send({ msg: "success", data: imagepath });
  
    } catch (err) {
      res.status(500).send(err);
    }
  });
  

export default router;
