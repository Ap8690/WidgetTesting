import { useEffect, useState } from "react";
import "./App.css";
import image from './logo.png'
// import {Widget} from 'unicus-one-widget';

import Widget from "./components/Widget";
function App() {
    const [isOpen, setIsOpen] = useState(false);
    useEffect(()=>{
        console.log(document.getElementById("image"))
    })
    return (
        <div className="App">

            {/* component */}
            <input type="file" id="image"></input>
            <div className="test">
              {  document.getElementById("image") &&<Widget isOpen={isOpen} setIsOpen={setIsOpen} image={document.getElementById("image").files[0]}/>}
            </div>

            {/* widget from unicus-widget */}
            {/* <Widget
      isOpen={isOpen}
      setIsOpen={setIsOpen} /> */}
        </div>
    );
}

export default App;
