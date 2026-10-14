import { RouterProvider } from "react-router";
import { router } from "./app.routes";
import { AuthProvider } from "./features/auth/auth.context";
import { ApplicationProvider } from "./features/applications/application.context";

function App() {
  return (
    <AuthProvider>
      <ApplicationProvider>
        <RouterProvider router={router} />
      </ApplicationProvider>
    </AuthProvider>
  );
}

export default App;
