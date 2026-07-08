import { Server } from "http";
import { WebSocketServer } from "ws";
import db from "./db"
import { response } from "express";
import { RowDataPacket } from "mysql2";

export function startWebSocket(server: Server) {
    const userConnections = new Map();
    const wsServer = new WebSocketServer({ server });
    const pool = db.promise();

    wsServer.on("connection", (ws) => {

        console.log("Connected")

        ws.on("message", async (data) => {

            const msgData = JSON.parse(data.toString());
            console.log(msgData);

            if (msgData.type === "register") {
                userConnections.set(msgData.data, {websocket:ws, reciever: msgData.reciever});
                pool.query("UPDATE chat_history SET msg_status_id = 2 WHERE chat_chat_id = ? AND msg_status_id = 1 AND sender != ?", [msgData.chatId, msgData.data]);
                console.log("Connection saved")
                const statusData = {
                    type: "status",
                    data: "online"
                }

                const recieverWs = userConnections.get(msgData.reciever)?.websocket;
                if (recieverWs) {
                    recieverWs.send(JSON.stringify(statusData));
                }
                let recieverStatusData = {
                    type: "status",
                    data: userConnections.has(msgData.reciever) ? "online" : "offline"
                }
                if(msgData.reciever === "0000000000"){
                    recieverStatusData = {
                        type: "status",
                        data: "online"
                    }
                }
                const senderWs = userConnections.get(msgData.data)?.websocket;
                if (senderWs) {
                    senderWs.send(JSON.stringify(recieverStatusData));
                }

            } else if (msgData.type === "chat") {
                console.log(msgData.data);


                const { data, reciever, sender, chatId } = msgData;

                if (reciever != "0000000000") {
                    const recieverWs = userConnections.get(reciever)?.websocket;

                    try {
                        pool.query("INSERT INTO chat_history (message,sent_at,chat_chat_id,sender,msg_status_id) VALUES (?,?,?,?,?)",
                            [data, new Date(), chatId, sender, recieverWs ? 2 : 1]
                        )
                        pool.query("UPDATE chat SET last_interaction = ? WHERE chat_id = ?", [new Date(), chatId]);

                    } catch (err) {
                        console.error(err);
                    }

                    if (recieverWs) {
                        const msgData = {
                            message: data,
                            sent_at: new Date().toISOString(),
                            sender: sender,
                            msg_status_id: 2
                        }
                        recieverWs.send(JSON.stringify(msgData));
                        console.log("SENT");
                    }
                } else {
                    const senderWs = userConnections.get(sender)?.websocket;
                    if (senderWs) {
                        await pool.query("INSERT INTO chat_history (message,sent_at,chat_chat_id,sender,msg_status_id) VALUES (?,?,?,?,?)",
                            [data, new Date(), chatId, sender, 2]
                        )
                        pool.query("UPDATE chat SET last_interaction = ? WHERE chat_id = ?", [new Date(), chatId]);

                        const [chatHistory] = await pool.query<RowDataPacket[]>("SELECT * FROM ( SELECT * FROM chat_history WHERE chat_chat_id = ? ORDER BY sent_at DESC LIMIT 10 ) AS latest ORDER BY sent_at ASC;", [chatId]);



                        const historyArray = chatHistory.map(entry => ({
                            role: entry.sender === "0000000000" ? "assistant" : "user",
                            content: entry.message
                        }));


                        console.log(historyArray);

                        const res = await fetch("http://localhost:11434/api/chat", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                model: "nemotron-3-super:cloud",
                                messages: historyArray,
                                stream: false,
                                temperature: 0.4,
                                num_predict: 120,
                            })
                        });

                        const response = await res.json();
                        console.log(response.message.content);
                        const reply = response.message.content;
                        const msgData = {
                            message: reply,
                            sent_at: new Date().toISOString(),
                            sender: reciever,
                        }
                        console.log(msgData);

                        await pool.query("INSERT INTO chat_history (message,sent_at,chat_chat_id,sender,msg_status_id) VALUES (?,?,?,?,?)",
                            [reply, new Date(), chatId, "0000000000", 1]
                        )
                        pool.query("UPDATE chat SET last_interaction = ? WHERE chat_id = ?", [new Date(), chatId]);

                        senderWs.send(JSON.stringify(msgData));

                    }
                }
            }

        })

        ws.on("close", () => {

            userConnections.forEach((value, key) => {
                if (value?.websocket === ws) {
                    const statusData = {
                        type: "status",
                        data: "offline"
                    }
    
                    const recieverWs = userConnections.get(value.reciever)?.websocket;
                    if (recieverWs) {
                        recieverWs.send(JSON.stringify(statusData));
                    }
                    userConnections.delete(key);
                    
                }
            })

        })

    })





}