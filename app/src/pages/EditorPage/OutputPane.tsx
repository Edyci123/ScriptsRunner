import React, { forwardRef } from "react";
import styles from "./EditorPage.module.scss";

interface Props {
    output: Array<{ content: string; typeOfMessage: string }>;
    errorToScroll: Map<number, number>;
    moveToScroll: (scrollTo: number) => void;
}

export const OutputPane = forwardRef<HTMLDivElement, Props>(function OutputPane(
    { output, errorToScroll, moveToScroll },
    outputRef
) {
    return (
        <div ref={outputRef} className={styles.output}>
            {output.map((val, index) => {
                let className = "output_standard";

                if (val.typeOfMessage === "ERROR") {
                    className = "output_error";
                }

                if (val.typeOfMessage === "EXECUTION_TIME") {
                    className = "output_time";
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
                                index === output.length - 1 ? "10px" : 0,
                            cursor: errorToScroll.has(index)
                                ? "pointer"
                                : undefined,
                        }}
                        id={index.toString()}
                        key={index}
                        onClick={() => {
                            if (errorToScroll.has(index)) {
                                const val = errorToScroll.get(index);
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
    );
});
