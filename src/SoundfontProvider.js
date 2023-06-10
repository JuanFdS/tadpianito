// See https://github.com/danigb/soundfont-player
// for more documentation on prop options.
import React from "react";
import PropTypes from "prop-types";
import Soundfont from "soundfont-player";

class SoundfontProvider extends React.Component {
  static propTypes = {
    instrumentName: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    format: PropTypes.oneOf(["mp3", "ogg"]),
    soundfont: PropTypes.oneOf(["MusyngKite", "FluidR3_GM"]),
    audioContext: PropTypes.instanceOf(window.AudioContext),
    render: PropTypes.func
  };

  static defaultProps = {
    format: "mp3",
    soundfont: "MusyngKite",
    instrumentName: "acoustic_grand_piano"
  };

  constructor(props) {
    super(props);
    this.state = {
      activeAudioNodes: {},
      instrument: null,
      timeNoteOn: {},
      notesSoFar: []
    };
  }

  componentDidMount() {
    this.loadInstrument(this.props.instrumentName);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.instrumentName !== this.props.instrumentName) {
      this.loadInstrument(this.props.instrumentName);
    }
  }

  loadInstrument = (instrumentName) => {
    // Re-trigger loading state
    this.setState({
      instrument: null
    });
    Soundfont.instrument(this.props.audioContext, instrumentName, {
      format: this.props.format,
      soundfont: this.props.soundfont,
      nameToUrl: (name, soundfont, format) => {
        return `${this.props.hostname}/${soundfont}/${name}-${format}.js`;
      }
    }).then((instrument) => {
      this.setState({
        instrument
      });
    });
  };

  playNote = (midiNumber) => {
    this.props.audioContext.resume().then(() => {
      const audioNode = this.state.instrument.play(midiNumber);
      this.setState({
        timeNoteOn: Object.assign({}, this.state.timeNoteOn, {
          [midiNumber]: this.getTimeNow()
        }),
        activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, {
          [midiNumber]: audioNode
        })
      });
    });
  };

  getTimeNow = () => {
    const tempo = 4; // aumentar esto para poder tocar mas rapido
    return Math.floor(Date.now() / (100 / tempo));
  };

  stopNote = (midiNumber) => {
    this.props.audioContext.resume().then(() => {
      if (!this.state.activeAudioNodes[midiNumber]) {
        return;
      }
      console.log(midiNumber);
      const audioNode = this.state.activeAudioNodes[midiNumber];
      audioNode.stop();
      const timeItTook = this.getTimeNow() - this.state.timeNoteOn[midiNumber];
      var figura = null;
      if (timeItTook > 40) {
        figura = "1/1";
      } else if (timeItTook > 20) {
        figura = "1/2";
      } else if (timeItTook > 10) {
        figura = "1/4";
      } else if (timeItTook > 5) {
        figura = "1/8";
      } else {
        figura = "1/16";
      }
      const magicNumber = midiNumber; //ajustando las notas a ojimetro
      const octava = Math.floor(magicNumber / 12);
      const nota = [
        "C",
        "C#",
        "D",
        "D#",
        "E",
        "F",
        "F#",
        "G",
        "G#",
        "A",
        "A#",
        "B"
      ][magicNumber % 12];
      this.setState({
        notesSoFar: this.state.notesSoFar.concat(octava + nota + figura),
        activeAudioNodes: Object.assign({}, this.state.activeAudioNodes, {
          [midiNumber]: null
        })
      });
    });
  };

  // Clear any residual notes that don't get called with stopNote
  stopAllNotes = () => {
    this.props.audioContext.resume().then(() => {
      const activeAudioNodes = Object.values(this.state.activeAudioNodes);
      activeAudioNodes.forEach((node) => {
        if (node) {
          node.stop();
        }
      });
      this.setState({
        activeAudioNodes: {}
      });
    });
  };

  render() {
    return this.props.render({
      isLoading: !this.state.instrument,
      playNote: this.playNote,
      stopNote: this.stopNote,
      stopAllNotes: this.stopAllNotes,
      notesSoFar: this.state.notesSoFar
    });
  }
}

export default SoundfontProvider;
