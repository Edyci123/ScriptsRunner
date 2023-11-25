import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.scss";
import { Layout } from "./layout/Layout";
import { HomePage } from "./pages/HomePage/HomePage";
import { EditorPage } from "./pages/EditorPage/EditorPage";

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="editor" element={<EditorPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default App;
