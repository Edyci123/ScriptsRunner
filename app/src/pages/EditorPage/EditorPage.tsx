import { Button, TextareaAutosize, Typography } from "@mui/material";
import React, { useState } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export const EditorPage: React.FC = () => {
    const [output, setOutput] = useState("");
    var count = 0;

    const doMessaging = () => {
        const socket = new SockJS("http://localhost:8080/console");
        const stompClient = Stomp.over(socket);
        stompClient.connect({}, (frame) => {
            console.log("Connected " + frame);
            stompClient.subscribe("/topic/script-output", (msg) => {
                const messageContent = msg.body;
                console.log(messageContent);
                setOutput(output + messageContent);
            });
        });
    };

    return (
        <div>
            <Button onClick={() => doMessaging()}>Make it Glow</Button>
            <Typography>COUNT: {count}</Typography>
            <TextareaAutosize value={output} />
        </div>
    );
};
