import { Button, CircularProgress, Grid } from "@mui/material";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import styles from "./EditorPage.module.scss";

import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { axios } from "../../services/axios";

export const EditorPage: React.FC = () => {
    const [language, setLanguage] = useState<"kts" | "swift">("kts");

    const [content, setContent] = useState("");
    const [output, setOutput] = useState<
        Array<{ content: string; typeOfMessage: string }>
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [numRows, setNumRows] = useState(1);
    const [currentUUID, setCurrentUUID] = useState("");
    const [execTime, setExecTime] = useState(0);
    const [completed, setCompleted] = useState(false);

    const contentRef = useRef(null);
    const colorRef = useRef(null);
    const indexRef = useRef(null);
    const outputRef = useRef(null);
    const [errors, setErrors] = useState<number[]>([]);

    useSubscription("/topic/script-output", (msg) => {
        setOutput((prevOutput) => [...prevOutput, JSON.parse(msg.body)]);
    });

    const lang = {
        kts: {
            equal: /(\b=\b)/g,
            quote: /((&#39;.*?&#39;)|(&#34;.*?&#34;)|(".*?(?<!\\)")|('.*?(?<!\\)')|`)/g,
            comm: /((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*))/g,
            logic: /(%=|%|\-|\+|\*|&amp;{1,2}|\|{1,2}|&lt;=|&gt;=|&lt;|&gt;|!={1,2}|={2,3})/g,
            number: /(?<![a-zA-Z])(\d+(\.\d+)?(e\d+)?)/g,
            kw: /(?<=^|\s*|)(?<![a-zA-Z0-9])(as|break|class(?!\s*\=)|for|if|\!in|in|interface|\!is|is|null|object|package|return|super|this|throw|true|try|typealias|val|var|when|while|by|catch|constructor|set|setparam|where|actual|abstract|annotation|companion|const|crossinline|data|enum|expect|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|println|print|protected|public|reified|sealed|suspend|tailrec|vararg|field|it|delegate|dynamic|field|file|finally|get|import|init|param|property|receiver|continue|do|else|fun)(?=\b)/g,
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
        document.execCommand("insertText", false, pastedData);
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        if (errors.length !== 0) {
            setErrors([]);
        }
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

    const handleRunCode = async () => {
        // @ts-ignore
        let content: string[] = colorRef.current.innerText.split("\n");
        setCompleted(false);
        let trimmedContent = "";
        let cnt = 0;
        content.forEach((val, index) => {
            if (val === "") {
                cnt++;
                if (cnt % 2 === 1) {
                    trimmedContent = trimmedContent + "\n";
                }
            } else {
                cnt = 0;
                trimmedContent =
                    trimmedContent + (index === 0 ? "" : "\n") + val;
            }
        });
        setOutput([]);
        setCurrentUUID("");
        setIsLoading(true);
        const res = await axios.post(
            "/run",
            // @ts-ignore
            { scriptContent: trimmedContent },
            { params: { type: "KTS" } }
        );
        setCurrentUUID(res.data?.uuid);
        setCompleted(true);
        setIsLoading(false);
    };

    useEffect(() => {
        // @ts-ignore
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    useEffect(() => {
        if (completed) {
            output.forEach((val, index) => {
                if (currentUUID && val.typeOfMessage === "ERROR") {
                    let newError = val.content
                        .split(currentUUID)
                        .at(1)
                        ?.split(":")
                        .at(1);
                    if (newError && errors.includes(+newError) === false) {
                        errors.push(+newError);
                        setErrors([...errors]);
                    }
                }
            });
        }
    }, [completed]);

    return (
        <>
            <Grid className={styles.container} container>
                <Grid item xs={12}>
                    <Button
                        sx={{ mb: 2 }}
                        variant={isLoading ? undefined : "contained"}
                        color="success"
                        disabled={isLoading}
                        onClick={() => handleRunCode()}
                    >
                        {isLoading ? (
                            <CircularProgress color="success" size={20} />
                        ) : (
                            <>
                                RUN <PlayArrowIcon />
                            </>
                        )}
                    </Button>
                </Grid>
                <Grid className={styles["editor-container"]} item xs={5.8}>
                    <div ref={indexRef} className={styles["index-col"]}>
                        {_.range(numRows).map((val) => {
                            return (
                                <div
                                    className={
                                        errors.includes(val + 1)
                                            ? styles.row_error
                                            : undefined
                                    }
                                    key={val}
                                >
                                    {val}
                                </div>
                            );
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
                    <div ref={outputRef} className={styles.output}>
                        {output.map((val, index) => {
                            let className = "output_standard";

                            if (val.typeOfMessage === "ERROR") {
                                className = "output_error";
                            }
                            if (val.typeOfMessage === "EXIT_CODE") {
                                if (val.content === "0") {
                                    className = "output_success";
                                } else {
                                    className = "output_fail";
                                }
                            }

                            return (
                                <div
                                    style={{
                                        marginTop: index === 0 ? "8px" : 0,
                                        marginLeft: "10px",
                                        marginBottom:
                                            index === output.length - 1
                                                ? "10px"
                                                : 0,
                                    }}
                                    key={index}
                                >
                                    <span className={styles[className]}>
                                        {`[${val.typeOfMessage}]`}{" "}
                                    </span>
                                    {val.content}
                                </div>
                            );
                        })}
                    </div>
                </Grid>
            </Grid>
        </>
    );
};
