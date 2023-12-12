import { BrowserRouter, Route, Routes } from "react-router-dom";
import { StompSessionProvider } from "react-stomp-hooks";
import "./App.scss";
import { Layout } from "./layout/Layout";
import { EditorPage } from "./pages/EditorPage/EditorPage";
import { HomePage } from "./pages/HomePage/HomePage";

const App = () => {
    
    return (
        <StompSessionProvider url={`${process.env.REACT_APP_SERVER_URL}/console`}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="editor" element={<EditorPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </StompSessionProvider>
    );
};

export default App;
