import { randomNumBetween } from '../helpers';

export default class Dog {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      y: randomNumBetween(1, 1.8)
    }
    this.radius = args.size;
    this.create = args.create;
    this.addScore = args.addScore;
  }

  destroy() {
    this.delete = true;
  }

  render(state) {
    // Move
    this.position.y += this.velocity.y;

    // Screen Edge
    if(this.position.y > state.screen.height) this.position.y = 0;

    // Draw
    let dog_image = document.getElementById('dog-image');
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.drawImage(dog_image, 0, -this.radius, this.radius, this.radius);
    context.stroke();
    context.restore();
  }
}


