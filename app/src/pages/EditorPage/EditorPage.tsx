import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
    Button,
    CircularProgress,
    FormControl,
    Grid,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v4 as uuidv4 } from "uuid";
import { axios } from "../../services/axios";
import styles from "./EditorPage.module.scss";

const currentUUID = uuidv4();

export const EditorPage: React.FC = () => {
    const [language, setLanguage] = useState<"kts" | "swift">("kts");

    const [content, setContent] = useState("");
    const [output, setOutput] = useState<
        Array<{ content: string; typeOfMessage: string }>
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [numRows, setNumRows] = useState(1);

    const [completed, setCompleted] = useState(false);

    const contentRef = useRef(null);
    const colorRef = useRef(null);
    const indexRef = useRef(null);
    const outputRef = useRef(null);
    const [errors, setErrors] = useState<number[]>([]);
    const [errorToScroll, setErrorToScroll] = useState<Map<number, number>>(
        new Map()
    );
    const [countRuns, setCountRuns] = useState("");

    useSubscription("/topic/script-output/" + currentUUID, (msg) => {
        setOutput((prevOutput) => [...prevOutput, JSON.parse(msg.body)]);
    });

    const lang = {
        kts: {
            equal: /(\b=\b)/g,
            quote: /((&#39;.*?&#39;)|(&#34;.*?&#34;)|(".*?(?<!\\)")|('.*?(?<!\\)')|`)/g,
            comm: /((\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(\/\/.*))/g,
            logic: /(%=|%|\-|\+|\*|&amp;{1,2}|\|{1,2}|&lt;=|&gt;=|&lt;|&gt;|!={1,2}|={2,3})/g,
            number: /(?<![a-zA-Z1-9_])(\d+(\.\d+)?(e\d+)?)/g,
            kw: /(?<=^|\s*|)(?<![a-zA-Z0-9_])(as|break|class(?!\s*\=)|for|if|\!in|in|interface|\!is|is|null|object|package|return|super|this|throw|true|try|typealias|val|var|when|while|by|catch|constructor|set|setparam|where|actual|abstract|annotation|companion|const|crossinline|data|enum|expect|external|final|infix|inline|inner|internal|lateinit|noinline|open|operator|out|override|private|println|print|protected|public|reified|sealed|suspend|tailrec|vararg|field|it|delegate|dynamic|field|file|finally|get|import|init|param|property|receiver|continue|do|else|fun)(?=\b)/g,
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
            setErrorToScroll(new Map());
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
                      contentRef.current.innerHTML
                          .split("<div")
                          // @ts-ignore
                          .filter((val) => val !== "").length
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
        colorRef.current.scrollLeft = contentRef.current.scrollLeft;
        // @ts-ignore
        indexRef.current.scrollTop = contentRef.current.scrollTop;
    };

    const handleRunCode = async () => {
        // @ts-ignore
        let content: string[] = colorRef.current.innerText.split("\n");
        let trimmedContent: string[] = [];
        let cnt = 0;
        content.forEach((val) => {
            if (val === "") {
                cnt++;
                if (cnt % 2 === 1) {
                    trimmedContent.push("");
                }
            } else {
                cnt = 0;
                trimmedContent.push(val);
            }
        });
        setOutput([]);
        setIsLoading(true);
        await axios.post(
            "/run",
            // @ts-ignore
            { scriptContent: trimmedContent.join("\n"), uuid: currentUUID },
            { params: { type: "KTS" } }
        );
        setCompleted(true);
        setIsLoading(false);
    };

    useEffect(() => {
        // @ts-ignore
        outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    useEffect(() => {
        if (completed) {
            console.log("OUTPUIT", output)
            output.forEach((val, index) => {
                if (currentUUID && val.typeOfMessage === "ERROR") {
                    let newError = val.content
                        .split(currentUUID)
                        .at(1)
                        ?.split(":")
                        .at(1);

                    if (newError) {
                        console.log(+newError - 20);
                        const val = +newError - 20;
                        let scrollTo = 0;
                        if (val > 0) {
                            scrollTo = 10.5 + (val - 1) * 16;
                        }

                        errorToScroll.set(index, Math.max(1, scrollTo));
                        setErrorToScroll(new Map(errorToScroll));
                    }

                    if (newError && errors.includes(+newError) === false) {
                        errors.push(+newError);
                        setErrors([...errors]);
                    }
                }
            });
            setCompleted(false);
        }
    }, [completed]);

    const moveToScroll = (scrollTo: number) => {
        // @ts-ignore
        if (scrollTo > contentRef.current.scrollHeight) {
            // @ts-ignore
            scrollTo = contentRef.current.scrollHeight;
        }

        // @ts-ignore
       contentRef.current.scrollTop = scrollTo;
    };

    console.log(errorToScroll);

    useEffect(() => {
        if (completed === false && errors.length > 0) {
            let newError = Math.min(...errors);
            const val = +newError - 20;
            let scrollTo = 0;
            if (val > 0) {
                scrollTo = 10.5 + (val - 1) * 16;
            }
            moveToScroll(Math.max(1, scrollTo));
        }
    }, [completed, errors]);

    // // @ts-ignore
    // console.log(contentRef.current.scrollTop);

    return (
        <>
            <Grid className={styles.container} container>
                <Grid item xs={12}>
                    <div>
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
                        <FormControl sx={{ ml: 2 }} size="small">
                            <InputLabel>Count</InputLabel>
                            <OutlinedInput
                                label="Count"
                                value={countRuns}
                                onChange={(e) => {
                                    setCountRuns(e.target.value);
                                }}
                            />
                        </FormControl>
                    </div>
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
                            contentEditable={true}
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
                            onKeyDown={(e) => {
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    document.execCommand(
                                        "insertText",
                                        false,
                                        "    "
                                    );
                                }
                            }}
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
                                        cursor: errorToScroll.has(index)
                                            ? "pointer"
                                            : undefined,
                                    }}
                                    id={index.toString()}
                                    key={index}
                                    onClick={() => {
                                        if (errorToScroll.has(index)) {
                                            const val =
                                                errorToScroll.get(index);
                                            val && moveToScroll(val);
                                        }
                                    }}
                                >
                                    <span className={styles[className]}>
                                        {`[${val.typeOfMessage}]`}{" "}
                                    </span>
                                    <span
                                        className={
                                            errorToScroll.has(index)
                                                ? styles.link
                                                : undefined
                                        }
                                    >
                                        {val.content}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Grid>
            </Grid>
        </>
    );
};
