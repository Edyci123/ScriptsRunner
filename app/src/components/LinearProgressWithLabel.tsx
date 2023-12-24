import {
    Box,
    LinearProgress,
    LinearProgressProps,
    Typography,
} from "@mui/material";
import React from "react";

interface Props {
    value: number;
}

export const LinearProgressWithLabel: React.FC<LinearProgressProps & Props> = ({
    value,
    ...linearProgressProps
}) => {
    return (
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Box sx={{ width: "100%", mr: 1 }}>
                <LinearProgress
                    value={value}
                    variant="determinate"
                    {...linearProgressProps}
                />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >{`${Math.round(value)}%`}</Typography>
            </Box>
        </Box>
    );
};
