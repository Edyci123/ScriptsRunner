import { TextareaAutosize, Typography } from "@mui/material";
import React, { useState } from "react";
import { useSubscription } from "react-stomp-hooks";

export const EditorPage: React.FC = () => {
    const [output, setOutput] = useState("");
    const [count, setCount] = useState(0);


    useSubscription("/topic/script-output", (msg) => {
        console.log(msg.body);
        setOutput((prevOutput) => prevOutput + msg.body);
        setCount((prevCount) => prevCount + 1);
    });

    return (
        <div>
            <Typography>COUNT: {count}</Typography>
            <TextareaAutosize value={output} />
        </div>
    );
};
