import logo from "./logo.svg";
import "./App.css";
import BarChart from "./Components/graphs/Barchart";

function App() {
  return (
    <div className="App">
      <canvas className="webgl" style={{ width: "100%", height: "100%" }}>
        <BarChart />
      </canvas>
    </div>
  );
}

export default App;
