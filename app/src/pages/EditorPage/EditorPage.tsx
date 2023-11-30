import { Grid } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import styles from "./EditorPage.module.scss";
import _ from "lodash";
import { Button } from "@mui/material";

export const EditorPage: React.FC = () => {
    const [output, setOutput] = useState("");
    const [count, setCount] = useState(0);

    const [content, setContent] = useState("");
    const [numRows, setNumRows] = useState(0);

    const divRef = useRef(null);
    const textareaRef = useRef(null);

    useSubscription("/topic/script-output", (msg) => {
        console.log(msg.body);
        setOutput((prevOutput) => prevOutput + msg.body);
        setCount((prevCount) => prevCount + 1);
    });

    useEffect(() => {
        setNumRows(content.split("\n").length);
        // @ts-ignore
        if (divRef.current && textareaRef.current?.scrollTop) {
            // @ts-ignore
            divRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    }, [content]);

    return (
        <>
            <Grid className={styles.container} container>
                <Grid className={styles.editor} item xs={5.8}>
                    <Button color="success">Play</Button>
                    <div ref={divRef} className={styles["index-col"]}>
                        {_.range(numRows).map((val) => {
                            return <div>{val}</div>;
                        })}
                    </div>
                    <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => {
                            const keyword = "example"
                            const regex = new RegExp(keyword, "gi");
                            setContent(e.currentTarget.value.replace(regex, '<mark class="container__mark">$&</mark>'));
                        }}
                        onScroll={(e) => {
                            if (divRef.current) {
                                // @ts-ignore
                                divRef.current.scrollTop =
                                    e.currentTarget.scrollTop;
                            }
                            console.log(e.currentTarget.scrollTop);
                        }}
                    />
                </Grid>
                <Grid item xs={0.4}></Grid>
                <Grid className={styles.editor} item xs={5.8}>
                    <div contentEditable className={styles.container2}>

                    </div>
                </Grid>
            </Grid>
        </>
    );
};
