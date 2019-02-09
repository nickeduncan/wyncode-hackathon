export default class Whopper {
  constructor(args) {
    this.position = args.position
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0;
    this.rotationSpeed = 6;
    this.speed = 0.15;
    this.inertia = 0.96;
    this.radius = 40;
    this.create = args.create;
    this.onDie = args.onDie;
    this.addScore = args.addScore;
    this.restartGame = args.restartGame;
  }

  destroy() {
    this.delete = true;
    this.onDie();
  }

  rotate(dir) {
    if (dir == 'LEFT') {
      this.rotation -= this.rotationSpeed;
    }
    if (dir == 'RIGHT') {
      this.rotation += this.rotationSpeed;
    }
  }


  accelerate(val) {
    this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
    this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;
  }

  render(state) {
    // Controls
    if(state.keys.up){
      this.accelerate(1);
    }
    if(state.keys.left){
      this.rotate('LEFT');
    }
    if(state.keys.right){
      this.rotate('RIGHT');
    }

    // Move
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.x *= this.inertia;
    this.velocity.y *= this.inertia;

    // Rotation
    if (this.rotation >= 360) {
      this.rotation -=360;
    }
    if (this.rotation < 0) {
      this.rotation += 360;
    }

    // Screen edges
    if(this.position.x > state.screen.width) {
      this.position.x = 80;
      this.restartGame();
      this.addScore(100);
    }
    else if(this.position.x < 0) this.velocity.x = this.radius;
    if(this.position.y > state.screen.height) this.position.y = 0;
    else if(this.position.y < 0) this.position.y = state.screen.height;

    // Draw
    let whopper_image = document.getElementById('whopper-image');
    const context = state.context;
    context.save();
    context.translate(this.position.x, this.position.y);
    context.rotate(this.rotation * Math.PI / 180);
    context.drawImage(whopper_image, 0, -this.radius, this.radius, this.radius);
    context.stroke();
    context.restore();
  }
}
