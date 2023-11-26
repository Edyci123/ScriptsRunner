import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import { Layout } from "./layout/Layout";
import { HomePage } from "./pages/HomePage/HomePage";
import { EditorPage } from "./pages/EditorPage/EditorPage";
import { StompSessionProvider } from "react-stomp-hooks";

const App = () => {
    return (
        <StompSessionProvider url="http://localhost:8080/console">
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
