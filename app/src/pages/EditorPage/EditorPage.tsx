import { Button, Grid } from "@mui/material";
import _ from "lodash";
import React, { useRef, useState } from "react";
import styles from "./EditorPage.module.scss";
import { useSubscription } from "react-stomp-hooks";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { axios } from "../../services/axios";

export const EditorPage: React.FC = () => {
    const [language, setLanguage] = useState<"kts" | "swift">("kts");

    const [content, setContent] = useState("");
    const [output, setOutput] = useState("");
    const [numRows, setNumRows] = useState(1);

    const contentRef = useRef(null);
    const colorRef = useRef(null);
    const indexRef = useRef(null);

    useSubscription("/topic/script-output", (msg) => {
        console.log(msg.body);
        setOutput((prevOutput) => prevOutput + "\n" + msg.body);
    });

    const lang = {
        kts: {
            equal: /(\b=\b)/g,
            quote: /((&#39;.*?&#39;)|(&#34;.*?&#34;)|(".*?(?<!\\)")|('.*?(?<!\\)')|`)/g,
            comm: /((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*))/g,
            logic: /(%=|%|\-|\+|\*|&amp;{1,2}|\|{1,2}|&lt;=|&gt;=|&lt;|&gt;|!={1,2}|={2,3})/g,
            number: /(?<![a-zA-Z])(\d+(\.\d+)?(e\d+)?)/g,
            kw: /(?<=^|\s*|)(?<![a-zA-Z0-9])(as|break|class(?!\s*\=)|for|if|\!in|in|interface|\!is|is|null|object|package|return|super|this|throw|true|try|typealias|val|var|when|while|by|catch|constructor|set|setparam|where|actual|abstract|annotation|companion|const|crossinline|data|enum|expect|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|protected|public|reified|sealed|suspend|tailrec|vararg|field|it|delegate|dynamic|field|file|finally|get|import|init|param|property|receiver|continue|do|else|fun)(?=\b)/g,
            round: /(\(|\))/g,
            square: /(\[|\])/g,
            curl: /(\{|\})/g,
        },
        swift: {},
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
        event.preventDefault();
        const clipboardData = event.clipboardData;
        const pastedData = clipboardData.getData("text/plain");
        console.log("PASTE", pastedData);
        document.execCommand("insertText", false, pastedData);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const langObj = lang[language];
        let html = e.currentTarget.innerHTML;

        setNumRows(
            // @ts-ignore
            contentRef.current.innerText === "\n"
                ? 1
                : Math.max(
                      1,
                      // @ts-ignore
                      contentRef.current.innerHTML.split("<div").length
                  )
        );
        // @ts-ignore
        console.log("HTML", contentRef.current.innerHTML)
        // @ts-ignore
        console.log("HTML", contentRef.current.innerText)


        // @ts-ignore
        colorRef.current.scrollTop = contentRef.current.scrollTop;

        Object.keys(langObj).forEach((key) => {
            html = html.replace(
                // @ts-ignore
                langObj[key],
                `<i class="${language}_${key}">$1</i>`
            );
        });

        // @ts-ignore
        contentRef.current.previousElementSibling.innerHTML = html
            .replaceAll(
                '"caret<i class="kts_logic">-</i>color: black;"</i>>',
                ""
            )
            .replaceAll(
                '"caret<i class="kts_logic">-</i>color: rgb<i class="kts_round">(</i><i class="kts_number">0</i>, <i class="kts_number">0</i>, <i class="kts_number">0</i><i class="kts_round">)</i>;"</i>>',
                ""
            );
    };

    const handleScroll = () => {
        // @ts-ignore
        colorRef.current.scrollTop = contentRef.current.scrollTop;
        // @ts-ignore
        indexRef.current.scrollTop = contentRef.current.scrollTop;
    };

    const handleRunCode = () => {
        // @ts-ignore
        console.log(colorRef.current.innerText);
        // @ts-ignore
        axios.post("/run", {scriptContent: colorRef.current.innerText }, {params: {type: 'KTS'}});
    };

    return (
        <>
            <Grid className={styles.container} container>
                <Grid item xs={12}>
                    <Button
                        sx={{ mb: 2 }}
                        variant="contained"
                        color="success"
                        onClick={() => handleRunCode()}
                    >
                        RUN <PlayArrowIcon />
                    </Button>
                </Grid>
                <Grid className={styles["editor-container"]} item xs={5.8}>
                    <div ref={indexRef} className={styles["index-col"]}>
                        {_.range(numRows).map((val) => {
                            return <div key={val}>{val}</div>;
                        })}
                    </div>

                    <div className={styles.editor}>
                        <div
                            ref={colorRef}
                            className={styles.editor_colors}
                        ></div>
                        <div
                            ref={contentRef}
                            spellCheck="false"
                            autoCorrect="off"
                            autoCapitalize="off"
                            contentEditable={true}
                            onPaste={handlePaste}
                            onScroll={handleScroll}
                            onInput={handleInput}
                            data-gramm="false"
                            className={styles.editor_content}
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </div>
                </Grid>
                <Grid item xs={0.4}></Grid>
                <Grid className={styles["editor-container"]} item xs={5.8}>
                    <div className={styles.output}>{output}</div>
                </Grid>
            </Grid>
        </>
    );
};
