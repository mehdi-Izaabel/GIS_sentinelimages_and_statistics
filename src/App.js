import "./App.css";
import MapComponent from "./Components/MapComponent";
import { AuthContextProvider } from "./Contexts/Authcontext";

function App() {
  return (
    <div className="App">
      <AuthContextProvider>
        <MapComponent />
      </AuthContextProvider>
    </div>
  );
}

export default App;
