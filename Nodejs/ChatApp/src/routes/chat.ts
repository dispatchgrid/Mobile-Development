import { Router } from "express";
import db from "../db";
import { RowDataPacket } from "mysql2";

const router = Router();
const promise = db.promise();

router.get("/get-chats", async (req, res) => {

    try {

        const mobile = req.query.mobile;

        const searchQuery =req.query.searchQuery;
        if (!mobile) {
            res.status(400).send({ msg: "Mobile number is required" });
        }

        const [chats] = await promise.query<RowDataPacket[]>("SELECT * FROM chat WHERE (user_1=? OR user_2=?) ORDER BY last_interaction DESC", [mobile, mobile]);

        const chatData = [];

        for (let i = 0; i < chats.length; i++) {

            const chat = chats[i];

            const message = await promise.query<RowDataPacket[]>("SELECT * FROM chat_history WHERE chat_chat_id = ? ORDER BY sent_at DESC LIMIT 1", [chat.chat_id]);

            const [user] = await promise.query<RowDataPacket[]>("SELECT mobile,fname,lname,img FROM user WHERE mobile=? AND (fname LIKE ? OR lname LIKE ?)", [chat.user_1 === mobile ? chat.user_2 : chat.user_1, `%${searchQuery}%`, `%${searchQuery}%`]);

            if (user.length === 0) {
                continue;
            }

            const data = {
                user: user[0],
                last_message: message[0],
                chatId: chat.chat_id
            }
            console.log(data);
            chatData.push(data);
        }

        res.status(200).send(chatData);
    } catch (err) {
        console.error(err);
    }


});


router.get("/create-chat", async (req, res) => {

    try {

        const user = req.query.user;
        const reciever = req.query.reciever;


        if (!user) {
            res.status(400).send({ msg: "Mobile number is required" });
            return
        }
        if (!reciever) {
            res.status(400).send({ msg: "Reciever number is required" });
            return
        }
        if (user === reciever) {
            res.status(400).send({ msg: "You cannot create a chat with yourself" });
            return
        }

        console.log(user);
        console.log(reciever);


        const [existingChat] = await promise.query<RowDataPacket[]>("SELECT * FROM chat WHERE (user_1=? AND user_2=?) OR (user_1=? AND user_2=?)", [user, reciever, reciever, user]);
        if (existingChat.length > 0) {
            res.status(200).send({ chatId: existingChat[0] });
        } else {

            await promise.query("INSERT INTO chat (user_1,user_2) VALUES (?,?)", [user, reciever]);

            const [newChat] = await promise.query<RowDataPacket[]>("SELECT chat_id FROM chat WHERE (user_1=? AND user_2=?) OR (user_1=? AND user_2=?)", [user, reciever, reciever, user]);

            await promise.query("INSERT INTO chat_history (message,sent_at,chat_chat_id,sender,msg_status_id) VALUES (?,?,?,?,?)",
                ["Hi", new Date(), newChat[0].chat_id, user, 1]
            )
            await promise.query("UPDATE chat SET last_interaction = ? WHERE chat_id = ?", [new Date(), newChat[0].chat_id]);

            res.status(200).send({ chatId: newChat[0] });
        }


    } catch (err) {
        console.error(err);
    }


});

router.get("/delete-chat", async (req, res) => {
    try {

        const chatId = req.query.chatId;

        if(!chatId){
            res.status(400).send({msg:"chatId is required"});

            return
        }

        await promise.query("DELETE FROM chat_history WHERE chat_chat_id = ?",[chatId]);
        await promise.query("DELETE FROM chat WHERE chat_id = ?",[chatId]);

        res.status(200).send({msg:"Success"})

    } catch (err) {
        console.error(err);
        res.status(401).send({msg:"Internal Server Error"})

    }
});

export default router;
