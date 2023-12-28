import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
    Button,
    Checkbox,
    CircularProgress,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    OutlinedInput,
} from "@mui/material";
import _ from "lodash";
import React, { useEffect, useRef, useState } from "react";
import { useSubscription } from "react-stomp-hooks";
import { v4 as uuidv4 } from "uuid";
import { LinearProgressWithLabel } from "../../components/LinearProgressWithLabel";
import { axios } from "../../services/axios";
import styles from "./EditorPage.module.scss";
import { OutputPane } from "./OutputPane";
import { lang } from "../../services/lang";
import { CheckBox } from "@mui/icons-material";

const currentUUID = "5b7b783e-066c-4ade-854f-6aece266afea";

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
    const [isOutputMutliple, setIsOutputMultiple] = useState(false);

    useSubscription("/topic/script-output/" + currentUUID, (msg) => {
        setOutput((prevOutput) => [...prevOutput, JSON.parse(msg.body)]);
    });

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

        Object.keys(langObj).forEach((key) => {
            html = html
                .replace(
                    // @ts-ignore
                    langObj[key],
                    `<i class="${language}_${key}">$1</i>`
                )
                .replaceAll('style="caret-color: black;"', "");
        });
        // @ts-ignore
        contentRef.current.previousElementSibling.innerHTML = html;
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
        if (errors.length !== 0) {
            setErrors([]);
            setErrorToScroll(new Map());
        }
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
        if (countRuns !== "" && parseInt(countRuns) > 1) {
            await axios.post(
                "/run/multiple",
                { scriptContent: trimmedContent.join("\n"), uuid: currentUUID },
                {
                    params: {
                        type: "KTS",
                        count: countRuns,
                        fullOutput: isOutputMutliple,
                    },
                }
            );
        } else {
            await axios.post(
                "/run",
                // @ts-ignore
                { scriptContent: trimmedContent.join("\n"), uuid: currentUUID },
                { params: { type: "KTS" } }
            );
        }
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

                    if (newError) {
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
                                disabled={isLoading}
                                label="Count"
                                value={countRuns}
                                onChange={(e) => {
                                    setCountRuns(e.target.value);
                                }}
                            />
                        </FormControl>
                        <FormControlLabel
                            sx={{ ml: 2 }}
                            disabled={countRuns === ""}
                            control={
                                <Checkbox
                                    checked={isOutputMutliple}
                                    onChange={(e) =>
                                        setIsOutputMultiple(e.target.checked)
                                    }
                                />
                            }
                            label="Show all outputs"
                            labelPlacement="end"
                        />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <LinearProgressWithLabel
                        count={countRuns ? parseInt(countRuns) : 0}
                        uuid={currentUUID}
                        color="success"
                        sx={{ height: 20 }}
                    />
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
                    <OutputPane
                        output={output}
                        errorToScroll={errorToScroll}
                        ref={outputRef}
                        moveToScroll={moveToScroll}
                    />
                </Grid>
            </Grid>
        </>
    );
};
