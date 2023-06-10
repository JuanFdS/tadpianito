import React from "react";
import ReactDOM from "react-dom";
import { Piano, KeyboardShortcuts, MidiNumbers } from "react-piano";
import "react-piano/dist/styles.css";

import DimensionsProvider from "./DimensionsProvider";
import SoundfontProvider from "./SoundfontProvider";
import "./styles.css";

// webkitAudioContext fallback needed to support Safari
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundfontHostname = "https://d1pzp51pvbm36p.cloudfront.net";

const noteRange = {
  first: MidiNumbers.fromNote("c3"),
  last: MidiNumbers.fromNote("f4")
};
const keyboardShortcuts = KeyboardShortcuts.create({
  firstNote: noteRange.first,
  lastNote: noteRange.last,
  keyboardConfig: KeyboardShortcuts.HOME_ROW
});

function App() {
  return (
    <div>
      <h1>TadPiano</h1>

      <div className="mt-5">
        <p></p>
        <ResponsivePiano keyboardShortcuts={keyboardShortcuts} />
      </div>
    </div>
  );
}

const CajaDeNotas = (props) => {
  const copyToClipboard = () => {
    var textField = document.createElement("textarea");
    textField.innerText = props.notesSoFar.join(" ");
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    alert("Copiado!");
  };

  return (
    <div>
      <div className="cajaDeNotas">{props.notesSoFar.join(" ")}</div>
      <button onClick={() => copyToClipboard()}> Copiar! </button>
    </div>
  );
};

function BasicPiano() {
  return (
    <SoundfontProvider
      instrumentName="acoustic_grand_piano"
      audioContext={audioContext}
      hostname={soundfontHostname}
      render={({ isLoading, playNote, stopNote, notesSoFar }) => (
        <div>
          <Piano
            noteRange={noteRange}
            width={300}
            playNote={playNote}
            stopNote={stopNote}
            disabled={isLoading}
            keyboardShortcuts={keyboardShortcuts}
          />
          <CajaDeNotas notesSoFar={notesSoFar} />
        </div>
      )}
    />
  );
}

function ResponsivePiano(props) {
  return (
    <DimensionsProvider>
      {({ containerWidth, containerHeight }) => (
        <SoundfontProvider
          instrumentName="acoustic_grand_piano"
          audioContext={audioContext}
          hostname={soundfontHostname}
          render={({ isLoading, playNote, stopNote, notesSoFar }) => (
            <div>
              <Piano
                noteRange={noteRange}
                width={containerWidth}
                playNote={playNote}
                stopNote={stopNote}
                disabled={isLoading}
                {...props}
              />
              <CajaDeNotas notesSoFar={notesSoFar} />
            </div>
          )}
        />
      )}
    </DimensionsProvider>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
