import { RouterProvider, createBrowserRouter } from "react-router-dom";

import CashCounter from "./components/CashCounter"
import Home from "./components/Home"

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/vault",
      element: <CashCounter />,
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
