import React, { Component } from 'react';
import Whopper from './Whopper';
import Dog from './Dog';
import { randomNumBetween } from './helpers';
import whopper_image from './whopper.png';
import dog_image from './dog.png';
import logo from './logo.png';

const KEY = {
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  A: 65,
  D: 68,
  W: 87,
};

export default class Game extends Component {
  constructor() {
    super();
    this.state = {
      screen: {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      },
      context: null,
      keys: {
        left: 0,
        right: 0,
        up: 0,
      },
      dogCount: 3,
      currentScore: 0,
      topScore: localStorage['topscore'] || 0,
      inGame: false
    }
    this.whopper = [];
    this.dogs = [];
  }

  handleResize(value, e) {
    this.setState({
      screen : {
        width: window.innerWidth,
        height: window.innerHeight,
        ratio: window.devicePixelRatio || 1,
      }
    });
  }

  handleKeys(value, e) {
    let keys = this.state.keys;
    if(e.keyCode === KEY.LEFT   || e.keyCode === KEY.A) keys.left  = value;
    if(e.keyCode === KEY.RIGHT  || e.keyCode === KEY.D) keys.right = value;
    if(e.keyCode === KEY.UP     || e.keyCode === KEY.W) keys.up    = value;
    if(e.keyCode === KEY.DOWN   || e.keyCode === KEY.S) keys.down  = value;
    this.setState({
      keys: keys
    });
  }

  componentDidMount() {
    window.addEventListener('keyup',   this.handleKeys.bind(this, false));
    window.addEventListener('keydown', this.handleKeys.bind(this, true));
    window.addEventListener('resize',  this.handleResize.bind(this, false));

    const context = this.refs.canvas.getContext('2d');
    this.setState({ context: context });
    this.startGame();
    requestAnimationFrame(() => {this.update()});
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.handleKeys);
    window.removeEventListener('keydown', this.handleKeys);
    window.removeEventListener('resize', this.handleResize);
  }

  update() {
    const context = this.state.context;
    const keys = this.state.keys;

    context.save();
    context.scale(this.state.screen.ratio, this.state.screen.ratio);

    // Motion trail
    context.fillStyle = 'lightgreen';
    context.globalAlpha = 0.5;
    context.fillRect(0, 0, this.state.screen.width, this.state.screen.height);
    context.globalAlpha = 1;

    this.checkCollisionWith(this.whopper, this.dogs);

    this.updateObjects(this.dogs, 'dogs');
    this.updateObjects(this.whopper, 'whopper');

    context.restore();

    // Next frame
    requestAnimationFrame(() => {this.update()});
  }

  addScore(points) {
    if(this.state.inGame) {
      this.setState({
        currentScore: this.state.currentScore + points,
      });
    }
  }

  startGame() {
    this.setState({
      inGame: true,
      currentScore: 0,
      dogCount: 3
    });

    // Make whopper
    let whopper = new Whopper({
      position: {
        x: 80,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this),
      addScore: this.addScore.bind(this),
      restartGame: this.restartGame.bind(this)
    });
    this.createObject(whopper, 'whopper');

    // Make dogs
    this.dogs = [];
    this.generateDogs(this.state.dogCount)
  }

  restartGame() {
    this.setState({
      inGame: true,
      dogCount: this.state.dogCount + 1
    });

    // Make whopper
    let whopper = new Whopper({
      position: {
        x: 80,
        y: this.state.screen.height/2
      },
      create: this.createObject.bind(this),
      onDie: this.gameOver.bind(this),
      addScore: this.addScore.bind(this),
      restartGame: this.restartGame.bind(this)
    });

    // Make dogs
    this.dogs = [];
    this.generateDogs(this.state.dogCount);
  }

  gameOver() {
    this.setState({
      inGame: false,
    });

    if(this.state.currentScore > this.state.topScore) {
      this.setState({
        topScore: this.state.currentScore,
      });
      localStorage['topscore'] = this.state.currentScore;
    }
  }

  generateDogs(howMany) {
    let dogs = [];

    for (let i = 0; i < howMany; i++) {
      let dog = new Dog({
        size: 80,
        position: {
          x: randomNumBetween(0, this.state.screen.width),
          y: 0
        },
        create: this.createObject.bind(this),
        addScore: this.addScore.bind(this)
      });
      this.createObject(dog, 'dogs');
    }
  }

  createObject(item, group) {
    this[group].push(item);
  }

  updateObjects(items, group) {
    let index = 0;
    for (let item of items) {
      if (item.delete) {
        this[group].splice(index, 1);
      } else {
        items[index].render(this.state);
      }
      index++
    }
  }

  checkCollisionWith(items1, items2) {
    var a = items1.length - 1;
    var b;
    for(a; a > -1; --a) {
      b = items2.length - 1;
      for(b; b > -1; --b) {
        var item1 = items1[a];
        var item2 = items2[b];
        if(this.checkCollision(item1, item2)) {
          item1.destroy();
          item2.destroy();
        }
      }
    }
  }

  checkCollision(obj1, obj2) {
    var vx = obj1.position.x - obj2.position.x;
    var vy = obj1.position.y - obj2.position.y;
    var length = Math.sqrt(vx * vx + vy * vy)
    if(length < obj1.radius + obj2.radius) {
      return true;
    }
    return false;
  }

  render() {
    let endgame;
    let message;

    if (this.state.currentScore <= 0) {
      message = '0 points :(.';
    } else if (this.state.currentScore >= this.state.topScore) {
      message = 'Top score with ' + this.state.currentScore + ' points!';
    } else {
      message = this.state.currentScore + ' Points';
    }

    if(!this.state.inGame) {
      endgame = (
        <div className="endgame">
          <p>Game Over!</p>
          <p>{message}</p>
          <button
            onClick={ this.startGame.bind(this) }>
            Play Again?
          </button>
        </div>
      )
    }

    return (
      <div>
        { endgame }
        <span className="score current-score">Score: {this.state.currentScore}</span>
        <span className="score top-score" >Top Score: {this.state.topScore}</span>
        <img id='whopper-image' src={whopper_image} className="whopper-image" alt="whopper" />
        <img id='dog-image' src={dog_image} className="dog-image" alt="dog" />
        <img id='logo' src={logo} className="logo" alt="logo" />
        <canvas ref="canvas"
          width={this.state.screen.width * this.state.screen.ratio}
          height={this.state.screen.height * this.state.screen.ratio}
        />
      </div>
    );
  }
}
