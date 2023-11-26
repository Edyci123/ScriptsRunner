import { Button, TextareaAutosize, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useStompClient, useSubscription } from "react-stomp-hooks";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

export const EditorPage: React.FC = () => {
    const [output, setOutput] = useState("");
    const [count, setCount] = useState(0);

    const [connected, setConnected] = useState(false);

    // useEffect(() => {
    //     if (connected) {
    //         const socket = new SockJS("http://localhost:8080/console");
    //         const stompClient = Stomp.over(socket);
    //         stompClient.connect({}, (frame) => {
    //             console.log("Connected " + frame);
    //             stompClient.subscribe("/topic/script-output", (msg) => {
    //                 try {
    //                     const messageContent = msg.body;
    //                     console.log("MESSAGE", messageContent);
    //                     setOutput(output + messageContent);
    //                     count++;
    //                 } catch (e) {
    //                     console.log("ERROR", e);
    //                 }
    //             });
    //         });

    //         setConnected(false);
    //     }
    // }, [connected]);

    useSubscription("/topic/script-output", (msg) => {
        console.log(msg.body);
        setOutput((prevOutput) => prevOutput + msg.body);
        setCount((prevCount) => prevCount + 1);
    });

    return (
        <div>
            <Button onClick={() => setConnected(true)}>Make it Glow</Button>
            <Typography>COUNT: {count}</Typography>
            <TextareaAutosize value={output} />
        </div>
    );
};
