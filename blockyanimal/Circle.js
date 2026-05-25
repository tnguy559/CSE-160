class Circle {
  constructor() {
    this.type = 'circle';
    this.position = [0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
    this.segments = 10;
  }

  render() {
    var xy   = this.position;
    var rgba = this.color;
    var size = this.size;
    var r    = size / 200.0;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_Size, size);

    // Draw circle as a fan of triangles
    var d = (2 * Math.PI) / this.segments;
    for (var angle = 0; angle < 2 * Math.PI; angle += d) {
      drawTriangle([
        xy[0],                        xy[1],                       // center
        xy[0] + r * Math.cos(angle),  xy[1] + r * Math.sin(angle), // current edge
        xy[0] + r * Math.cos(angle+d),xy[1] + r * Math.sin(angle+d)// next edge
      ]);
    }
  }
}