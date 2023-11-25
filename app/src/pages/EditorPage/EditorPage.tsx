import { Button, TextareaAutosize } from "@mui/material";
import React, { useState } from "react";

export const EditorPage: React.FC = () => {

    const [output, setOutput] = useState("");



    return (
        <div>
            <Button>
                Make it Glow
            </Button>
            <TextareaAutosize value={output} />
        </div>
    )
}