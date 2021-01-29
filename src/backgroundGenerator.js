import React, { Component } from 'react';

class BackgroundGenerator extends Component
{
    constructor(props) {
        super(props);
        this.state = {
            menuVisible: true,
            bgType: 'hexagonal-tiling',
            hxCubeSize: 40,
            hxSideLength: 10,
            hxFillScreen: true,
            hxColor1: '#D2B48C',
            hxColor2: '#D2691E',
            hxColor3: '#F4A460',
            hxStrokeColor: '#000000',
            hxStrokeWidth: 0,
            hxFlatSurfacesRatio: 0.7,
            btSize: 20,
            btColorHorizontal: '#D2691E',
            btColorVertical: '#F4A460',
            btStrokeColor: '#38f',
            btStrokeWidth: 1,
            btDirectionRatio: 0.5,
        };
      }

    static propMap = [
        ['hxCubeSize','--hexagonal-tiling-size'],
        ['hxSideLength','--hexagonal-tiling-side-length'],
        ['hxFillScreen','--hexagonal-tiling-fill-screen'],
        ['hxColor1','--hexagonal-tiling-color-1'],
        ['hxColor2','--hexagonal-tiling-color-2'],
        ['hxColor3','--hexagonal-tiling-color-3'],
        ['hxStrokeColor','--hexagonal-tiling-stroke-color'],
        ['hxStrokeWidth','--hexagonal-tiling-stroke-width'],
        ['hxFlatSurfacesRatio','--hexagonal-tiling-flat-surfaces-ratio'],

        ['btSize','--brick-tiling-size'],
        ['btColorHorizontal','--brick-tiling-color-horizontal'],
        ['btColorVertical','--brick-tiling-color-vertical'],
        ['btStrokeColor','--brick-tiling-stroke-color'],
        ['btStrokeWidth','--brick-tiling-stroke-width'],
        ['btDirectionRatio','--brick-tiling-rotation-ratio'],
    ]

    componentDidUpdate(prevProps, prevState) {
        if(this.state.bgType !== prevState.bgType) {
            document.getElementById("pageHeader").style.setProperty('background','paint(' + this.state.bgType + '), white')
        }
        BackgroundGenerator.propMap.forEach(el => {
            if(el[0] && this.state[el[0]] !== prevState[el[0]]) {
                document.getElementById("pageHeader").style.setProperty(el[1],this.state[el[0]])
            }
        });
    }

    componentDidMount() {
        document.addEventListener('keypress', this.keyPressListener);
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.keyPressListener)
    }

    keyPressListener = (e) => {
        if(e.code === 'Space') {
            this.setState({
                menuVisible: !this.state.menuVisible
            })
        }
    }

    render() {
        return (<div className="BackgroundGenerator">
        <header id="pageHeader" className={"Bgg-header"} style={{
            
        }}>
            {this.state.menuVisible && (<div id="mySidepanel" className="bgg-sidepanel general-sidepanel">
            Background type
            <div className="whiteSelect">
                <select value={this.state.bgType} onChange={(evt) => this.setState({bgType: evt.target.value})}>
                <option value='hexagonal-tiling'>Lozenges</option>
                <option value='brick-tiling'>Dominos</option>
                </select>
            </div>

            {this.state.bgType === 'hexagonal-tiling' && (<>Cube size: {this.state.hxCubeSize}
            <div className="slidecontainer">
              <input type="range" min="10" max="150" value={this.state.hxCubeSize} onChange={(evt) => this.setState({hxCubeSize: parseInt(evt.target.value)})} className="slider whiteThumb" step="1"/>
            </div>
            Side length: {this.state.hxSideLength}
            <div className="slidecontainer">
              <input type="range" min="1" max="80" value={this.state.hxSideLength} onChange={(evt) => this.setState({hxSideLength: parseInt(evt.target.value)})} className="slider whiteThumb" step="1"/>
            </div>

            <input type="checkbox" id="hxFillScreen" name="todo" value="show" checked={this.state.hxFillScreen} onChange={() => this.setState({hxFillScreen: !this.state.hxFillScreen})}/>
            <label htmlFor="hxFillScreen">Fill screen</label>
            <br />
            <input type="color" id="hxCol1" name="Color 1" value={this.state.hxColor1} onChange={(e) => this.setState({hxColor1: e.target.value})}/>
            <label htmlFor="hxCol1"> Color 1 </label>
            <input type="color" id="hxCol2" name="Color 2" value={this.state.hxColor2} onChange={(e) => this.setState({hxColor2: e.target.value})}/>
            <label htmlFor="hxCol2"> Color 2 </label>
            <input type="color" id="hxCol3" name="Color 3" value={this.state.hxColor3} onChange={(e) => this.setState({hxColor3: e.target.value})}/>
            <label htmlFor="hxCol3"> Color 3</label>
            <br />
            Stroke width: {this.state.hxStrokeWidth}
            <div className="slidecontainer">
              <input type="range" min="0" max="10" value={this.state.hxStrokeWidth} onChange={(evt) => this.setState({hxStrokeWidth: parseInt(evt.target.value)})} className="slider whiteThumb" step="1"/>
            </div>

            <input type="color" id="hxStrokeCol" name="Color 3" value={this.state.hxStrokeColor} onChange={(e) => this.setState({hxStrokeColor: e.target.value})}/>
            <label htmlFor="hxStrokeCol"> Stroke color</label>
            <br />
            Flat surfaces ratio: {this.state.hxFlatSurfacesRatio}
            <div className="slidecontainer">
              <input type="range" min="0" max="100" value={this.state.hxFlatSurfacesRatio * 100} onChange={(evt) => this.setState({hxFlatSurfacesRatio: parseInt(evt.target.value) / 100})} className="slider whiteThumb" step="5"/>
            </div></>)}

            {this.state.bgType === 'brick-tiling' && (<>Size: {this.state.btSize}
            <div className="slidecontainer">
              <input type="range" min="2" max="150" value={this.state.btSize} onChange={(evt) => this.setState({btSize: parseInt(evt.target.value)})} className="slider whiteThumb" step="1"/>
            </div>
            <input type="color" id="btCol1" name="Color 1" value={this.state.btColorHorizontal} onChange={(e) => this.setState({btColorHorizontal: e.target.value})}/>
            <label htmlFor="btCol1"> Horizontal </label>
            <input type="color" id="btCol2" name="Color 2" value={this.state.btColorVertical} onChange={(e) => this.setState({btColorVertical: e.target.value})}/>
            <label htmlFor="btCol2"> Vertical </label>
            <br />
            Stroke width: {this.state.btStrokeWidth}
            <div className="slidecontainer">
              <input type="range" min="0" max="10" value={this.state.btStrokeWidth} onChange={(evt) => this.setState({btStrokeWidth: parseInt(evt.target.value)})} className="slider whiteThumb" step="1"/>
            </div>

            <input type="color" id="btStrokeCol" name="Color 3" value={this.state.btStrokeColor} onChange={(e) => this.setState({btStrokeColor: e.target.value})}/>
            <label htmlFor="btStrokeCol"> Stroke color</label>
            <br />
            Direction ratio: {this.state.btDirectionRatio}
            <div className="slidecontainer">
              <input type="range" min="0" max="100" value={this.state.btDirectionRatio * 100} onChange={(evt) => this.setState({btDirectionRatio: parseInt(evt.target.value) / 100})} className="slider whiteThumb" step="5"/>
            </div>
            </>)}

            F11 - Fullscreen<br />
            Spacebar - Hide this menu
            </div>)}
        </header>
        </div>);
    }
}

export default BackgroundGenerator