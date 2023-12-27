import {
    Box,
    LinearProgress,
    LinearProgressProps,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useSubscription } from "react-stomp-hooks";

interface Props {
    uuid: string;
    count: number;
}

export const LinearProgressWithLabel: React.FC<LinearProgressProps & Props> = ({
    uuid,
    count,
    ...linearProgressProps
}) => {
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [currentRun, setCurrentRun] = useState(0);

    useSubscription("/topic/script-progress/" + uuid, (msg) => {
        const res = JSON.parse(msg.body);
        setTimeRemaining(res.estimatedTimeRemaining);
        setCurrentRun(res.currentRun);
    });

    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                    {...linearProgressProps}
                    value={count ? (currentRun / count) * 100 : 0}
                    variant="determinate"
                />
            </Box>
            <Box sx={{ minWidth: 150 }}>
                <Typography variant="body2" color="text.secondary">
                    {timeRemaining / 1000} sec remaining
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {currentRun}/{count}
                </Typography>
            </Box>
        </Box>
    );
};
