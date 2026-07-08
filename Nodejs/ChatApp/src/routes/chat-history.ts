import { Router } from "express";
import db from "../db";
import { RowDataPacket } from "mysql2";

const router = Router();
const pool = db.promise();

router.get("/get-chat-history",async (req, res) => {

    const chatId = req.query.id;

    try {
        if (!chatId) {
            
            res.status(400).send("Chat id is required");

        }

        const [chatData] = await pool.query<RowDataPacket[]>("SELECT * FROM chat_history WHERE chat_chat_id = ? ORDER BY sent_at DESC",[chatId]);
        res.status(200).send(chatData);

    } catch (err) {
        res.status(500).send(err);
    }

})

export default router;