import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const Layout: React.FC = () => {
    const navigate = useNavigate();

    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar color="transparent" position="static">
                    <Toolbar>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{ flexGrow: 1 }}
                        >
                            ScriptRunner
                        </Typography>
                        <Button
                            onClick={() => navigate("/")}
                            sx={{ color: "black" }}
                        >
                            Home
                        </Button>
                        <Button
                            onClick={() => navigate("/editor")}
                            sx={{ color: "black" }}
                        >
                            Editor
                        </Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <Outlet />
        </>
    );
};
